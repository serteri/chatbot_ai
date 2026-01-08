import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/layout/DashboardNav'
import { Footer } from '@/components/Footer'
import { SessionProvider } from 'next-auth/react'

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

    return (
        <SessionProvider session={session}>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <DashboardNav user={session.user} />
                <main className="flex-1">{children}</main>
                <Footer locale={locale} variant="dashboard" />
            </div>
        </SessionProvider>
    )
}