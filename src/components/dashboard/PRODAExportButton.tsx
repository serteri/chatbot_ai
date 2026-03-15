'use client'

import { useEffect, useState } from 'react'
import { FileSpreadsheet, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface Preview {
    pending:       number
    alreadyClaimed: number
}

type State = 'idle' | 'loading' | 'exporting' | 'success' | 'error' | 'no_provider'

export default function PRODAExportButton() {
    const [preview, setPreview]   = useState<Preview | null>(null)
    const [state, setState]       = useState<State>('loading')
    const [lastBatch, setLastBatch] = useState<string | null>(null)
    const [errorMsg, setErrorMsg] = useState<string>('')

    useEffect(() => {
        fetch('/api/integrations/xero/proda-export?count=true')
            .then(r => r.json())
            .then(data => {
                if (data.error === 'missing_provider_number') {
                    setState('no_provider')
                } else if (data.error) {
                    setState('error')
                    setErrorMsg(data.message ?? data.error)
                } else {
                    setPreview(data)
                    setState('idle')
                }
            })
            .catch(() => setState('idle'))  // Xero not connected — silent
    }, [])

    const handleExport = async () => {
        setState('exporting')
        try {
            const res = await fetch('/api/integrations/xero/proda-export')

            if (!res.ok) {
                const err = await res.json()
                setErrorMsg(
                    err.error === 'no_pending_invoices'
                        ? 'Dışa aktarılacak bekleyen fatura yok.'
                        : err.message ?? 'Dışa aktarım başarısız.'
                )
                setState('error')
                return
            }

            // Extract batch ID from Content-Disposition filename
            const cd      = res.headers.get('Content-Disposition') ?? ''
            const match   = cd.match(/proda-([A-Z0-9]+)-/)
            const batchId = match?.[1] ?? null

            // Trigger browser download
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

            setLastBatch(batchId)
            setPreview(prev => prev
                ? { pending: 0, alreadyClaimed: prev.alreadyClaimed + prev.pending }
                : null
            )
            setState('success')
        } catch {
            setErrorMsg('Ağ hatası. Lütfen tekrar dene.')
            setState('error')
        }
    }

    // ── Don't render if Xero isn't connected (state stays 'loading' briefly) ──
    if (state === 'loading') return null

    // ── No NDIS Provider Number in Settings ─────────────────────────────
    if (state === 'no_provider') {
        return (
            <div className="flex items-center gap-2 px-4 py-2.5 border border-amber-200 bg-amber-50 text-amber-700 text-sm font-medium rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>PRODA export: Settings&apos;teki NDIS Provider Number eksik.</span>
            </div>
        )
    }

    // ── Success state ────────────────────────────────────────────────────
    if (state === 'success') {
        return (
            <div className="flex items-center gap-2 px-4 py-2.5 border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                    CSV indirildi!{lastBatch && ` Batch: ${lastBatch}`}
                    {' '}—{' '}
                    <button
                        onClick={() => setState('idle')}
                        className="underline underline-offset-2 hover:no-underline"
                    >
                        Yeni export
                    </button>
                </span>
            </div>
        )
    }

    // ── Error state ──────────────────────────────────────────────────────
    if (state === 'error') {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2.5 border border-red-200 bg-red-50 text-red-700 text-sm font-medium rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg || 'Export başarısız.'}</span>
                </div>
                <button
                    onClick={() => setState('idle')}
                    className="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                    Tekrar dene
                </button>
            </div>
        )
    }

    // ── Idle / Export ────────────────────────────────────────────────────
    const isExporting = state === 'exporting'
    const hasPending  = (preview?.pending ?? 0) > 0

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <button
                onClick={handleExport}
                disabled={isExporting || !hasPending}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm
                    ${hasPending
                        ? 'bg-violet-600 hover:bg-violet-700 text-white'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }
                    disabled:opacity-70`}
            >
                {isExporting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Download className="w-4 h-4" />
                }
                {isExporting ? 'Hazırlanıyor…' : 'Export to PRODA'}
            </button>

            {/* Pending / claimed counts */}
            {preview && (
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    {hasPending ? (
                        <span className="flex items-center gap-1">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-violet-500" />
                            <strong className="text-violet-700">{preview.pending}</strong> bekleyen fatura
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Tüm faturalar claim edildi
                        </span>
                    )}
                    {preview.alreadyClaimed > 0 && (
                        <span className="text-slate-400">
                            · {preview.alreadyClaimed} daha önce claim edildi
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
