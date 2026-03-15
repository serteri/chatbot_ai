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
    ContactNumber: string | null  // Often maps to NDIS number
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
// Auto-match logic: ContactNumber → ndisNumber, then Name → fullName (ci)
// ---------------------------------------------------------------------------
async function findParticipantMatch(
    userId: string,
    contactNumber: string | null,
    contactName: string,
): Promise<{ participantId: string | null; matchMethod: MatchMethod }> {
    // Priority 1 — exact NDIS number match
    if (contactNumber?.trim()) {
        const byNdis = await prisma.participant.findFirst({
            where: { userId, ndisNumber: contactNumber.trim() },
            select: { id: true },
        })
        if (byNdis) {
            return { participantId: byNdis.id, matchMethod: 'ndis_number' }
        }
    }

    // Priority 2 — case-insensitive full name match
    const byName = await prisma.participant.findFirst({
        where: {
            userId,
            fullName: { equals: contactName.trim(), mode: 'insensitive' },
        },
        select: { id: true },
    })
    if (byName) {
        return { participantId: byName.id, matchMethod: 'name' }
    }

    return { participantId: null, matchMethod: null }
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

    // Fetch invoices with full Contact fields (ContactNumber needed for matching)
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

    // Process each invoice: match then upsert
    const results = { matched: 0, unmatched: 0, total: rawInvoices.length }

    for (const inv of rawInvoices) {
        const contactName   = inv.Contact?.Name ?? ''
        const contactNumber = inv.Contact?.ContactNumber ?? null

        const { participantId, matchMethod } = await findParticipantMatch(
            userId,
            contactNumber,
            contactName,
        )

        if (participantId) { results.matched++ } else { results.unmatched++ }

        const parsedDate = inv.DateString ? new Date(inv.DateString) : null

        await prisma.xeroInvoice.upsert({
            where:  { userId_xeroInvoiceId: { userId, xeroInvoiceId: inv.InvoiceID } },
            create: {
                userId,
                xeroInvoiceId: inv.InvoiceID,
                invoiceNumber: inv.InvoiceNumber ?? null,
                contactName,
                contactNumber,
                total:         inv.Total ?? 0,
                amountDue:     inv.AmountDue ?? 0,
                status:        inv.Status,
                type:          inv.Type ?? null,
                date:          parsedDate,
                tenantId:      token.tenantId,
                participantId,
                matchMethod,
            },
            update: {
                invoiceNumber: inv.InvoiceNumber ?? null,
                contactName,
                contactNumber,
                total:         inv.Total ?? 0,
                amountDue:     inv.AmountDue ?? 0,
                status:        inv.Status,
                type:          inv.Type ?? null,
                date:          parsedDate,
                // Preserve manual matches — only auto-update if currently unmatched
                ...(participantId ? { participantId, matchMethod } : {}),
            },
        })
    }

    console.log(`[XERO SYNC] Done — matched: ${results.matched}, unmatched: ${results.unmatched}`)
    return NextResponse.json({ success: true, ...results })
}

// ---------------------------------------------------------------------------
// PATCH /api/integrations/xero/sync  — manual match override
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

    const updated = await prisma.xeroInvoice.updateMany({
        where:  { userId: session.user.id, xeroInvoiceId },
        data:   { participantId, matchMethod: 'manual' },
    })

    return NextResponse.json({ success: true, updated: updated.count })
}
