/**
 * PRODA Export API
 *
 * GET  ?count=true  → { pending: number, alreadyClaimed: number }  (preview, no side effects)
 * GET               → Downloads PRODA CSV + marks invoices as claimed
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getValidXeroToken } from '@/lib/xero/client'
import { prisma } from '@/lib/db/prisma'
import { randomBytes } from 'crypto'

const XERO_API_BASE = 'https://api.xero.com/api.xro/2.0'

// ---------------------------------------------------------------------------
// NDIS PRODA Bulk Upload — column spec
// Ref: https://www.ndis.gov.au/providers/working-provider/managing-your-payments
// ---------------------------------------------------------------------------
const CSV_HEADERS = [
    'RegistrationNumber',   // Provider registration number
    'NDISNumber',           // Participant NDIS number (9 digits)
    'SupportItemNumber',    // Support catalogue item code (e.g. 01_002_0107_1_1)
    'ClaimReference',       // Your invoice/reference number
    'Quantity',             // Units delivered
    'Hours',                // Leave blank unless time-based
    'UnitPrice',            // Price per unit
    'GSTCode',              // NO GST (most NDIS supports are GST-free)
    'SupportDeliveredFrom', // yyyy-mm-dd
    'SupportDeliveredTo',   // yyyy-mm-dd
    'CancellationReason',   // Leave blank unless cancellation
    'ABNofSupportProvider', // Provider ABN
    'ClaimType',            // NDIS (agency-managed) or PLAN (plan-managed)
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function csvEscape(v: string | number | null | undefined): string {
    const s = v == null ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s
}

function csvRow(values: (string | number | null | undefined)[]): string {
    return values.map(csvEscape).join(',')
}

function isoDate(d: Date | null | undefined): string {
    if (!d) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

// ---------------------------------------------------------------------------
// Fetch Xero line items for one invoice (returns [] on failure)
// ---------------------------------------------------------------------------
async function fetchLineItems(
    xeroInvoiceId: string,
    accessToken:   string,
    tenantId:      string,
) {
    try {
        const res = await fetch(`${XERO_API_BASE}/Invoices/${xeroInvoiceId}`, {
            headers: {
                Authorization:    `Bearer ${accessToken}`,
                'Xero-Tenant-Id': tenantId,
                Accept:           'application/json',
            },
        })
        if (!res.ok) return []
        const data = await res.json()
        return (data.Invoices?.[0]?.LineItems ?? []) as Array<{
            ItemCode:    string | null
            Description: string | null
            Quantity:    number
            UnitAmount:  number
        }>
    } catch {
        return []
    }
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId    = session.user.id
    const isPreview = req.nextUrl.searchParams.get('count') === 'true'

    // ── Provider info from Settings ─────────────────────────────────────
    const user = await prisma.user.findUnique({
        where:  { id: userId },
        select: { ndisProviderNumber: true, abn: true, companyName: true },
    })

    const registrationNum = user?.ndisProviderNumber?.trim() ?? ''
    const abn             = user?.abn?.trim() ?? ''

    if (!registrationNum) {
        return NextResponse.json(
            { error: 'missing_provider_number',
              message: 'NDIS Provider Registration Number is not set in Settings.' },
            { status: 400 }
        )
    }

    // ── Count pending invoices (unclaimed, matched, budget-deducted) ────
    const pendingWhere = {
        userId,
        budgetDeducted: true,
        participantId:  { not: null as null },
        claimedAt:      null,
    }

    if (isPreview) {
        const pending      = await prisma.xeroInvoice.count({ where: pendingWhere })
        const alreadyClaimed = await prisma.xeroInvoice.count({
            where: { userId, budgetDeducted: true, claimedAt: { not: null } },
        })
        return NextResponse.json({ pending, alreadyClaimed })
    }

    // ── Fetch unclaimed invoices ─────────────────────────────────────────
    const dbInvoices = await prisma.xeroInvoice.findMany({
        where:   pendingWhere,
        orderBy: { date: 'asc' },
        select: {
            id:            true,
            xeroInvoiceId: true,
            invoiceNumber:  true,
            total:          true,
            date:           true,
            participant: {
                select: { ndisNumber: true, fullName: true },
            },
        },
    })

    if (dbInvoices.length === 0) {
        return NextResponse.json(
            { error: 'no_pending_invoices',
              message: 'No unclaimed invoices found. All matched invoices may already be claimed.' },
            { status: 400 }
        )
    }

    // ── Xero token for line-item fetching ────────────────────────────────
    const token = await getValidXeroToken(userId)
    if (!token) {
        return NextResponse.json({ error: 'not_connected' }, { status: 400 })
    }

    // ── Build CSV ────────────────────────────────────────────────────────
    const batchId    = randomBytes(6).toString('hex').toUpperCase()
    const exportedAt = new Date()
    const claimedIds: string[] = []

    // Metadata comment at top (not parsed by PRODA but useful for auditing)
    const metaLines = [
        `# NDIS PRODA Bulk Upload — Generated ${exportedAt.toISOString()}`,
        `# Provider: ${user?.companyName ?? ''} | Reg: ${registrationNum} | ABN: ${abn}`,
        `# Batch ID: ${batchId} | Invoices: ${dbInvoices.length}`,
    ]

    const dataRows: string[] = [csvRow(CSV_HEADERS)]

    for (const inv of dbInvoices) {
        const ndisNumber    = inv.participant?.ndisNumber?.trim() ?? ''
        const deliveredFrom = isoDate(inv.date)
        const deliveredTo   = isoDate(inv.date)  // single-day default; adjust if multi-day

        // Fetch line items from Xero (Support Item Number)
        const lineItems = await fetchLineItems(
            inv.xeroInvoiceId, token.accessToken, token.tenantId
        )

        if (lineItems.length > 0) {
            for (const li of lineItems) {
                dataRows.push(csvRow([
                    registrationNum,
                    ndisNumber,
                    li.ItemCode ?? '',           // Support Item Number
                    inv.invoiceNumber ?? '',     // Claim Reference
                    li.Quantity,
                    '',                          // Hours — blank (units used for quantity)
                    li.UnitAmount,
                    'NO GST',
                    deliveredFrom,
                    deliveredTo,
                    '',                          // Cancellation reason
                    abn,
                    'NDIS',
                ]))
            }
        } else {
            // Fallback: single row, no item code
            dataRows.push(csvRow([
                registrationNum,
                ndisNumber,
                '',                             // No item code — flag for manual review
                inv.invoiceNumber ?? '',
                1,
                '',
                inv.total,
                'NO GST',
                deliveredFrom,
                deliveredTo,
                '',
                abn,
                'NDIS',
            ]))
        }

        claimedIds.push(inv.id)
    }

    // ── Mark invoices as claimed (atomic batch update) ───────────────────
    await prisma.xeroInvoice.updateMany({
        where: { id: { in: claimedIds } },
        data:  { claimedAt: exportedAt, claimBatchId: batchId },
    })

    console.log(
        `[PRODA EXPORT] Batch ${batchId} — ${claimedIds.length} invoices claimed, ${dataRows.length - 1} CSV rows`
    )

    const csv = [...metaLines, ...dataRows].join('\n')

    return new NextResponse(csv, {
        status: 200,
        headers: {
            'Content-Type':        'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="proda-${batchId}-${isoDate(exportedAt)}.csv"`,
        },
    })
}
