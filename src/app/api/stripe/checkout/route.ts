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

        const { priceId, planType } = await req.json()

        if (!priceId || !planType) {
            return NextResponse.json(
                { error: 'priceId ve planType gerekli' },
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

        // Checkout session oluştur
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
                planType
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