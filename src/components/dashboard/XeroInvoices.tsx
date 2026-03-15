'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    FileText, AlertCircle, CheckCircle2, RefreshCw,
    UserCheck, UserX, LinkIcon,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ParticipantInfo {
    id:          string
    fullName:    string
    ndisNumber:  string | null
}

interface Invoice {
    id:            string
    xeroInvoiceId: string
    invoiceNumber: string | null
    contactName:   string | null
    contactNumber: string | null
    total:         number
    amountDue:     number
    status:        string
    date:          string | null
    matchMethod:   string | null
    participant:   ParticipantInfo | null
}

interface SyncResult {
    total:     number
    matched:   number
    unmatched: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STATUS_STYLE: Record<string, string> = {
    PAID:       'bg-emerald-100 text-emerald-700',
    AUTHORISED: 'bg-blue-100 text-blue-700',
    DRAFT:      'bg-slate-100 text-slate-500',
    VOIDED:     'bg-red-100 text-red-500',
}

const MATCH_BADGE: Record<string, { label: string; style: string }> = {
    ndis_number: { label: 'NDIS #',  style: 'bg-teal-100 text-teal-700' },
    name:        { label: 'İsim',    style: 'bg-blue-100 text-blue-700' },
    manual:      { label: 'Manuel',  style: 'bg-violet-100 text-violet-700' },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function XeroInvoices() {
    const [invoices, setInvoices]     = useState<Invoice[] | null>(null)
    const [tenantName, setTenantName] = useState<string | null>(null)
    const [error, setError]           = useState<string | null>(null)
    const [loading, setLoading]       = useState(true)
    const [syncing, setSyncing]       = useState(false)
    const [syncResult, setSyncResult] = useState<SyncResult | null>(null)

    const loadInvoices = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await fetch('/api/integrations/xero/invoices')
            const data = await res.json()
            if (data.error === 'not_connected') { setError('not_connected'); return }
            if (data.error)                     { setError(data.error); return }
            setInvoices(data.invoices)
            setTenantName(data.tenantName ?? null)
            setError(null)
        } catch {
            setError('fetch_failed')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadInvoices() }, [loadInvoices])

    // Sync: pull from Xero + auto-match, then reload list
    const handleSync = async () => {
        setSyncing(true)
        setSyncResult(null)
        try {
            const res  = await fetch('/api/integrations/xero/sync', { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                setSyncResult({ total: data.total, matched: data.matched, unmatched: data.unmatched })
                await loadInvoices()
            } else {
                setError(data.error ?? 'sync_failed')
            }
        } catch {
            setError('sync_failed')
        } finally {
            setSyncing(false)
        }
    }

    // -----------------------------------------------------------------------
    // Render guards
    // -----------------------------------------------------------------------
    if (loading) {
        return <div className="h-20 rounded-xl bg-slate-50 animate-pulse mt-4" />
    }
    if (error === 'not_connected') return null

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-5">

            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#13B5EA]/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#13B5EA]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-700">Son Faturalar</h3>
                        {tenantName && <p className="text-xs text-slate-400">{tenantName}</p>}
                    </div>
                </div>

                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#13B5EA] hover:bg-[#0ea0d4] disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Senkronize ediliyor…' : 'Xero\'yu Senkronize Et'}
                </button>
            </div>

            {/* ── Sync result banner ────────────────────────────────────── */}
            {syncResult && (
                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl text-sm text-teal-700 mb-4">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                        {syncResult.total} fatura senkronize edildi —{' '}
                        <strong>{syncResult.matched}</strong> katılımcıyla eşleşti,{' '}
                        <strong>{syncResult.unmatched}</strong> eşleşemedi.
                    </span>
                </div>
            )}

            {/* ── Error states ──────────────────────────────────────────── */}
            {error === 'forbidden' && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                        Eksik yetki: <code className="font-mono">accounting.invoices.read</code>.
                        Xero bağlantısını yeniden kur.
                    </span>
                </div>
            )}

            {error && !['forbidden', 'not_connected'].includes(error) && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl text-sm text-amber-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Fatura verileri yüklenemedi. Xero&apos;yu senkronize etmeyi dene.</span>
                </div>
            )}

            {/* ── Empty state (synced but no invoices) ─────────────────── */}
            {invoices && invoices.length === 0 && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl text-sm text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Şu an kayıtlı fatura bulunmuyor, ama bağlantı sağlıklı!</span>
                </div>
            )}

            {/* ── Not yet synced prompt ─────────────────────────────────── */}
            {invoices === null && !error && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl text-sm text-slate-500">
                    <RefreshCw className="w-4 h-4 shrink-0" />
                    <span>Faturaları görmek için &quot;Xero&apos;yu Senkronize Et&quot; butonuna tıkla.</span>
                </div>
            )}

            {/* ── Invoice list ──────────────────────────────────────────── */}
            {invoices && invoices.length > 0 && (
                <div className="divide-y divide-slate-50">
                    {invoices.map(inv => (
                        <InvoiceRow key={inv.id} invoice={inv} onManualMatch={loadInvoices} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Invoice row sub-component
// ---------------------------------------------------------------------------
function InvoiceRow({
    invoice: inv,
    onManualMatch,
}: {
    invoice:       Invoice
    onManualMatch: () => void
}) {
    const matched = !!inv.participant
    const badge   = inv.matchMethod ? MATCH_BADGE[inv.matchMethod] : null

    return (
        <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors gap-3">

            {/* Left: invoice info */}
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#13B5EA] shrink-0" />
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                            {inv.invoiceNumber || '—'}
                        </p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_STYLE[inv.status] ?? 'bg-slate-100 text-slate-500'}`}>
                            {inv.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{inv.contactName ?? '—'}</p>
                </div>
            </div>

            {/* Right: amount + match */}
            <div className="flex items-center gap-3 shrink-0">

                {/* Match indicator */}
                {matched ? (
                    <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-teal-500" />
                        <div className="text-right">
                            <p className="text-xs font-semibold text-slate-700 leading-tight">
                                {inv.participant!.fullName}
                            </p>
                            {badge && (
                                <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full ${badge.style}`}>
                                    {badge.label}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <button
                        title="Manuel eşleştirme — yakında"
                        className="inline-flex items-center gap-1 px-2 py-1 border border-dashed border-slate-300 text-slate-500 hover:border-teal-400 hover:text-teal-600 text-[11px] font-medium rounded-lg transition-colors"
                        onClick={() => {
                            // TODO: open participant picker modal
                            alert('Manuel eşleştirme — geliştirme aşamasında')
                        }}
                    >
                        <UserX className="w-3 h-3" />
                        Eşleşme Bulunamadı
                        <LinkIcon className="w-3 h-3" />
                    </button>
                )}

                {/* Total */}
                <p className="text-sm font-bold text-slate-800 min-w-[64px] text-right">
                    ${inv.total.toFixed(2)}
                </p>
            </div>
        </div>
    )
}
