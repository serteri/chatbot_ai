import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/layout/DashboardNav'
import { SessionProvider } from 'next-auth/react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  return (
      <SessionProvider session={session}>
          <div className="min-h-screen bg-gray-50">
              <DashboardNav user={session.user} />
              <main>{children}</main>
          </div>
      </SessionProvider>
  )
}