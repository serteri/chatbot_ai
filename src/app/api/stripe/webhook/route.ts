import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { prisma } from '@/lib/db/prisma'
import Stripe from 'stripe'

export const runtime = 'nodejs'

// ─── NDIS plan limits ────────────────────────────────────────────────────────
// Keys are the exact planType strings written to the database.
// 'Professional' and 'Business' match the case-sensitive validator check.
const PLAN_LIMITS: Record<string, { maxChatbots: number; maxDocuments: number; maxConversations: number }> = {
    free:           { maxChatbots: 1,  maxDocuments: 3,   maxConversations: 50 },
    Professional:   { maxChatbots: 5,  maxDocuments: 100, maxConversations: 1000 },
    Business:       { maxChatbots: 10, maxDocuments: -1,  maxConversations: -1 },
    enterprise:     { maxChatbots: -1, maxDocuments: -1,  maxConversations: -1 },
}

// ─── Price ID → canonical plan name ─────────────────────────────────────────
// Authoritative mapping from live AUD Stripe Price IDs to DB plan strings.
// Reading from env vars — never hardcode price IDs in source code.
// Returns null + logs a warning if an unrecognised ID arrives (e.g. test-mode
// prices hitting the live webhook endpoint).
function resolvePlanFromPriceId(priceId: string): 'Professional' | 'Business' | null {
    const PRO_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
    const PRO_YEARLY  = process.env.NEXT_PUBLIC_STRIPE_PRO_Year_PRICE_ID
    const BIZ_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID
    const BIZ_YEARLY  = process.env.NEXT_PUBLIC_STRIPE_BUSINESS_Year_PRICE_ID

    if (priceId === PRO_MONTHLY || priceId === PRO_YEARLY)  return 'Professional'
    if (priceId === BIZ_MONTHLY || priceId === BIZ_YEARLY)  return 'Business'

    console.warn(
        `⚠️  Warning: Unknown Price ID received — "${priceId}". ` +
        `Expected one of: PRO_MONTHLY, PRO_YEARLY, BIZ_MONTHLY, BIZ_YEARLY. ` +
        `Verify STRIPE_*_PRICE_ID env vars and Stripe Dashboard.`
    )
    return null
}

// ─── Webhook entry point ─────────────────────────────────────────────────────
// Signature verification with STRIPE_WEBHOOK_SECRET happens here, before any
// handler touches the database.  No plan update ever occurs on an unsigned event.
export async function POST(req: NextRequest) {
    const body      = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`Webhook event received: ${event.type} [${event.id}]`)

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

    } catch (err) {
        console.error('Webhook handler error:', err)
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
    }
}

// ─── checkout.session.completed ─────────────────────────────────────────────
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId

    if (!userId) {
        console.error('Webhook: Missing userId in checkout session metadata', { sessionId: session.id })
        return
    }

    // ── AUD currency guard ───────────────────────────────────────────────────
    // All NDIS Shield Hub prices are in AUD.  A non-AUD payment indicates a
    // misconfigured price or the wrong live/test key mix — alert immediately.
    if (session.currency !== 'aud') {
        console.error(
            `🚨 CRITICAL: Non-AUD payment received! ` +
            `currency=${session.currency} sessionId=${session.id} userId=${userId}. ` +
            `Check Stripe Price objects — all must be denominated in AUD.`
        )
        // Continue processing so the subscription isn't orphaned, but ops MUST investigate.
    }

    // ── Resolve plan from the Price ID on the actual subscription ────────────
    // We deliberately read the priceId from the live subscription object rather
    // than trusting session.metadata.planType, which is set client-side.
    const subscriptionId = session.subscription as string
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = stripeSubscription.items.data[0].price.id

    const planType = resolvePlanFromPriceId(priceId)
    if (!planType) {
        // Unknown price — log and bail. Do not write garbage to the DB.
        console.warn(
            `⚠️  Skipping subscription upsert for userId=${userId}: ` +
            `unrecognised priceId=${priceId}. No DB changes made.`
        )
        return
    }

    const limits = PLAN_LIMITS[planType]

    await prisma.subscription.upsert({
        where: { userId },
        create: {
            userId,
            planType,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: session.customer as string,
            stripePriceId: priceId,
            status: 'active',
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd:   new Date(stripeSubscription.current_period_end   * 1000),
            ...limits,
            conversationsUsed: 0,
        },
        update: {
            planType,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            status: 'active',
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd:   new Date(stripeSubscription.current_period_end   * 1000),
            ...limits,
            conversationsUsed: 0,
        },
    })

    console.log(`✅ Subscription activated — userId=${userId} plan=${planType} priceId=${priceId}`)
}

// ─── customer.subscription.updated ──────────────────────────────────────────
// Handles plan upgrades/downgrades made via the Stripe Billing Portal.
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const periodStart = typeof subscription.current_period_start === 'number'
        ? subscription.current_period_start * 1000
        : Date.parse(subscription.current_period_start as unknown as string)

    const periodEnd = typeof subscription.current_period_end === 'number'
        ? subscription.current_period_end * 1000
        : Date.parse(subscription.current_period_end as unknown as string)

    // Re-resolve plan in case the user switched tiers via the portal
    const priceId  = subscription.items.data[0]?.price.id
    const planType = priceId ? resolvePlanFromPriceId(priceId) : null
    const limits   = planType ? PLAN_LIMITS[planType] : {}

    await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
            status: subscription.status,
            currentPeriodStart: new Date(periodStart),
            currentPeriodEnd:   new Date(periodEnd),
            ...(planType ? { planType, ...limits } : {}),
        },
    })

    console.log(
        `✅ Subscription updated: ${subscription.id}` +
        (planType ? ` → plan=${planType}` : ' (plan unchanged)')
    )
}

// ─── customer.subscription.deleted ──────────────────────────────────────────
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
            status: 'canceled',
            planType: 'free',
            ...PLAN_LIMITS['free'],
        },
    })

    console.log(`✅ Subscription cancelled and downgraded to free: ${subscription.id}`)
}

// ─── invoice.payment_succeeded ───────────────────────────────────────────────
// Fired at the start of each billing cycle — reset usage counters.
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string

    if (subscriptionId) {
        await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: {
                status: 'active',
                conversationsUsed: 0,
            },
        })

        console.log(`✅ Invoice paid — usage reset for subscription: ${subscriptionId}`)
    }
}

// ─── invoice.payment_failed ──────────────────────────────────────────────────
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string

    if (subscriptionId) {
        await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: 'past_due' },
        })

        console.error(`❌ Invoice payment failed for subscription: ${subscriptionId}`)
    }
}
