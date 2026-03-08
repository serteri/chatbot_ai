'use client'

import React, { useState } from 'react'
import {
    Search, FileText, Download, ShieldCheck, CheckCircle2,
    XCircle, TrendingUp, AlertTriangle, Layers, Lock,
    FileDown, ChevronDown, ChevronUp, ChevronRight, Activity, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useTranslations } from 'next-intl'
import { format, parseISO } from 'date-fns'

interface AnalysisRecord {
    id: string
    fileName: string
    participantName: string | null
    complianceScore: number
    warnings: any[]
    pdfUrl: string | null
    region: string
    createdAt: string
    documentStartDate?: string | null
    documentEndDate?: string | null
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
    documentStartDate?: string | null
    documentEndDate?: string | null
}

interface Props {
    singleAnalyses: AnalysisRecord[]
    bulkBatches: BulkBatch[]
    bulkAnalysisMap: Record<string, BulkAnalysisData>
}

// Helpers
function displayFileName(raw: string): string {
    const match = raw.match(/^\d+-[a-f0-9]+-(.+)$/i)
    if (match) return match[1].replace(/_/g, ' ')
    const simpleMatch = raw.match(/^\d+-(.+)$/i)
    if (simpleMatch) return simpleMatch[1].replace(/_/g, ' ')
    return raw
}

function formatDate(isoString: string | null | undefined) {
    if (!isoString) return 'N/A'
    try {
        const date = typeof isoString === 'string' && isoString.includes('T') ? parseISO(isoString) : new Date(isoString)
        if (isNaN(date.getTime())) return 'Invalid Date'
        return format(date, 'dd MMM yyyy')
    } catch {
        return 'Invalid Date'
    }
}

function getScoreColor(score: number) {
    if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
    if (score >= 60) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
    if (score >= 40) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
}

function getScoreIcon(score: number) {
    if (score >= 80) return <CheckCircle2 className="h-3.5 w-3.5" />
    if (score >= 60) return <TrendingUp className="h-3.5 w-3.5" />
    if (score >= 40) return <AlertTriangle className="h-3.5 w-3.5" />
    return <XCircle className="h-3.5 w-3.5" />
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'completed': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Done</span>
        case 'failed': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700"><XCircle className="h-3 w-3" /> Failed</span>
        default: return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"><Clock className="h-3 w-3" /> Pending</span>
    }
}

async function handleSecureDownload(pdfUrl: string) {
    try {
        const res = await fetch(`/api/validator/secure-download?url=${encodeURIComponent(pdfUrl)}`)
        const data = await res.json()
        if (data.url) {
            window.open(data.url, '_blank')
        } else {
            toast.error('Failed to generate secure download link.')
        }
    } catch {
        toast.error('Download error. Please try again.')
    }
}

export default function DocumentVault({ singleAnalyses, bulkBatches, bulkAnalysisMap }: Props) {
    const t = useTranslations('nav')

    const [searchQuery, setSearchQuery] = useState('')
    const [scoreThreshold, setScoreThreshold] = useState<number>(100)
    const [endDateStart, setEndDateStart] = useState<string>('')
    const [endDateEnd, setEndDateEnd] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isExporting, setIsExporting] = useState(false)
    const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({})

    const toggleBatch = (batchId: string) => {
        setExpandedBatches(prev => ({ ...prev, [batchId]: !prev[batchId] }))
    }

    // Filter Logic
    const meetsScore = (score: number | null) => score === null || score <= scoreThreshold

    const meetsDateRange = (endDateIso?: string | null) => {
        if (!endDateStart && !endDateEnd) return true
        if (!endDateIso) return false
        const tDate = endDateIso.split('T')[0]
        if (endDateStart && tDate < endDateStart) return false
        if (endDateEnd && tDate > endDateEnd) return false
        return true
    }

    const meetsStatus = (score: number | null, taskStatus: string, hasPdf: boolean) => {
        if (statusFilter === 'all') return true
        if (statusFilter === 'active') return hasPdf
        if (statusFilter === 'pending') return taskStatus !== 'completed' && taskStatus !== 'failed'
        if (statusFilter === 'audit-ready') return score !== null && score >= 80 && hasPdf
        return true
    }

    const filteredSingle = singleAnalyses.filter(record => {
        const matchesSearch = record.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (record.participantName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        return matchesSearch && meetsScore(record.complianceScore) && meetsDateRange(record.documentEndDate) && meetsStatus(record.complianceScore, 'completed', !!record.pdfUrl)
    })

    const filteredBatches = bulkBatches.map(batch => {
        const matchedTasks = batch.tasks.filter(task => {
            const matchesSearch = task.fileName.toLowerCase().includes(searchQuery.toLowerCase())
            const analysisData = task.analysisId ? bulkAnalysisMap[task.analysisId] : null
            const score = analysisData?.complianceScore ?? null
            return matchesSearch && meetsScore(score) && meetsDateRange(analysisData?.documentEndDate) && meetsStatus(score, task.status, !!task.fileUrl)
        })
        return { ...batch, tasks: matchedTasks }
    }).filter(batch => batch.tasks.length > 0)

    const totalRecords = singleAnalyses.length + bulkBatches.reduce((sum, b) => sum + b.tasks.length, 0)
    const activeAddendums = singleAnalyses.filter(a => a.pdfUrl).length + bulkBatches.reduce((sum, b) => sum + b.tasks.filter(t => t.fileUrl).length, 0)
    const complianceTotal = singleAnalyses.reduce((sum, a) => sum + a.complianceScore, 0)
    const avgScore = singleAnalyses.length > 0 ? Math.round(complianceTotal / singleAnalyses.length) : 0

    const handleBulkExportZip = async () => {
        setIsExporting(true)
        const loadingToast = toast.loading('Preparing bulk ZIP export...')

        try {
            const zip = new JSZip()
            const folder = zip.folder('PylonChat_Audit_Export')
            if (!folder) throw new Error('Could not create folder')

            const singleHasUrl = singleAnalyses.filter(a => a.pdfUrl)
            for (const record of singleHasUrl) {
                try {
                    const res = await fetch(`/api/validator/secure-download?url=${encodeURIComponent(record.pdfUrl!)}`)
                    const data = await res.json()
                    if (data.url) {
                        const pdfBlob = await fetch(data.url).then(r => r.blob())
                        folder.file(`${displayFileName(record.fileName)}_Addendum.pdf`, pdfBlob)
                    }
                } catch (e) {
                    console.error("Failed to fetch a zip file", e)
                }
            }

            for (const batch of bulkBatches) {
                const batchFolder = folder.folder(batch.batchId)
                if (!batchFolder) continue
                for (const task of batch.tasks) {
                    if (task.status === 'completed' && task.fileUrl) {
                        try {
                            const res = await fetch(`/api/validator/secure-download?url=${encodeURIComponent(task.fileUrl)}`)
                            const data = await res.json()
                            if (data.url) {
                                const pdfBlob = await fetch(data.url).then(r => r.blob())
                                batchFolder.file(`${displayFileName(task.fileName)}_Addendum.pdf`, pdfBlob)
                            }
                        } catch (e) {
                            console.error("Failed to fetch bulk zip file", e)
                        }
                    }
                }
            }

            const content = await zip.generateAsync({ type: 'blob' })
            saveAs(content, `Audit_Export_${new Date().toISOString().split('T')[0]}.zip`)
            toast.success('Audit ZIP generated successfully!', { id: loadingToast })
        } catch (error) {
            toast.error('Failed to generate ZIP export.', { id: loadingToast })
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 text-slate-900 bg-[#f8fafc] min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        {t('vault', { fallback: 'Audit Hub & Document Vault' })}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                        Securely manage NDIS service agreements and compliance addendums. Hosted in Sydney (<span className="font-mono text-xs">ap-southeast-2</span>).
                    </p>
                </div>
                <button
                    onClick={handleBulkExportZip}
                    disabled={isExporting}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-xl transition-all shadow-md shrink-0 focus:ring-2 focus:ring-slate-900/20 outline-none"
                >
                    <FileDown className="h-4 w-4" />
                    {isExporting ? 'Packaging...' : 'Export Verified Batch'}
                </button>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-slate-500">Total Analyses</span>
                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Layers className="h-4 w-4" /></div>
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{totalRecords}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-slate-500">Active Addendums</span>
                        <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg"><FileText className="h-4 w-4" /></div>
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{activeAddendums}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-slate-500">Avg. Compliance</span>
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Activity className="h-4 w-4" /></div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{avgScore}%</span>
                        {avgScore >= 80 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-slate-500">Security Target</span>
                        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Lock className="h-4 w-4" /></div>
                    </div>
                    <span className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded inline-block w-max">ISO 27001 Ready</span>
                </div>
            </div>

            {/* Advanced Filter Row */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-700">Audit Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="col-span-1 md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Participant or Document..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                        />
                    </div>
                    {/* Date Expiry */}
                    <div className="col-span-1 md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Plan Expiry Date Range</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={endDateStart}
                                onChange={(e) => setEndDateStart(e.target.value)}
                                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                            />
                            <span className="text-slate-400 font-medium text-xs">to</span>
                            <input
                                type="date"
                                value={endDateEnd}
                                onChange={(e) => setEndDateEnd(e.target.value)}
                                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                            />
                        </div>
                    </div>
                    {/* Score Slider */}
                    <div className="col-span-1 md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Maximum Score: {scoreThreshold}%</label>
                        <input
                            type="range" min="0" max="100" step="1"
                            value={scoreThreshold}
                            onChange={(e) => setScoreThreshold(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 mt-2"
                        />
                    </div>
                    {/* Status Select */}
                    <div className="col-span-1 md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                        >
                            <option value="all">All Records</option>
                            <option value="active">Active Addendums</option>
                            <option value="audit-ready">Audit-Ready (80%+)</option>
                            <option value="pending">Pending Processing</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Single Records Table */}
            {filteredSingle.length > 0 && (
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                        <FileText className="h-4 w-4 text-slate-600" />
                        <h2 className="text-sm font-semibold text-slate-800">Single Priority Analyses</h2>
                        <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 rounded-full">{filteredSingle.length}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-white">
                                    <th className="py-3 px-5 text-xs text-slate-400 font-medium tracking-wide uppercase">Document</th>
                                    <th className="py-3 px-5 text-xs text-slate-400 font-medium tracking-wide uppercase">Plan Expiry</th>
                                    <th className="py-3 px-5 text-xs text-slate-400 font-medium tracking-wide uppercase">Compliance</th>
                                    <th className="py-3 px-5 text-xs text-right text-slate-400 font-medium tracking-wide uppercase">Export</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredSingle.map((record) => {
                                    const scoreColor = getScoreColor(record.complianceScore)
                                    return (
                                        <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3.5 px-5">
                                                <div className="font-semibold text-sm text-slate-700 truncate max-w-[200px]">
                                                    {displayFileName(record.fileName)}
                                                </div>
                                                {record.participantName && (
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        <span className="font-medium text-slate-400">P:</span> {record.participantName}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-5 text-sm text-slate-600">
                                                {formatDate(record?.documentEndDate)}
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${scoreColor.bg} ${scoreColor.text} border ${scoreColor.border}`}>
                                                    {getScoreIcon(record.complianceScore)} {record.complianceScore}%
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent" title="Review Original">
                                                        <Search className="h-4 w-4" />
                                                    </button>
                                                    {record.pdfUrl && (
                                                        <button onClick={() => handleSecureDownload(record.pdfUrl!)} className="p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors border border-transparent" title="Download Addendum">
                                                            <Download className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Bulk Batch Accordions */}
            {filteredBatches.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <Layers className="h-4 w-4 text-slate-600" />
                        <h2 className="text-sm font-semibold text-slate-800">Bulk Verification Batches</h2>
                        <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 rounded-full">{filteredBatches.length}</span>
                    </div>

                    {filteredBatches.map(batch => {
                        const isExpanded = expandedBatches[batch.batchId]
                        return (
                            <div key={batch.batchId} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-300">
                                <button
                                    onClick={() => toggleBatch(batch.batchId)}
                                    className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors focus:outline-none"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                            <Layers className="h-4 w-4" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-sm text-slate-800">
                                                Batch: {formatDate(batch.createdAt)}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {batch.tasks.length} documents indexed
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                            {batch.tasks.filter(t => t.status === 'completed').length} Processed
                                        </div>
                                        <div className="text-slate-400">
                                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                        </div>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-slate-100 bg-slate-50/30">
                                        <div className="divide-y divide-slate-100/60">
                                            {batch.tasks.map(task => {
                                                const analysisData = task.analysisId ? bulkAnalysisMap[task.analysisId] : null
                                                const score = analysisData?.complianceScore ?? null
                                                const scoreColor = score !== null ? getScoreColor(score) : null

                                                return (
                                                    <div key={task.id} className="px-5 py-3 flex items-center justify-between hover:bg-white transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-4 w-4 text-slate-300 shrink-0" />
                                                            <div>
                                                                <div className="text-sm font-medium text-slate-700 truncate max-w-[150px] sm:max-w-xs">{displayFileName(task.fileName)}</div>
                                                                {analysisData?.participantName && <div className="text-xs text-slate-500">P: {analysisData.participantName}</div>}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            {score !== null && scoreColor ? (
                                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${scoreColor.bg} ${scoreColor.text} border ${scoreColor.border}`}>
                                                                    {score}%
                                                                </span>
                                                            ) : getStatusBadge(task.status)}

                                                            <div className="flex gap-1 border-l border-slate-200 pl-3">
                                                                <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" title="Review Original">
                                                                    <Search className="h-3.5 w-3.5" />
                                                                </button>
                                                                {task.fileUrl && task.status === 'completed' && (
                                                                    <button onClick={() => handleSecureDownload(task.fileUrl!)} className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors" title="Download Addendum">
                                                                        <Download className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {filteredSingle.length === 0 && filteredBatches.length === 0 && (
                <div className="bg-white border text-center border-slate-200 shadow-sm rounded-2xl py-20 px-4">
                    <div className="mx-auto h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">No Audits Found</h3>
                    <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">Either change your advanced filters or run a new batch analysis via the Validator.</p>
                </div>
            )}
        </div>
    )
}
