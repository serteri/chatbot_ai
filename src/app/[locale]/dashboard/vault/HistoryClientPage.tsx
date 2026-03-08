'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
    Search, FileText, Download, ShieldCheck, AlertTriangle,
    CheckCircle2, XCircle, Layers, Clock, Filter,
    TrendingUp, Lock, FileDown
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnalysisRecord {
    id: string
    fileName: string
    participantName: string | null
    complianceScore: number
    warnings: any[]
    pdfUrl: string | null
    region: string
    createdAt: string
}

interface BulkTask {
    id: string
    fileName: string
    status: string
    fileUrl: string | null
    analysisId: string | null
    createdAt: string
}

interface BulkBatch {
    batchId: string
    createdAt: string
    tasks: BulkTask[]
}

interface BulkAnalysisData {
    complianceScore: number
    participantName: string | null
    warnings: any[]
}

interface Props {
    singleAnalyses: AnalysisRecord[]
    bulkBatches: BulkBatch[]
    bulkAnalysisMap: Record<string, BulkAnalysisData>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip the unique timestamp/hex prefix from filenames for display */
function displayFileName(raw: string): string {
    // Pattern: "1741256000-a1b2c3d4-Original_Name.pdf" → "Original_Name.pdf"
    const match = raw.match(/^\d+-[a-f0-9]+-(.+)$/i)
    if (match) return match[1].replace(/_/g, ' ')
    // Fallback: "1741256000-Original_Name.pdf" → "Original_Name.pdf"
    const simpleMatch = raw.match(/^\d+-(.+)$/i)
    if (simpleMatch) return simpleMatch[1].replace(/_/g, ' ')
    return raw
}

function formatDate(isoString: string) {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

function getScoreColor(score: number) {
    if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-500/20' }
    if (score >= 60) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', ring: 'ring-amber-500/20' }
    if (score >= 40) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', ring: 'ring-orange-500/20' }
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', ring: 'ring-red-500/20' }
}

function getScoreIcon(score: number) {
    if (score >= 80) return <CheckCircle2 className="h-3.5 w-3.5" />
    if (score >= 60) return <TrendingUp className="h-3.5 w-3.5" />
    if (score >= 40) return <AlertTriangle className="h-3.5 w-3.5" />
    return <XCircle className="h-3.5 w-3.5" />
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'completed':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" /> Done
                </span>
            )
        case 'processing':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                    <Clock className="h-3 w-3" /> Processing
                </span>
            )
        case 'failed':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                    <XCircle className="h-3 w-3" /> Failed
                </span>
            )
        default:
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                    <Clock className="h-3 w-3" /> Pending
                </span>
            )
    }
}

// ---------------------------------------------------------------------------
// Secure Download Handler
// ---------------------------------------------------------------------------

async function handleSecureDownload(pdfUrl: string) {
    try {
        const res = await fetch(`/api/validator/secure-download?url=${encodeURIComponent(pdfUrl)}`)
        const data = await res.json()
        if (data.url) {
            window.open(data.url, '_blank')
        } else {
            toast.error('Failed to generate secure download link. SAS token may have expired.')
        }
    } catch {
        toast.error('Download error. Please try again.')
    }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HistoryClientPage({ singleAnalyses, bulkBatches, bulkAnalysisMap }: Props) {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'all' | 'single' | 'bulk'>('all')

    // Filter single analyses
    const filteredSingle = singleAnalyses.filter(record =>
        record.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.participantName && record.participantName.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Filter bulk batches
    const filteredBatches = bulkBatches.filter(batch =>
        batch.tasks.some(t =>
            t.fileName.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )

    // Stats
    const totalRecords = singleAnalyses.length + bulkBatches.reduce((sum, b) => sum + b.tasks.length, 0)
    const avgScore = singleAnalyses.length > 0
        ? Math.round(singleAnalyses.reduce((sum, a) => sum + a.complianceScore, 0) / singleAnalyses.length)
        : 0

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    Service Agreement History
                </h1>
                <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                    NDIS Audit Readiness Dashboard — All compliance analyses are stored in the Sovereign
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-600 mx-1">ap-southeast-2</span>
                    data region with encrypted access controls.
                </p>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Analyses</div>
                    <div className="mt-1 text-2xl font-bold text-slate-900">{totalRecords}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Single Reviews</div>
                    <div className="mt-1 text-2xl font-bold text-slate-900">{singleAnalyses.length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bulk Batches</div>
                    <div className="mt-1 text-2xl font-bold text-slate-900">{bulkBatches.length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg. Compliance</div>
                    <div className={`mt-1 text-2xl font-bold ${avgScore >= 70 ? 'text-emerald-600' : avgScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                        {avgScore}%
                    </div>
                </div>
            </div>

            {/* ── Master Download All ── */}
            {singleAnalyses.some(a => a.pdfUrl) && (
                <div className="flex justify-end">
                    <button
                        onClick={async () => {
                            const filesWithUrls = singleAnalyses.filter(a => a.pdfUrl)
                            for (const record of filesWithUrls) {
                                await handleSecureDownload(record.pdfUrl!)
                                await new Promise(r => setTimeout(r, 500))
                            }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                    >
                        <Download className="h-4 w-4" />
                        Download All Files from Sydney Vault
                    </button>
                </div>
            )}

            {/* ── Controls ── */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by document name or participant..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow"
                    />
                </div>
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    {(['all', 'single', 'bulk'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab
                                ? 'bg-white shadow-sm text-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab === 'all' && <Filter className="h-3 w-3 inline mr-1" />}
                            {tab === 'single' && <FileText className="h-3 w-3 inline mr-1" />}
                            {tab === 'bulk' && <Layers className="h-3 w-3 inline mr-1" />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Single Analyses Table ── */}
            {(activeTab === 'all' || activeTab === 'single') && filteredSingle.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-teal-600" />
                        Single Analysis Reviews
                        <span className="text-xs font-normal text-slate-400">({filteredSingle.length})</span>
                    </h2>
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Agreement</th>
                                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Participant</th>
                                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance</th>
                                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Analyzed</th>
                                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Region</th>
                                        <th className="py-3 px-5 text-xs text-right font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredSingle.map((record) => {
                                        const scoreColor = getScoreColor(record.complianceScore)
                                        return (
                                            <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-3.5 px-5 text-sm text-slate-900 font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                        <span className="truncate max-w-[180px] sm:max-w-xs">{displayFileName(record.fileName)}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 text-sm text-slate-600 hidden md:table-cell">
                                                    {record.participantName || <span className="text-slate-400 italic">Not extracted</span>}
                                                </td>
                                                <td className="py-3.5 px-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${scoreColor.bg} ${scoreColor.text} border ${scoreColor.border}`}>
                                                        {getScoreIcon(record.complianceScore)}
                                                        {record.complianceScore}%
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 text-sm text-slate-500 hidden sm:table-cell">
                                                    {formatDate(record.createdAt)}
                                                </td>
                                                <td className="py-3.5 px-5 hidden lg:table-cell">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <Lock className="h-3 w-3" />
                                                        Sydney
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 text-right">
                                                    {record.pdfUrl ? (
                                                        <button
                                                            onClick={() => handleSecureDownload(record.pdfUrl!)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200/50 cursor-pointer"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                            SAS Download
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">DB only</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Bulk Analysis Batches ── */}
            {(activeTab === 'all' || activeTab === 'bulk') && filteredBatches.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-indigo-600" />
                        Bulk Analysis Batches
                        <span className="text-xs font-normal text-slate-400">({filteredBatches.length} batches)</span>
                    </h2>
                    <div className="space-y-4">
                        {filteredBatches.map((batch) => (
                            <div key={batch.batchId} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                {/* Batch Header */}
                                <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                            <Layers className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold text-slate-800">
                                                Bulk Upload — {batch.tasks.length} files
                                            </span>
                                            <div className="text-xs text-slate-500">{formatDate(batch.createdAt)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const firstTaskId = batch.tasks[0]?.id
                                                if (firstTaskId) {
                                                    window.open(`/api/audit/export-batch?batchTaskId=${firstTaskId}`, '_blank')
                                                }
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/50 cursor-pointer"
                                        >
                                            <FileDown className="h-3.5 w-3.5" />
                                            Export CSV
                                        </button>
                                    </div>
                                </div>
                                {/* Batch Tasks */}
                                <div className="divide-y divide-slate-100">
                                    {batch.tasks.map((task) => {
                                        const analysisData = task.analysisId ? bulkAnalysisMap[task.analysisId] : null
                                        const score = analysisData?.complianceScore ?? null
                                        const scoreColor = score !== null ? getScoreColor(score) : null

                                        return (
                                            <div key={task.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                                                        <FileText className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                                                            {displayFileName(task.fileName)}
                                                        </div>
                                                        {analysisData?.participantName && (
                                                            <div className="text-xs text-slate-500">{analysisData.participantName}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    {scoreColor && score !== null ? (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${scoreColor.bg} ${scoreColor.text} border ${scoreColor.border}`}>
                                                            {getScoreIcon(score)}
                                                            {score}%
                                                        </span>
                                                    ) : (
                                                        getStatusBadge(task.status)
                                                    )}
                                                    {task.fileUrl && task.status === 'completed' ? (
                                                        <button
                                                            onClick={() => handleSecureDownload(task.fileUrl!)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200/50 cursor-pointer"
                                                        >
                                                            <Download className="h-3 w-3" />
                                                            PDF
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Empty State ── */}
            {filteredSingle.length === 0 && filteredBatches.length === 0 && (
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl py-16">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                            <Search className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium">No service agreement analyses found.</p>
                        <p className="text-xs text-slate-400 mt-1">Upload a document in the Validator to get started.</p>
                    </div>
                </div>
            )}

            {/* ── Footer Note ── */}
            <div className="text-center py-4">
                <p className="text-xs text-slate-400">
                    All data is encrypted at rest and compliant with NDIS Practice Standards 2025/26.
                    Downloads use temporary SAS tokens (1-hour expiry) for secure access.
                </p>
            </div>
        </div>
    )
}
