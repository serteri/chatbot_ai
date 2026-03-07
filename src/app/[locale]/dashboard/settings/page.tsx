import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import SettingsForm from '@/components/dashboard/SettingsForm'
import BrandingSettings from '@/components/dashboard/BrandingSettings'

export default async function SettingsPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            email: true,
            image: true,
            companyName: true,
            logoUrl: true,
            emailNotifications: true,
            customSettings: true,
        }
    })

    const customSettings = (dbUser?.customSettings as any) || {}

    const userData = {
        name: dbUser?.name,
        email: dbUser?.email,
        image: dbUser?.image,
        emailNotifications: dbUser?.emailNotifications ?? true,
        marketingEmails: customSettings.marketingEmails ?? false
    }

    return (
        <div className="space-y-8">
            <SettingsForm user={userData} />
            <BrandingSettings
                initialCompanyName={dbUser?.companyName || ''}
                initialLogoUrl={dbUser?.logoUrl || ''}
            />
        </div>
    )
}