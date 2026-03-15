'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    Users, AlertTriangle, TrendingDown, Receipt,
    ChevronRight, Clock, CheckCircle2,
} from 'lucide-react'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from '@/components/ui/dialog'

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
    isLowBudget:        boolean
    pctRemaining:       number
    recentTransactions: BudgetTx[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number) {
    return n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-AU', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

function barColor(pct: number) {
    if (pct > 50) return 'bg-emerald-400'
    if (pct > 15) return 'bg-amber-400'
    return 'bg-red-400'
}

const TX_TYPE_LABEL: Record<string, string> = {
    XERO_SYNC:  'Xero Sync',
    MANUAL:     'Manuel',
    ADJUSTMENT: 'Düzeltme',
}

// ---------------------------------------------------------------------------
// Progress bar row
// ---------------------------------------------------------------------------
function BudgetProgress({ pct, isLow }: { pct: number; isLow: boolean }) {
    return (
        <div className="mt-1.5">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor(pct)}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {isLow && (
                <p className="text-[10px] text-red-500 font-medium mt-0.5">
                    Bütçenin %{pct.toFixed(1)}&apos;i kaldı
                </p>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Transaction history modal
// ---------------------------------------------------------------------------
function TransactionModal({
    participant,
    open,
    onClose,
}: {
    participant: Participant | null
    open:        boolean
    onClose:     () => void
}) {
    if (!participant) return null

    const hasTxs = participant.recentTransactions.length > 0

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {participant.isLowBudget && (
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                        {participant.fullName}
                    </DialogTitle>
                    <DialogDescription>
                        {participant.ndisNumber && (
                            <span className="font-mono text-slate-500">NDIS #{participant.ndisNumber}</span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* Budget summary */}
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-0.5">Toplam Bütçe</p>
                        <p className="text-sm font-black text-slate-700">${fmt(participant.totalBudget)}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-0.5">Kullanılan</p>
                        <p className="text-sm font-black text-red-600">${fmt(participant.usedBudget)}</p>
                    </div>
                    <div className={`rounded-xl p-3 ${participant.isLowBudget ? 'bg-red-50' : 'bg-emerald-50'}`}>
                        <p className="text-xs text-slate-400 mb-0.5">Kalan</p>
                        <p className={`text-sm font-black ${participant.isLowBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                            ${fmt(participant.remainingBudget)}
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                {participant.totalBudget > 0 && (
                    <div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${barColor(participant.pctRemaining)}`}
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
                    </div>
                )}

                {participant.isLowBudget && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-xs text-red-700 font-medium">
                            Düşük bütçe uyarısı — katılımcı planını gözden geçirin.
                        </p>
                    </div>
                )}

                {/* Transaction history */}
                <div>
                    <div className="flex items-center gap-1.5 mb-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Son İşlemler
                        </h4>
                    </div>

                    {!hasTxs ? (
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-slate-400" />
                            <p className="text-xs text-slate-500">Henüz işlem kaydı yok.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                            {participant.recentTransactions.map((tx, i) => (
                                <div key={tx.id} className={`flex items-center justify-between px-3 py-2.5 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-xs font-semibold text-slate-800">
                                                {tx.invoiceNumber
                                                    ? `INV — ${tx.invoiceNumber}`
                                                    : 'Manuel İşlem'}
                                            </span>
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                                {TX_TYPE_LABEL[tx.type] ?? tx.type}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            {fmtDate(tx.date)}
                                            {tx.note && ` · ${tx.note}`}
                                        </p>
                                    </div>
                                    <span className="text-sm font-bold text-red-600 shrink-0 ml-3">
                                        -${fmt(tx.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
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

    const lowCount = participants.filter(p => p.isLowBudget).length

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
                            <p className="text-xs text-slate-400">
                                {participants.length} kayıtlı katılımcı
                                {lowCount > 0 && (
                                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-red-500 font-semibold">
                                        · <AlertTriangle className="w-3 h-3" /> {lowCount} düşük bütçe
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Participant rows */}
                <div className="divide-y divide-slate-50">
                    {participants.map(p => (
                        <div key={p.id} className="py-3 group">
                            <div className="flex items-center justify-between gap-3">

                                {/* Name + NDIS + alert */}
                                <button
                                    onClick={() => setSelected(p)}
                                    className="flex items-center gap-2 min-w-0 text-left group/btn"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {p.isLowBudget && (
                                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                            )}
                                            <span className={`text-sm font-bold group-hover/btn:text-violet-600 transition-colors truncate ${p.isLowBudget ? 'text-red-600' : 'text-slate-800'}`}>
                                                {p.fullName}
                                            </span>
                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                                p.status === 'ACTIVE'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
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

                                {/* Right: stats */}
                                <div className="flex items-center gap-4 shrink-0 text-right">
                                    <div className="hidden sm:block">
                                        <p className="text-[10px] text-slate-400">Kullanılan</p>
                                        <p className="text-xs font-bold text-slate-700">${fmt(p.usedBudget)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400">Kalan</p>
                                        <p className={`text-xs font-black ${p.isLowBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                                            ${fmt(p.remainingBudget)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Receipt className="w-3 h-3 text-slate-300" />
                                        <p className="text-[10px] text-slate-400">{p.invoiceCount} fatura</p>
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            {p.totalBudget > 0 ? (
                                <div className="mt-2 ml-0">
                                    <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
                                        <span className="flex items-center gap-1">
                                            <TrendingDown className="w-2.5 h-2.5" />
                                            Bütçe kullanımı
                                        </span>
                                        <span className="font-semibold">
                                            {(100 - p.pctRemaining).toFixed(1)}% kullanıldı
                                        </span>
                                    </div>
                                    <BudgetProgress pct={p.pctRemaining} isLow={p.isLowBudget} />
                                </div>
                            ) : (
                                <p className="text-[10px] text-slate-400 mt-1 italic">
                                    Bütçe henüz tanımlanmamış
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Transaction history modal */}
            <TransactionModal
                participant={selected}
                open={!!selected}
                onClose={() => setSelected(null)}
            />
        </>
    )
}
