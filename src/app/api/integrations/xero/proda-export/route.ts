import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getValidXeroToken } from '@/lib/xero/client'
import { prisma } from '@/lib/db/prisma'

const XERO_API_BASE = 'https://api.xero.com/api.xro/2.0'

// NDIS PRODA Bulk Upload CSV column order
const CSV_HEADERS = [
    'RegistrationNumber',
    'NDISNumber',
    'SupportItemNumber',
    'ClaimReference',
    'Quantity',
    'Hours',
    'UnitPrice',
    'GSTCode',
    'SupportDeliveredFrom',
    'SupportDeliveredTo',
    'CancellationReason',
    'ABNofSupportProvider',
    'ClaimType',
]

function csvRow(values: (string | number | null | undefined)[]) {
    return values
        .map(v => {
            const s = v == null ? '' : String(v)
            return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
        })
        .join(',')
}

function formatDate(d: Date | null): string {
    if (!d) return ''
    return d.toLocaleDateString('en-AU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    }).split('/').reverse().join('-')  // ISO yyyy-mm-dd
}

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    // Provider info for RegistrationNumber + ABN
    const user = await prisma.user.findUnique({
        where:  { id: userId },
        select: { ndisProviderNumber: true, abn: true },
    })

    const token = await getValidXeroToken(userId)
    if (!token) {
        return NextResponse.json({ error: 'not_connected' }, { status: 400 })
    }

    // Fetch matched, budget-deducted invoices with participant data
    const dbInvoices = await prisma.xeroInvoice.findMany({
        where: {
            userId,
            budgetDeducted: true,
            participantId:  { not: null },
        },
        orderBy: { date: 'desc' },
        select: {
            xeroInvoiceId: true,
            invoiceNumber:  true,
            total:          true,
            date:           true,
            status:         true,
            participant: {
                select: { ndisNumber: true, fullName: true },
            },
        },
    })

    if (dbInvoices.length === 0) {
        return NextResponse.json({ error: 'no_matched_invoices' }, { status: 400 })
    }

    // Fetch full line items from Xero for each invoice
    const rows: string[] = [csvRow(CSV_HEADERS)]

    for (const inv of dbInvoices) {
        // Try to get line items (Support Item Number lives here)
        let lineItems: Array<{
            ItemCode:    string | null
            Description: string | null
            Quantity:    number
            UnitAmount:  number
        }> = []

        try {
            const xRes = await fetch(
                `${XERO_API_BASE}/Invoices/${inv.xeroInvoiceId}`,
                {
                    headers: {
                        Authorization:    `Bearer ${token.accessToken}`,
                        'Xero-Tenant-Id': token.tenantId,
                        Accept:           'application/json',
                    },
                }
            )
            if (xRes.ok) {
                const xData = await xRes.json()
                lineItems = xData.Invoices?.[0]?.LineItems ?? []
            }
        } catch (e) {
            console.warn('[PRODA] Failed to fetch line items for', inv.invoiceNumber, e)
        }

        const ndisNumber        = inv.participant?.ndisNumber ?? ''
        const registrationNum   = user?.ndisProviderNumber ?? ''
        const abn               = user?.abn ?? ''
        const deliveredFrom     = formatDate(inv.date)
        const deliveredTo       = formatDate(inv.date)   // same-day default

        if (lineItems.length > 0) {
            // One PRODA row per line item
            for (const li of lineItems) {
                rows.push(csvRow([
                    registrationNum,
                    ndisNumber,
                    li.ItemCode ?? '',           // Support Item Number
                    inv.invoiceNumber ?? '',     // Claim Reference
                    li.Quantity,
                    '',                          // Hours (leave blank — quantity covers it)
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
            // Fallback: one row with the invoice total, no item code
            rows.push(csvRow([
                registrationNum,
                ndisNumber,
                '',                             // No item code available
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
    }

    const csv = rows.join('\n')
    console.log(`[PRODA EXPORT] Generated ${rows.length - 1} claim rows from ${dbInvoices.length} invoices`)

    return new NextResponse(csv, {
        status: 200,
        headers: {
            'Content-Type':        'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="proda-claims-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
    })
}
