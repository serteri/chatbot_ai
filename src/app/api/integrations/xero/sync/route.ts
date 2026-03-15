import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getValidXeroToken } from '@/lib/xero/client'
import { prisma } from '@/lib/db/prisma'

const XERO_API_BASE = 'https://api.xero.com/api.xro/2.0'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface XeroContact {
    ContactID:     string
    Name:          string
    ContactNumber: string | null
}
interface XeroInvoiceRaw {
    InvoiceID:     string
    InvoiceNumber: string
    Status:        string
    Type:          string
    DateString:    string
    Total:         number
    AmountDue:     number
    Contact:       XeroContact
}

type MatchMethod = 'ndis_number' | 'name' | null

// ---------------------------------------------------------------------------
// Auto-match: ContactNumber → ndisNumber (exact), then Name → fullName (ci)
// ---------------------------------------------------------------------------
async function findParticipantMatch(
    userId: string,
    contactNumber: string | null,
    contactName: string,
): Promise<{ participantId: string | null; matchMethod: MatchMethod }> {
    if (contactNumber?.trim()) {
        const hit = await prisma.participant.findFirst({
            where:  { userId, ndisNumber: contactNumber.trim() },
            select: { id: true },
        })
        if (hit) return { participantId: hit.id, matchMethod: 'ndis_number' }
    }

    const hit = await prisma.participant.findFirst({
        where:  { userId, fullName: { equals: contactName.trim(), mode: 'insensitive' } },
        select: { id: true },
    })
    if (hit) return { participantId: hit.id, matchMethod: 'name' }

    return { participantId: null, matchMethod: null }
}

// ---------------------------------------------------------------------------
// Idempotent budget deduction + BudgetTransaction log.
// Returns { deducted: true } only when a NEW deduction was applied.
// ---------------------------------------------------------------------------
async function deductBudget(opts: {
    xeroInvoiceDbId: string
    participantId:   string
    userId:          string
    amount:          number
    invoiceNumber:   string | null
    invoiceDate:     Date | null
}): Promise<{ deducted: boolean; remainingBudget: number }> {
    const { xeroInvoiceDbId, participantId, userId, amount, invoiceNumber, invoiceDate } = opts

    return prisma.$transaction(async (tx) => {
        // Re-read inside tx — prevent double-deduction under concurrency
        const inv = await tx.xeroInvoice.findUnique({
            where:  { id: xeroInvoiceDbId },
            select: { budgetDeducted: true },
        })
        if (!inv || inv.budgetDeducted) {
            const p = await tx.participant.findUnique({
                where:  { id: participantId },
                select: { remainingBudget: true },
            })
            return { deducted: false, remainingBudget: p?.remainingBudget ?? 0 }
        }

        // Decrement budget
        const updated = await tx.participant.update({
            where:  { id: participantId },
            data:   { remainingBudget: { decrement: amount } },
            select: { remainingBudget: true },
        })

        // Mark invoice as deducted
        await tx.xeroInvoice.update({
            where: { id: xeroInvoiceDbId },
            data:  { budgetDeducted: true },
        })

        // Write transaction log
        await tx.budgetTransaction.create({
            data: {
                userId,
                participantId,
                invoiceId:     xeroInvoiceDbId,
                invoiceNumber: invoiceNumber ?? null,
                amount,
                type:          'XERO_SYNC',
                note:          `Auto-deducted via Xero sync`,
                date:          invoiceDate ?? new Date(),
            },
        })

        console.log(
            `[BUDGET] -$${amount.toFixed(2)} | inv: ${invoiceNumber ?? xeroInvoiceDbId} | remaining: $${updated.remainingBudget.toFixed(2)}`
        )

        return { deducted: true, remainingBudget: updated.remainingBudget }
    })
}

// ---------------------------------------------------------------------------
// POST /api/integrations/xero/sync
// ---------------------------------------------------------------------------
export async function POST() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const token = await getValidXeroToken(userId)
    if (!token) {
        return NextResponse.json({ error: 'not_connected' }, { status: 400 })
    }

    const res = await fetch(
        `${XERO_API_BASE}/Invoices?pageSize=100&order=Date+DESC&where=Type%3D%3D%22ACCREC%22`,
        {
            headers: {
                Authorization:    `Bearer ${token.accessToken}`,
                'Xero-Tenant-Id': token.tenantId,
                Accept:           'application/json',
            },
        }
    )

    if (!res.ok) {
        const body = await res.text()
        if (res.status === 403) {
            console.error('[XERO SYNC] 403 Forbidden — missing scope: accounting.invoices.read')
            console.error('[XERO SYNC] Response:', body)
            return NextResponse.json(
                { error: 'forbidden', missing_scope: 'accounting.invoices.read' },
                { status: 403 }
            )
        }
        console.error('[XERO SYNC] Xero API error:', res.status, body)
        return NextResponse.json({ error: 'xero_api_error' }, { status: 502 })
    }

    const data = await res.json()
    const rawInvoices: XeroInvoiceRaw[] = data.Invoices ?? []
    console.log(`[XERO SYNC] Fetched ${rawInvoices.length} invoices from Xero`)

    let newDeductions = 0
    let matched       = 0
    let unmatched     = 0

    for (const inv of rawInvoices) {
        const contactName   = inv.Contact?.Name ?? ''
        const contactNumber = inv.Contact?.ContactNumber ?? null
        const amount        = inv.Total ?? 0
        const parsedDate    = inv.DateString ? new Date(inv.DateString) : null

        const { participantId, matchMethod } = await findParticipantMatch(
            userId, contactNumber, contactName,
        )

        if (participantId) { matched++ } else { unmatched++ }

        // Upsert invoice
        const saved = await prisma.xeroInvoice.upsert({
            where:  { userId_xeroInvoiceId: { userId, xeroInvoiceId: inv.InvoiceID } },
            create: {
                userId,
                xeroInvoiceId:  inv.InvoiceID,
                invoiceNumber:  inv.InvoiceNumber ?? null,
                contactName,
                contactNumber,
                total:          amount,
                amountDue:      inv.AmountDue ?? 0,
                status:         inv.Status,
                type:           inv.Type ?? null,
                date:           parsedDate,
                tenantId:       token.tenantId,
                participantId,
                matchMethod,
                budgetDeducted: false,
            },
            update: {
                invoiceNumber: inv.InvoiceNumber ?? null,
                contactName,
                contactNumber,
                total:         amount,
                amountDue:     inv.AmountDue ?? 0,
                status:        inv.Status,
                type:          inv.Type ?? null,
                date:          parsedDate,
                // Preserve manual overrides — only set if currently unmatched
                ...(participantId && { participantId, matchMethod }),
            },
            select: {
                id:             true,
                budgetDeducted: true,
                participantId:  true,
                invoiceNumber:  true,
                date:           true,
            },
        })

        // Deduct if matched and not yet deducted
        if (saved.participantId && !saved.budgetDeducted && amount > 0) {
            const { deducted } = await deductBudget({
                xeroInvoiceDbId: saved.id,
                participantId:   saved.participantId,
                userId,
                amount,
                invoiceNumber:   saved.invoiceNumber,
                invoiceDate:     saved.date,
            })
            if (deducted) newDeductions++
        }
    }

    // ── Bug fix: cumulative total from DB (correct even across multiple syncs) ──
    const totalBudgetDeducted = await prisma.xeroInvoice.count({
        where: { userId, budgetDeducted: true },
    })

    console.log(
        `[XERO SYNC] Done — matched: ${matched}, unmatched: ${unmatched}, new deductions: ${newDeductions}, total deducted: ${totalBudgetDeducted}`
    )

    return NextResponse.json({
        success:            true,
        total:              rawInvoices.length,
        matched,
        unmatched,
        newDeductions,          // Deducted in THIS sync run
        budgetDeducted:         totalBudgetDeducted,  // Cumulative total (fixes the 0 bug)
    })
}

// ---------------------------------------------------------------------------
// PATCH /api/integrations/xero/sync — manual participant assignment
// ---------------------------------------------------------------------------
export async function PATCH(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { xeroInvoiceId, participantId } = await req.json()
    if (!xeroInvoiceId || !participantId) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const inv = await prisma.xeroInvoice.findFirst({
        where:  { userId, xeroInvoiceId },
        select: { id: true, total: true, invoiceNumber: true, date: true },
    })
    if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    await prisma.xeroInvoice.updateMany({
        where: { userId, xeroInvoiceId },
        data:  { participantId, matchMethod: 'manual', budgetDeducted: false },
    })

    if (inv.total > 0) {
        await deductBudget({
            xeroInvoiceDbId: inv.id,
            participantId,
            userId,
            amount:        inv.total,
            invoiceNumber: inv.invoiceNumber,
            invoiceDate:   inv.date,
        })
    }

    return NextResponse.json({ success: true })
}
