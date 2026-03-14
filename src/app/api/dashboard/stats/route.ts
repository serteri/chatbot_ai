import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

/**
 * GET /api/dashboard/stats
 *
 * Returns aggregated claim financials scoped to the authenticated user.
 * All amounts are in AUD.
 */
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const [totalCount, verifiedAgg, draftAgg, readyForExport] = await Promise.all([
        // Total claims ever created
        prisma.claim.count({ where: { userId } }),

        // Verified — financial sum + count
        prisma.claim.aggregate({
            where: { userId, status: 'VERIFIED' },
            _sum: { totalClaimAmount: true },
        }),

        // Draft — financial sum
        prisma.claim.aggregate({
            where: { userId, status: 'DRAFT' },
            _sum: { totalClaimAmount: true },
        }),

        // Ready to export to PRODA = VERIFIED claims
        prisma.claim.count({ where: { userId, status: 'VERIFIED' } }),
    ])

    return NextResponse.json({
        totalVerifiedAmount: verifiedAgg._sum.totalClaimAmount ?? 0,
        totalDraftAmount:    draftAgg._sum.totalClaimAmount    ?? 0,
        totalClaimsCount:    totalCount,
        readyForExport,
    })
}
