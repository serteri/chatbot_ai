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

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user?.stripeCustomerId) {
            return NextResponse.json(
                { error: 'Henüz aktif bir aboneliğiniz yok. Önce bir plan satın alın.' },
                { status: 404 }
            )
        }

        // Billing portal session oluştur
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        })

        return NextResponse.json({ url: portalSession.url })

    } catch (error) {
        console.error('Portal error:', error)
        return NextResponse.json(
            { error: 'Portal oluşturulamadı' },
            { status: 500 }
        )
    }
}