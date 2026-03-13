import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { stripe } from '@/lib/stripe/stripe'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { priceId, planType, billingPeriod } = await req.json()

        if (!priceId || !planType) {
            return NextResponse.json(
                { error: 'priceId and planType are required' },
                { status: 400 }
            )
        }

        // Server-side guard: only accept the 4 known AUD price IDs.
        // For subscription mode the currency is set on the Stripe Price object itself
        // (not overridable at the session level) — all 4 IDs are denominated in AUD.
        const KNOWN_PRICE_IDS = [
            process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
            process.env.NEXT_PUBLIC_STRIPE_PRO_Year_PRICE_ID,
            process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID,
            process.env.NEXT_PUBLIC_STRIPE_BUSINESS_Year_PRICE_ID,
        ].filter(Boolean)

        if (!KNOWN_PRICE_IDS.includes(priceId)) {
            console.error(`Checkout rejected: unknown priceId=${priceId}`)
            return NextResponse.json(
                { error: 'Invalid price ID' },
                { status: 400 }
            )
        }

        // Kullanıcıyı bul
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { subscription: true }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Kullanıcı bulunamadı' },
                { status: 404 }
            )
        }

        // Stripe customer oluştur veya bul
        let customerId = user.stripeCustomerId

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email!,
                name: user.name || undefined,
                metadata: {
                    userId: user.id
                }
            })
            customerId = customer.id

            // Customer ID'yi kaydet
            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customerId }
            })
        }

        // Eğer aktif subscription varsa, portal'a yönlendir
        if (user.subscription?.stripeSubscriptionId && user.subscription.status === 'active') {
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
            })

            return NextResponse.json({ url: portalSession.url })
        }

        // Create checkout session — currency is AUD (set on each Stripe Price object).
        // Explicitly recorded in metadata to prevent any USD confusion in webhooks.
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
            metadata: {
                userId: user.id,
                planType,
                billingPeriod: billingPeriod ?? 'monthly',
                currency: 'aud',
            }
        })

        return NextResponse.json({ url: checkoutSession.url })

    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json(
            { error: 'Ödeme sayfası oluşturulamadı' },
            { status: 500 }
        )
    }
}