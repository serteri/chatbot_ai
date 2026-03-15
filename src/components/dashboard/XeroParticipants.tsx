'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    Users, AlertTriangle, TrendingDown, Receipt,
    ChevronRight, Clock, CheckCircle2, FileSpreadsheet,
    Download, Calendar, Hash, DollarSign,
} from 'lucide-react'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface BudgetTx {
    id:            string
    invoiceNumber: string | null
    amount:        number
    type:          string
    note:          string | null
    date:          string
}

interface Participant {
    id:                 string
    fullName:           string
    ndisNumber:         string | null
    status:             string
    totalBudget:        number
    remainingBudget:    number
    usedBudget:         number
    invoiceCount:       number
    isLowBudget:        boolean   // <15%
    pctRemaining:       number
    recentTransactions: BudgetTx[]
}

interface DrawerInvoice {
    id:            string
    invoiceNumber: string | null
    total:         number
    status:        string
    date:          string | null
    budgetDeducted: boolean
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
function fmt(n: number) {
    return n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-AU', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

// ── Alert levels ──────────────────────────────────────────────────────────
function alertLevel(pct: number): 'ok' | 'low' | 'critical' {
    if (pct < 5)  return 'critical'
    if (pct < 15) return 'low'
    return 'ok'
}

function barColor(pct: number) {
    const level = alertLevel(pct)
    if (level === 'critical') return 'bg-red-500'
    if (level === 'low')      return 'bg-amber-400'
    return 'bg-emerald-400'
}

const STATUS_STYLE: Record<string, string> = {
    PAID:       'bg-emerald-100 text-emerald-700',
    AUTHORISED: 'bg-blue-100 text-blue-700',
    DRAFT:      'bg-slate-100 text-slate-500',
    VOIDED:     'bg-red-100 text-red-500',
}

const TX_TYPE: Record<string, string> = {
    XERO_SYNC: 'Xero Sync',
    MANUAL:    'Manuel',
}

// ---------------------------------------------------------------------------
// Budget progress bar
// ---------------------------------------------------------------------------
function BudgetProgress({ pct, compact = false }: { pct: number; compact?: boolean }) {
    const level = alertLevel(pct)

    return (
        <div className={compact ? '' : 'mt-2'}>
            {!compact && (
                <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1">
                        <TrendingDown className="w-2.5 h-2.5" />
                        Bütçe kullanımı
                    </span>
                    <span className="font-semibold">{(100 - pct).toFixed(1)}% kullanıldı</span>
                </div>
            )}
            <div className={`${compact ? 'h-1.5' : 'h-2'} bg-slate-100 rounded-full overflow-hidden`}>
                <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor(pct)}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {level === 'critical' && !compact && (
                <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <p className="text-[10px] text-red-600 font-bold">
                        Kritik Seviye — bütçenin yalnızca %{pct.toFixed(1)}&apos;i kaldı!
                    </p>
                </div>
            )}
            {level === 'low' && !compact && (
                <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                    Düşük bütçe — %{pct.toFixed(1)} kaldı
                </p>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Alert badge (inline next to name)
// ---------------------------------------------------------------------------
function AlertBadge({ pct }: { pct: number }) {
    const level = alertLevel(pct)
    if (level === 'ok') return null
    if (level === 'critical') return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-black rounded-full animate-pulse">
            <AlertTriangle className="w-2.5 h-2.5" /> Kritik
        </span>
    )
    return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full">
            <AlertTriangle className="w-2.5 h-2.5" /> Düşük
        </span>
    )
}

// ---------------------------------------------------------------------------
// Participant drawer — right-side Sheet with full invoice history
// ---------------------------------------------------------------------------
function ParticipantDrawer({
    participant,
    open,
    onClose,
}: {
    participant: Participant | null
    open:        boolean
    onClose:     () => void
}) {
    const [invoices, setInvoices]       = useState<DrawerInvoice[]>([])
    const [loadingInv, setLoadingInv]   = useState(false)
    const [exporting, setExporting]     = useState(false)

    useEffect(() => {
        if (!open || !participant) { setInvoices([]); return }
        setLoadingInv(true)
        fetch(`/api/integrations/xero/invoices?participantId=${participant.id}`)
            .then(r => r.json())
            .then(d => setInvoices(d.invoices ?? []))
            .catch(() => {})
            .finally(() => setLoadingInv(false))
    }, [open, participant?.id])

    const handleExport = async () => {
        setExporting(true)
        try {
            const res = await fetch('/api/integrations/xero/proda-export')
            if (!res.ok) {
                const err = await res.json()
                alert(
                    err.error === 'no_pending_invoices'
                        ? 'Tüm faturalar zaten claim edildi.'
                        : err.error === 'missing_provider_number'
                        ? 'Settings sayfasında NDIS Provider Number eksik.'
                        : 'PRODA dışa aktarımı başarısız.'
                )
                return
            }
            const cd   = res.headers.get('Content-Disposition') ?? ''
            const blob = await res.blob()
            const url  = URL.createObjectURL(blob)
            const a    = document.createElement('a')
            a.href     = url
            a.download = cd.match(/filename="([^"]+)"/)?.[1]
                ?? `proda-${new Date().toISOString().slice(0, 10)}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } finally {
            setExporting(false)
        }
    }

    if (!participant) return null
    const level = alertLevel(participant.pctRemaining)

    return (
        <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col gap-0 p-0">

                {/* ── Header ────────────────────────────────────────────── */}
                <div className={`px-6 py-5 border-b ${level === 'critical' ? 'bg-red-50 border-red-200' : level === 'low' ? 'bg-amber-50 border-amber-200' : 'border-slate-100'}`}>
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2 text-left">
                            {level !== 'ok' && (
                                <AlertTriangle className={`w-4 h-4 shrink-0 ${level === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                            )}
                            {participant.fullName}
                        </SheetTitle>
                        <SheetDescription className="text-left">
                            {participant.ndisNumber
                                ? `NDIS #${participant.ndisNumber}`
                                : 'NDIS numarası tanımlanmamış'
                            }
                            {' · '}
                            <span className={`font-semibold ${participant.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {participant.status}
                            </span>
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto px-6 space-y-6 py-5">

                    {/* ── Budget summary ────────────────────────────────── */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Bütçe Özeti
                        </h4>
                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[10px] text-slate-400 mb-0.5">Toplam</p>
                                <p className="text-sm font-black text-slate-700">${fmt(participant.totalBudget)}</p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-3">
                                <p className="text-[10px] text-slate-400 mb-0.5">Kullanılan</p>
                                <p className="text-sm font-black text-red-600">${fmt(participant.usedBudget)}</p>
                            </div>
                            <div className={`rounded-xl p-3 ${level === 'ok' ? 'bg-emerald-50' : level === 'low' ? 'bg-amber-50' : 'bg-red-50'}`}>
                                <p className="text-[10px] text-slate-400 mb-0.5">Kalan</p>
                                <p className={`text-sm font-black ${level === 'ok' ? 'text-emerald-600' : level === 'low' ? 'text-amber-600' : 'text-red-600'}`}>
                                    ${fmt(participant.remainingBudget)}
                                </p>
                            </div>
                        </div>

                        {participant.totalBudget > 0 && (
                            <>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${barColor(participant.pctRemaining)}`}
                                        style={{ width: `${participant.pctRemaining}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>0%</span>
                                    <span className="font-semibold text-slate-600">
                                        %{(100 - participant.pctRemaining).toFixed(1)} kullanıldı
                                    </span>
                                    <span>100%</span>
                                </div>
                                {level === 'critical' && (
                                    <div className="flex items-center gap-2 mt-2 p-2 bg-red-100 rounded-lg">
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                        <p className="text-xs text-red-700 font-bold">Kritik Seviye — katılımcı planını acilen gözden geçirin!</p>
                                    </div>
                                )}
                                {level === 'low' && (
                                    <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 rounded-lg">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                        <p className="text-xs text-amber-700 font-medium">Düşük bütçe uyarısı — plan gözden geçirilmeli.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Invoice history ───────────────────────────────── */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-3">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                İşlem Geçmişi — Tüm Faturalar
                            </h4>
                            <span className="ml-auto text-[10px] text-slate-400">
                                {invoices.length} kayıt
                            </span>
                        </div>

                        {loadingInv ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : invoices.length === 0 ? (
                            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                                <p className="text-xs text-slate-500">Bu katılımcıya ait fatura bulunamadı.</p>
                            </div>
                        ) : (
                            <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
                                {/* Table header */}
                                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span className="flex items-center gap-1"><Hash className="w-2.5 h-2.5" />Fatura No</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />Tarih</span>
                                    <span className="flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" />Tutar</span>
                                    <span>Durum</span>
                                </div>

                                {/* Rows */}
                                {invoices.map((inv, i) => (
                                    <div
                                        key={inv.id}
                                        className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-3 py-2.5 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-slate-800 truncate">
                                                {inv.invoiceNumber || '—'}
                                            </p>
                                            {inv.budgetDeducted && (
                                                <span className="text-[9px] text-emerald-600 font-medium">
                                                    ✓ Bütçeden düşüldü
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                            {fmtDate(inv.date)}
                                        </span>
                                        <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
                                            ${fmt(inv.total)}
                                        </span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLE[inv.status] ?? 'bg-slate-100 text-slate-500'}`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                ))}

                                {/* Total row */}
                                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-3 py-2 bg-slate-50 border-t border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-600">Toplam</span>
                                    <span />
                                    <span className="text-xs font-black text-slate-800">
                                        ${fmt(invoices.reduce((s, inv) => s + inv.total, 0))}
                                    </span>
                                    <span />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Budget transaction log ────────────────────────── */}
                    {participant.recentTransactions.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-3">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Son Bütçe İşlemleri
                                </h4>
                            </div>
                            <div className="space-y-1.5">
                                {participant.recentTransactions.map(tx => (
                                    <div key={tx.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-700">
                                                {tx.invoiceNumber ? `INV — ${tx.invoiceNumber}` : 'Manuel İşlem'}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {fmtDate(tx.date)} · {TX_TYPE[tx.type] ?? tx.type}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-red-600">-${fmt(tx.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── PRODA Export footer ───────────────────────────────── */}
                <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/60">
                    <p className="text-[10px] text-slate-400 mb-2">
                        Bütçeden düşülmüş, henüz claim edilmemiş faturaları PRODA formatında indir.
                        Export sonrası faturalar <strong>Claimed</strong> olarak işaretlenir.
                    </p>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        {exporting ? 'Hazırlanıyor…' : 'PRODA CSV İndir'}
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function XeroParticipants() {
    const [participants, setParticipants] = useState<Participant[] | null>(null)
    const [loading, setLoading]           = useState(true)
    const [selected, setSelected]         = useState<Participant | null>(null)

    const load = useCallback(async () => {
        try {
            const res  = await fetch('/api/integrations/xero/participants')
            const data = await res.json()
            if (!data.error) setParticipants(data.participants)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    if (loading) return <div className="h-24 rounded-xl bg-slate-50 animate-pulse mt-5" />
    if (!participants || participants.length === 0) return null

    const criticalCount = participants.filter(p => alertLevel(p.pctRemaining) === 'critical').length
    const lowCount      = participants.filter(p => alertLevel(p.pctRemaining) === 'low').length

    return (
        <>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-5">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-700">
                                Katılımcılar & Bütçe Durumu
                            </h3>
                            <p className="text-xs text-slate-400 flex items-center gap-1 flex-wrap">
                                {participants.length} katılımcı
                                {criticalCount > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-red-600 font-bold">
                                        · <AlertTriangle className="w-3 h-3" /> {criticalCount} kritik
                                    </span>
                                )}
                                {lowCount > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold">
                                        · <AlertTriangle className="w-3 h-3" /> {lowCount} düşük bütçe
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Participant rows */}
                <div className="divide-y divide-slate-50">
                    {participants.map(p => {
                        const level = alertLevel(p.pctRemaining)
                        return (
                            <div key={p.id} className="py-3 group">
                                <div className="flex items-center justify-between gap-3">

                                    {/* Clickable name */}
                                    <button
                                        onClick={() => setSelected(p)}
                                        className="flex items-center gap-2 min-w-0 text-left group/btn"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className={`text-sm font-bold group-hover/btn:text-violet-600 transition-colors truncate ${level === 'critical' ? 'text-red-600' : level === 'low' ? 'text-amber-700' : 'text-slate-800'}`}>
                                                    {p.fullName}
                                                </span>
                                                <AlertBadge pct={p.pctRemaining} />
                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {p.status}
                                                </span>
                                            </div>
                                            {p.ndisNumber && (
                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                    NDIS #{p.ndisNumber}
                                                </p>
                                            )}
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/btn:text-violet-500 transition-colors shrink-0" />
                                    </button>

                                    {/* Budget stats */}
                                    <div className="flex items-center gap-4 shrink-0 text-right">
                                        <div className="hidden sm:block">
                                            <p className="text-[10px] text-slate-400">Kullanılan</p>
                                            <p className="text-xs font-bold text-slate-700">${fmt(p.usedBudget)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400">Kalan</p>
                                            <p className={`text-xs font-black ${level === 'critical' ? 'text-red-600' : level === 'low' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                ${fmt(p.remainingBudget)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Receipt className="w-3 h-3 text-slate-300" />
                                            <p className="text-[10px] text-slate-400">{p.invoiceCount}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                {p.totalBudget > 0
                                    ? <BudgetProgress pct={p.pctRemaining} />
                                    : <p className="text-[10px] text-slate-400 mt-1 italic">Bütçe tanımlanmamış</p>
                                }
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Right-side drawer */}
            <ParticipantDrawer
                participant={selected}
                open={!!selected}
                onClose={() => setSelected(null)}
            />
        </>
    )
}
