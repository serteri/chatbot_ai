'use client'

import { useEffect, useState } from 'react'
import { FileText, AlertCircle, CheckCircle2 } from 'lucide-react'

type Invoice = {
    id:      string
    number:  string
    contact: string
    total:   number
    status:  string
    date:    string
}

export default function XeroInvoices() {
    const [invoices, setInvoices]     = useState<Invoice[] | null>(null)
    const [tenantName, setTenantName] = useState<string | null>(null)
    const [error, setError]           = useState<string | null>(null)
    const [loading, setLoading]       = useState(true)

    useEffect(() => {
        fetch('/api/integrations/xero/invoices')
            .then(res => res.json())
            .then(data => {
                if (data.error === 'not_connected') { setError('not_connected') }
                else if (data.error)               { setError(data.error) }
                else {
                    setInvoices(data.invoices)
                    setTenantName(data.tenantName ?? null)
                }
            })
            .catch(() => setError('fetch_failed'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return <div className="h-20 rounded-xl bg-slate-50 animate-pulse mt-4" />
    }

    // Don't render if Xero isn't connected — XeroConnect already handles that UI
    if (error === 'not_connected') return null

    const statusStyle: Record<string, string> = {
        PAID:       'bg-emerald-100 text-emerald-700',
        AUTHORISED: 'bg-blue-100 text-blue-700',
        DRAFT:      'bg-slate-100 text-slate-500',
        VOIDED:     'bg-red-100 text-red-500',
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-5">

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#13B5EA]/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#13B5EA]" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-700">Recent Invoices</h3>
                    {tenantName && <p className="text-xs text-slate-400">{tenantName}</p>}
                </div>
            </div>

            {/* 403 — missing scope */}
            {error === 'forbidden' && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                        Missing scope: <code className="font-mono">accounting.invoices.read</code>.
                        Xero bağlantısını yeniden kurarak erişim izni ver.
                    </span>
                </div>
            )}

            {/* Other errors */}
            {error && error !== 'forbidden' && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl text-sm text-amber-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Fatura verileri yüklenemedi. Lütfen daha sonra tekrar dene.</span>
                </div>
            )}

            {/* Empty state */}
            {invoices && invoices.length === 0 && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl text-sm text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Şu an kayıtlı fatura bulunmuyor, ama bağlantı sağlıklı!</span>
                </div>
            )}

            {/* Invoice list */}
            {invoices && invoices.length > 0 && (
                <div className="divide-y divide-slate-50">
                    {invoices.map(inv => (
                        <div
                            key={inv.id}
                            className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#13B5EA] shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">
                                        {inv.number || '—'}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">{inv.contact}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                                <p className="text-sm font-bold text-slate-800">
                                    ${inv.total.toFixed(2)}
                                </p>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusStyle[inv.status] ?? 'bg-slate-100 text-slate-500'}`}>
                                    {inv.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
