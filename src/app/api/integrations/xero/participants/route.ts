import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

/**
 * GET /api/integrations/xero/participants
 * Returns all participants for the authenticated user, with:
 *  - Budget summary (total, remaining, % used)
 *  - Matched invoice count
 *  - Last 5 BudgetTransactions for the history modal
 */
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const participants = await prisma.participant.findMany({
        where:   { userId: session.user.id },
        orderBy: { fullName: 'asc' },
        select: {
            id:              true,
            fullName:        true,
            ndisNumber:      true,
            status:          true,
            totalBudget:     true,
            remainingBudget: true,
            _count: {
                select: { invoices: true },
            },
            budgetTransactions: {
                orderBy: { date: 'desc' },
                take:    5,
                select: {
                    id:            true,
                    invoiceNumber: true,
                    amount:        true,
                    type:          true,
                    note:          true,
                    date:          true,
                },
            },
        },
    })

    const result = participants.map(p => ({
        id:               p.id,
        fullName:         p.fullName,
        ndisNumber:       p.ndisNumber,
        status:           p.status,
        totalBudget:      p.totalBudget,
        remainingBudget:  p.remainingBudget,
        usedBudget:       p.totalBudget - p.remainingBudget,
        invoiceCount:     p._count.invoices,
        isLowBudget:      p.totalBudget > 0 && (p.remainingBudget / p.totalBudget) < 0.15,
        pctRemaining:     p.totalBudget > 0
            ? Math.max(0, Math.min(100, (p.remainingBudget / p.totalBudget) * 100))
            : 0,
        recentTransactions: p.budgetTransactions,
    }))

    return NextResponse.json({ participants: result })
}
