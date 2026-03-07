import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { Suspense } from 'react'
import SettingsForm from '@/components/dashboard/SettingsForm'
import BrandingSettings from '@/components/dashboard/BrandingSettings'

// ---------------------------------------------------------------------------
// Error-safe Branding wrapper — keeps the rest of Settings alive if branding
// fails to load (e.g. missing Azure config or upload issues).
// ---------------------------------------------------------------------------

function BrandingFallback() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded bg-slate-200 animate-pulse" />
                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            </div>
            <p className="text-sm text-slate-400 mt-3">Loading branding settings...</p>
        </div>
    )
}

export default async function SettingsPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // Only select fields that actually exist on the User model
    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            email: true,
            image: true,
            companyName: true,
            logoUrl: true,
        }
    })

    // Provide safe defaults for SettingsForm — emailNotifications & marketingEmails
    // are UI-only toggles stored in customSettings (not DB columns yet)
    const userData = {
        name: dbUser?.name ?? null,
        email: dbUser?.email ?? null,
        image: dbUser?.image ?? null,
        emailNotifications: true,
        marketingEmails: false,
    }

    return (
        <div className="space-y-8">
            <SettingsForm user={userData} />
            <Suspense fallback={<BrandingFallback />}>
                <BrandingSettings
                    initialCompanyName={dbUser?.companyName ?? ''}
                    initialLogoUrl={dbUser?.logoUrl ?? ''}
                />
            </Suspense>
        </div>
    )
}