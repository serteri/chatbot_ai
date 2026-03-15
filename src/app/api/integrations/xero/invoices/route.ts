import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = await prisma.xeroToken.findUnique({
        where:  { userId: session.user.id },
        select: { tenantName: true },
    })
    if (!token) {
        return NextResponse.json({ error: 'not_connected' }, { status: 400 })
    }

    const invoices = await prisma.xeroInvoice.findMany({
        where:   { userId: session.user.id },
        orderBy: { date: 'desc' },
        take:    20,
        select: {
            id:             true,
            xeroInvoiceId:  true,
            invoiceNumber:  true,
            contactName:    true,
            contactNumber:  true,
            total:          true,
            amountDue:      true,
            status:         true,
            date:           true,
            matchMethod:    true,
            budgetDeducted: true,
            participant: {
                select: {
                    id:              true,
                    fullName:        true,
                    ndisNumber:      true,
                    totalBudget:     true,
                    remainingBudget: true,
                },
            },
        },
    })

    return NextResponse.json({ invoices, tenantName: token.tenantName })
}
