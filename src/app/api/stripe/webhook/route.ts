import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { prisma } from '@/lib/db/prisma'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const PLAN_LIMITS: Record<string, { maxChatbots: number; maxDocuments: number; maxConversations: number }> = {
    'free': { maxChatbots: 1, maxDocuments: 3, maxConversations: 50 },
    'pro': { maxChatbots: 5, maxDocuments: 50, maxConversations: 1000 },
    'enterprise': { maxChatbots: -1, maxDocuments: -1, maxConversations: -1 } // -1 = unlimited
}

export async function POST(req: NextRequest) {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json(
            { error: 'No signature' },
            { status: 400 }
        )
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error) {
        console.error('Webhook signature verification failed:', error)
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        )
    }

    console.log('Webhook event:', event.type)

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                await handleCheckoutCompleted(session)
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                await handleSubscriptionUpdated(subscription)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                await handleSubscriptionDeleted(subscription)
                break
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice
                await handleInvoicePaymentSucceeded(invoice)
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                await handleInvoicePaymentFailed(invoice)
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error('Webhook handler error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}

/**
 * Checkout tamamlandığında
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId
    const planType = session.metadata?.planType as 'pro' | 'enterprise'

    if (!userId || !planType) {
        console.error('Missing metadata in checkout session')
        return
    }

    const subscriptionId = session.subscription as string
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)

    const limits = PLAN_LIMITS[planType]

    // Subscription oluştur veya güncelle
    await prisma.subscription.upsert({
        where: { userId },
        create: {
            userId,
            planType,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: session.customer as string,
            stripePriceId: stripeSubscription.items.data[0].price.id,
            status: 'active',
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            ...limits,
            conversationsUsed: 0
        },
        update: {
            planType,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: stripeSubscription.items.data[0].price.id,
            status: 'active',
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            ...limits,
            conversationsUsed: 0
        }
    })

    console.log(`✅ Subscription created for user ${userId}`)
}

/**
 * Subscription güncellendiğinde
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
    })

    console.log(`✅ Subscription updated: ${subscription.id}`)
}

/**
 * Subscription iptal edildiğinde
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
            status: 'canceled',
            planType: 'free',
            ...PLAN_LIMITS['free']
        }
    })

    console.log(`✅ Subscription deleted: ${subscription.id}`)
}

/**
 * Fatura ödemesi başarılı
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string

    if (subscriptionId) {
        await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: {
                status: 'active',
                conversationsUsed: 0 // Yeni dönem başladı, sıfırla
            }
        })

        console.log(`✅ Invoice paid for subscription: ${subscriptionId}`)
    }
}

/**
 * Fatura ödemesi başarısız
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string

    if (subscriptionId) {
        await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: 'past_due' }
        })

        console.log(`❌ Invoice payment failed for subscription: ${subscriptionId}`)
    }
}