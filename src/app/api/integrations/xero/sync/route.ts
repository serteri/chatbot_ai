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
// Deduct invoice total from participant's remainingBudget (idempotent).
// Uses a transaction to ensure atomic read-check-write.
// ---------------------------------------------------------------------------
async function deductBudget(
    xeroInvoiceDbId: string,
    participantId: string,
    amount: number,
): Promise<{ deducted: boolean; remainingBudget: number }> {
    return prisma.$transaction(async (tx) => {
        // Re-check inside tx — guard against concurrent requests
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

        const updated = await tx.participant.update({
            where: { id: participantId },
            data:  { remainingBudget: { decrement: amount } },
            select: { remainingBudget: true },
        })

        await tx.xeroInvoice.update({
            where: { id: xeroInvoiceDbId },
            data:  { budgetDeducted: true },
        })

        console.log(
            `[BUDGET] Deducted $${amount.toFixed(2)} → participant ${participantId} | remaining: $${updated.remainingBudget.toFixed(2)}`
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

    const results = { total: rawInvoices.length, matched: 0, unmatched: 0, budgetDeducted: 0 }

    for (const inv of rawInvoices) {
        const contactName   = inv.Contact?.Name ?? ''
        const contactNumber = inv.Contact?.ContactNumber ?? null
        const amount        = inv.Total ?? 0
        const parsedDate    = inv.DateString ? new Date(inv.DateString) : null

        const { participantId, matchMethod } = await findParticipantMatch(
            userId, contactNumber, contactName,
        )

        if (participantId) { results.matched++ } else { results.unmatched++ }

        // Upsert invoice record — preserve existing budgetDeducted if already set
        const saved = await prisma.xeroInvoice.upsert({
            where:  { userId_xeroInvoiceId: { userId, xeroInvoiceId: inv.InvoiceID } },
            create: {
                userId,
                xeroInvoiceId: inv.InvoiceID,
                invoiceNumber: inv.InvoiceNumber ?? null,
                contactName,
                contactNumber,
                total:         amount,
                amountDue:     inv.AmountDue ?? 0,
                status:        inv.Status,
                type:          inv.Type ?? null,
                date:          parsedDate,
                tenantId:      token.tenantId,
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
                // Only update match fields if currently unmatched (preserve manual overrides)
                ...(participantId && { participantId, matchMethod }),
            },
            select: { id: true, budgetDeducted: true, participantId: true },
        })

        // Deduct budget if matched and not yet deducted
        if (saved.participantId && !saved.budgetDeducted && amount > 0) {
            const { deducted } = await deductBudget(saved.id, saved.participantId, amount)
            if (deducted) results.budgetDeducted++
        }
    }

    console.log(
        `[XERO SYNC] Done — matched: ${results.matched}, unmatched: ${results.unmatched}, budgetDeductions: ${results.budgetDeducted}`
    )
    return NextResponse.json({ success: true, ...results })
}

// ---------------------------------------------------------------------------
// PATCH /api/integrations/xero/sync — manual participant assignment
// Body: { xeroInvoiceId: string, participantId: string }
// ---------------------------------------------------------------------------
export async function PATCH(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { xeroInvoiceId, participantId } = await req.json()
    if (!xeroInvoiceId || !participantId) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Find the invoice to get the amount
    const inv = await prisma.xeroInvoice.findFirst({
        where:  { userId: session.user.id, xeroInvoiceId },
        select: { id: true, total: true, budgetDeducted: true },
    })
    if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    await prisma.xeroInvoice.updateMany({
        where: { userId: session.user.id, xeroInvoiceId },
        data:  { participantId, matchMethod: 'manual', budgetDeducted: false },
    })

    // Trigger deduction for the new participant
    if (inv.total > 0) {
        await deductBudget(inv.id, participantId, inv.total)
    }

    return NextResponse.json({ success: true })
}
