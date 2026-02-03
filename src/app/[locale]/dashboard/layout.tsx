import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/layout/DashboardNav'
import { Footer } from '@/components/Footer'
import { SessionProvider } from 'next-auth/react'
import { prisma } from '@/lib/db/prisma'
import { EnterpriseWhatsAppSupport } from '@/components/support/EnterpriseWhatsAppSupport'

export const metadata = {
    robots: {
        index: false,
        follow: false
    }
}

interface DashboardLayoutProps {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}

export default async function DashboardLayout({
    children,
    params
}: DashboardLayoutProps) {
    const session = await auth()
    const { locale } = await params

    if (!session?.user) {
        redirect(`/${locale}/auth/login`)
    }

    // Fetch user's subscription plan
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: true }
    })

    const planType = user?.subscription?.planType || 'free'

    return (
        <SessionProvider session={session}>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <DashboardNav user={session.user} planType={planType} />
                <main className="flex-1">{children}</main>
                <Footer locale={locale} variant="dashboard" />
                {/* Floating WhatsApp Support Button for Enterprise users */}
                <EnterpriseWhatsAppSupport planType={planType} locale={locale} />
            </div>
        </SessionProvider>
    )
}
