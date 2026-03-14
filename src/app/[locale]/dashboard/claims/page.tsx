import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import ClaimsClient from '@/components/dashboard/ClaimsClient'

export default async function ClaimsDashboardPage() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            redirect('/login')
        }

        // Fetch live claims from the database exclusively mapped to the authenticated user
        const claims = await prisma.claim.findMany({
            where: { userId: session.user.id },
            orderBy: { supportDeliveredDate: 'desc' },
        })

        // Temporary debug log to trace crash
        console.log('🛡️ [DEBUG] Raw Claims Data:', JSON.stringify(claims.slice(0, 3), null, 2))

        // Data normalization for safety
        const safeClaims = claims.map(claim => ({
            ...claim,
            status: claim.status || 'DRAFT',
            updatedBy: claim.updatedBy || 'System'
        }))

        return <ClaimsClient claims={safeClaims as any} />
    } catch (error) {
        console.error('❌ [CRITIICAL] Claims Page Crash:', error)
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
                <p className="text-slate-600">We encountered an error loading your claims. This has been logged for our engineers.</p>
                <div className="mt-4 p-4 bg-slate-100 rounded text-xs font-mono text-left max-w-lg overflow-auto">
                    {String(error)}
                </div>
            </div>
        )
    }
}
