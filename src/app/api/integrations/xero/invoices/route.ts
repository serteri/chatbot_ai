import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getValidXeroToken } from '@/lib/xero/client'

const XERO_API_BASE = 'https://api.xero.com/api.xro/2.0'

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = await getValidXeroToken(session.user.id)
    if (!token) {
        return NextResponse.json({ error: 'not_connected' }, { status: 400 })
    }

    const res = await fetch(`${XERO_API_BASE}/Invoices?pageSize=10&order=Date+DESC`, {
        headers: {
            Authorization:   `Bearer ${token.accessToken}`,
            'Xero-Tenant-Id': token.tenantId,
            Accept:          'application/json',
        },
    })

    if (!res.ok) {
        const body = await res.text()
        if (res.status === 403) {
            console.error('[XERO INVOICES] 403 Forbidden — missing scope: accounting.invoices.read')
            console.error('[XERO INVOICES] Xero response body:', body)
            return NextResponse.json(
                { error: 'forbidden', missing_scope: 'accounting.invoices.read' },
                { status: 403 }
            )
        }
        console.error('[XERO INVOICES] API error:', res.status, body)
        return NextResponse.json({ error: 'xero_api_error', detail: res.status }, { status: 502 })
    }

    const data = await res.json()
    const invoices = (data.Invoices ?? []).map((inv: any) => ({
        id:       inv.InvoiceID,
        number:   inv.InvoiceNumber ?? '',
        contact:  inv.Contact?.Name ?? 'Unknown',
        total:    inv.Total ?? 0,
        status:   inv.Status ?? '',
        date:     inv.DateString ?? '',
        type:     inv.Type ?? '',
    }))

    console.log('[XERO INVOICES] Fetched', invoices.length, 'invoices — tenant:', token.tenantId)
    return NextResponse.json({ invoices, tenantName: token.tenantName })
}
