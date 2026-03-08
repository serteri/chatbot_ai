'use client'

import React, { useState } from 'react'
import { Search, FileText, Download, ShieldCheck, CheckCircle2, XCircle, TrendingUp, AlertTriangle, Layers, Lock, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

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

function displayFileName(raw: string): string {
    const match = raw.match(/^\d+-[a-f0-9]+-(.+)$/i)
    if (match) return match[1].replace(/_/g, ' ')
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
        case 'completed': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> Done</span>
        case 'failed': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><XCircle className="h-3 w-3" /> Failed</span>
        default: return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">Pending</span>
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
    const [searchQuery, setSearchQuery] = useState('')
    const [isExporting, setIsExporting] = useState(false)

    const filteredSingle = singleAnalyses.filter(record =>
        record.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.participantName && record.participantName.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const filteredBatches = bulkBatches.filter(batch =>
        batch.tasks.some(t => t.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const totalRecords = singleAnalyses.length + bulkBatches.reduce((sum, b) => sum + b.tasks.length, 0)

    const handleBulkExportZip = async () => {
        setIsExporting(true)
        const loadingToast = toast.loading('Preparing bulk ZIP export...')

        try {
            const zip = new JSZip()
            const folder = zip.folder('PylonChat_Audit_Export')

            if (!folder) throw new Error('Could not create folder')

            // Single Files
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

            // Bulk Files
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
            saveAs(content, `Document_Vault_Export_${new Date().toISOString().split('T')[0]}.zip`)
            toast.success('Audit ZIP generated successfully!', { id: loadingToast })

        } catch (error) {
            toast.error('Failed to generate ZIP export.', { id: loadingToast })
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Lock className="h-5 w-5 text-white" />
                    </div>
                    Document Vault (Audit Hub)
                </h1>
                <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                    All compliance analyses and master addendums are securely stored in the Sovereign
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-600 mx-1">ap-southeast-2</span>
                    region and encrypted at rest for strict audit readiness.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by document name or participant..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-shadow"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleBulkExportZip}
                        disabled={isExporting}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-xl transition-all shadow-sm"
                    >
                        <FileDown className="h-4 w-4" />
                        {isExporting ? 'Preparing ZIP...' : 'Bulk Export for Audit (ZIP)'}
                    </button>
                </div>
            </div>

            {/* Single Records */}
            {filteredSingle.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-cyan-600" />
                        Single Analysis Records
                        <span className="text-xs font-normal text-slate-400">({filteredSingle.length})</span>
                    </h2>
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase">Document Name</th>
                                    <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase">Date Created</th>
                                    <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase">Compliance Score</th>
                                    <th className="py-3 px-5 text-xs text-right font-semibold text-slate-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSingle.map((record) => {
                                    const scoreColor = getScoreColor(record.complianceScore)
                                    return (
                                        <tr key={record.id} className="hover:bg-slate-50/50">
                                            <td className="py-3.5 px-5 font-medium text-sm text-slate-900 border-b border-slate-100">
                                                {displayFileName(record.fileName)}
                                                {record.participantName && <div className="text-xs text-slate-500 font-normal">Participant: {record.participantName}</div>}
                                            </td>
                                            <td className="py-3.5 px-5 text-sm text-slate-500 border-b border-slate-100">
                                                {formatDate(record.createdAt)}
                                            </td>
                                            <td className="py-3.5 px-5 border-b border-slate-100">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${scoreColor.bg} ${scoreColor.text} border ${scoreColor.border}`}>
                                                    {getScoreIcon(record.complianceScore)} {record.complianceScore}%
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 text-right border-b border-slate-100">
                                                <div className="flex justify-end gap-2">
                                                    <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                                                        <FileText className="h-3.5 w-3.5" /> Download Original
                                                    </button>
                                                    {record.pdfUrl ? (
                                                        <button onClick={() => handleSecureDownload(record.pdfUrl!)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm">
                                                            <Download className="h-3.5 w-3.5" /> Download Addendum
                                                        </button>
                                                    ) : <span className="text-xs text-slate-400 italic px-3 py-1.5">No Addendum</span>}
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

            {/* Bulk Records */}
            {filteredBatches.length > 0 && (
                <div className="pt-4">
                    <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-cyan-600" />
                        Bulk Processing Batches
                        <span className="text-xs font-normal text-slate-400">({filteredBatches.length})</span>
                    </h2>
                    <div className="space-y-4">
                        {filteredBatches.map(batch => (
                            <div key={batch.batchId} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                                    <div className="font-semibold text-sm text-slate-800">Batch of {batch.tasks.length} files <span className="text-slate-500 font-normal text-xs ml-2">({formatDate(batch.createdAt)})</span></div>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {batch.tasks.map(task => {
                                        const analysisData = task.analysisId ? bulkAnalysisMap[task.analysisId] : null
                                        const score = analysisData?.complianceScore ?? null
                                        const scoreColor = score !== null ? getScoreColor(score) : null
                                        return (
                                            <div key={task.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
                                                <div>
                                                    <div className="text-sm font-medium">{displayFileName(task.fileName)}</div>
                                                    {analysisData?.participantName && <div className="text-xs text-slate-500">{analysisData.participantName}</div>}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {score !== null && scoreColor ? (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${scoreColor.bg} ${scoreColor.text} border ${scoreColor.border}`}>{score}%</span>
                                                    ) : getStatusBadge(task.status)}

                                                    <button className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md">
                                                        <FileText className="h-3 w-3" /> Original
                                                    </button>

                                                    {task.fileUrl && task.status === 'completed' && (
                                                        <button onClick={() => handleSecureDownload(task.fileUrl!)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md">
                                                            <Download className="h-3 w-3" /> Addendum
                                                        </button>
                                                    )}
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
        </div>
    )
}
