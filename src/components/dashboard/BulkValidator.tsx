'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
    UploadCloud, FileText, CheckCircle, AlertCircle, Loader2,
    Play, Pause, Trash2, Eye, X, ShieldAlert, TrendingUp
} from 'lucide-react'

type FileStatus = 'idle' | 'uploading' | 'pending' | 'processing' | 'completed' | 'failed'

interface AnalysisResult {
    participantName: string
    complianceScore: number
    warnings: string[]
}

interface QueuedFile {
    id: string
    file: File
    status: FileStatus
    progress: number
    error?: string
    taskId?: string
    analysisId?: string
    result?: AnalysisResult
}

// ---------------------------------------------------------------------------
// Score Color Helper
// ---------------------------------------------------------------------------

function getScoreColor(score: number) {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200'
    if (score >= 40) return 'text-orange-700 bg-orange-50 border-orange-200'
    return 'text-red-700 bg-red-50 border-red-200'
}

// ---------------------------------------------------------------------------
// Analysis Detail Modal
// ---------------------------------------------------------------------------

function AnalysisModal({ result, fileName, onClose }: { result: AnalysisResult; fileName: string; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-teal-600" />
                            NDIS Compliance Report
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{fileName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Score + Participant */}
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-xl border font-bold text-xl ${getScoreColor(result.complianceScore)}`}>
                            {result.complianceScore}%
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-800">Compliance Score</div>
                            <div className="text-xs text-slate-500">Participant: {result.participantName}</div>
                        </div>
                    </div>

                    {/* Warnings */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-amber-500" />
                            Compliance Warnings ({result.warnings.length})
                        </h4>
                        {result.warnings.length > 0 ? (
                            <div className="space-y-2">
                                {result.warnings.map((warning, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                        <p className="text-sm text-slate-700">{typeof warning === 'string' ? warning : JSON.stringify(warning)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                No compliance warnings detected. This document meets NDIS 2025/26 standards.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer with Addendum Generator */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                        Azure OpenAI (Sydney) • NDIS 2025/26
                    </p>
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/validator/generate-addendum', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        fileName,
                                        participantName: result.participantName,
                                        complianceScore: result.complianceScore,
                                        warnings: result.warnings,
                                    })
                                })
                                if (!res.ok) throw new Error('Failed to generate')
                                const blob = await res.blob()
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `NDIS_Addendum_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
                                a.click()
                                URL.revokeObjectURL(url)
                            } catch {
                                alert('Failed to generate addendum. Please try again.')
                            }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        Generate Master Addendum
                    </button>
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function BulkValidator() {
    const [queue, setQueue] = useState<QueuedFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isProcessingLoopActive, setIsProcessingLoopActive] = useState(false)
    const [viewingResult, setViewingResult] = useState<{ result: AnalysisResult; fileName: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ── Drag & Drop Handlers ──
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }

    const addFilesToQueue = (files: FileList | File[]) => {
        const newFiles: QueuedFile[] = Array.from(files)
            .filter(f => f.type === 'application/pdf' && f.size <= 20 * 1024 * 1024)
            .map(file => ({ id: crypto.randomUUID(), file, status: 'idle', progress: 0 }))
        setQueue(prev => [...prev, ...newFiles])
    }

    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) addFilesToQueue(e.dataTransfer.files) }
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) addFilesToQueue(e.target.files) }
    const removeFile = (id: string) => setQueue(prev => prev.filter(q => q.id !== id))

    // ── Metrics ──
    const totalFiles = queue.length
    const completedFiles = queue.filter(q => q.status === 'completed').length
    const failedFiles = queue.filter(q => q.status === 'failed').length
    const progressPercent = totalFiles > 0 ? Math.round(((completedFiles + failedFiles) / totalFiles) * 100) : 0

    const startBulkProcess = () => setIsProcessingLoopActive(true)
    const pauseBulkProcess = () => setIsProcessingLoopActive(false)

    // ── Step 1: Upload ──
    useEffect(() => {
        if (!isProcessingLoopActive) return
        const uploadNextFile = async () => {
            const idleFile = queue.find(q => q.status === 'idle')
            if (!idleFile) return
            setQueue(prev => prev.map(q => q.id === idleFile.id ? { ...q, status: 'uploading' } : q))
            try {
                const formData = new FormData()
                formData.append('file', idleFile.file)
                const res = await fetch('/api/validator/bulk-upload', { method: 'POST', body: formData })
                if (!res.ok) throw new Error('Failed to upload')
                const data = await res.json()
                setQueue(prev => prev.map(q => q.id === idleFile.id ? { ...q, status: 'pending', taskId: data.taskId } : q))
            } catch (err: any) {
                setQueue(prev => prev.map(q => q.id === idleFile.id ? { ...q, status: 'failed', error: err.message } : q))
            }
        }
        const uploadingCount = queue.filter(q => q.status === 'uploading').length
        if (uploadingCount < 3) uploadNextFile()
    }, [queue, isProcessingLoopActive])

    // ── Step 2: Process ──
    useEffect(() => {
        if (!isProcessingLoopActive) return
        const processNextFile = async () => {
            const pendingFile = queue.find(q => q.status === 'pending')
            if (!pendingFile || !pendingFile.taskId) return
            setQueue(prev => prev.map(q => q.id === pendingFile.id ? { ...q, status: 'processing' } : q))
            try {
                const res = await fetch('/api/validator/bulk-process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ taskId: pendingFile.taskId })
                })
                if (!res.ok) throw new Error('Analysis Extract Failed')
                const data = await res.json()
                setQueue(prev => prev.map(q => q.id === pendingFile.id ? {
                    ...q,
                    status: 'completed',
                    analysisId: data.analysisId,
                    progress: 100,
                    result: data.result
                } : q))
            } catch (err: any) {
                setQueue(prev => prev.map(q => q.id === pendingFile.id ? { ...q, status: 'failed', error: err.message } : q))
            }
        }
        const processingCount = queue.filter(q => q.status === 'processing').length
        if (processingCount === 0) processNextFile()
    }, [queue, isProcessingLoopActive])

    return (
        <>
            {viewingResult && (
                <AnalysisModal
                    result={viewingResult.result}
                    fileName={viewingResult.fileName}
                    onClose={() => setViewingResult(null)}
                />
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <UploadCloud className="h-5 w-5 text-teal-600" />
                            Bulk Analysis Queue
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Drop up to 50 PDFs. 20MB limit per file. Processed sequentially in Sydney (ap-southeast-2).
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {totalFiles > 0 && (
                            <div className="text-right mr-4">
                                <span className="text-xl font-bold text-slate-800">{progressPercent}%</span>
                                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Completed</p>
                            </div>
                        )}
                        {!isProcessingLoopActive ? (
                            <button
                                onClick={startBulkProcess}
                                disabled={queue.filter(q => q.status === 'idle' || q.status === 'pending').length === 0}
                                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                <Play className="h-4 w-4 fill-current" /> Start Processing
                            </button>
                        ) : (
                            <button
                                onClick={pauseBulkProcess}
                                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm"
                            >
                                <Pause className="h-4 w-4 fill-current" /> Pause Sequence
                            </button>
                        )}
                    </div>
                </div>

                {/* Dropzone or Queue */}
                {totalFiles === 0 ? (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 m-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 transition-all cursor-pointer ${isDragging ? 'border-teal-400 bg-teal-50/50 scale-[0.99]' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'}`}
                    >
                        <input type="file" multiple accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileInput} />
                        <div className="h-16 w-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
                            <UploadCloud className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">Drop NDIS PDFs here</h3>
                        <p className="text-slate-500 text-sm max-w-sm text-center">
                            Securely enqueue multiple Service Agreements for automated compliance auditing.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col h-full bg-slate-50">
                        <div className="h-1.5 w-full bg-slate-100">
                            <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[600px]">
                            {queue.map((item, idx) => (
                                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                                    <span className="text-slate-400 font-mono text-xs w-6">{idx + 1}</span>
                                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex flex-shrink-0 items-center justify-center text-indigo-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-slate-800 truncate">{item.file.name}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>

                                    <div className="flex-shrink-0 flex items-center gap-2">
                                        {/* Score badge for completed */}
                                        {item.status === 'completed' && item.result && (
                                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${getScoreColor(item.result.complianceScore)}`}>
                                                {item.result.complianceScore}%
                                            </span>
                                        )}

                                        {/* Status badges */}
                                        {item.status === 'idle' && <span className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-lg tracking-wide uppercase">Queued</span>}
                                        {item.status === 'uploading' && <span className="px-2.5 py-1 text-[11px] font-medium bg-blue-100 text-blue-700 rounded-lg tracking-wide flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Uploading</span>}
                                        {item.status === 'pending' && <span className="px-2.5 py-1 text-[11px] font-medium bg-amber-100 text-amber-700 rounded-lg tracking-wide uppercase">Pending Azure</span>}
                                        {item.status === 'processing' && <span className="px-2.5 py-1 text-[11px] font-medium bg-teal-100 text-teal-700 rounded-lg tracking-wide uppercase flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Analyzing</span>}
                                        {item.status === 'failed' && <span className="px-2.5 py-1 text-[11px] font-medium bg-rose-100 text-rose-700 rounded-lg tracking-wide uppercase flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Failed</span>}

                                        {/* View Analysis button for completed */}
                                        {item.status === 'completed' && item.result && (
                                            <button
                                                onClick={() => setViewingResult({ result: item.result!, fileName: item.file.name })}
                                                className="px-3 py-1.5 text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-1.5"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> View Analysis
                                            </button>
                                        )}

                                        {/* Remove button */}
                                        {(item.status === 'idle' || item.status === 'failed') && (
                                            <button onClick={() => removeFile(item.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50/50 hover:border-teal-200 transition-colors cursor-pointer mt-2"
                            >
                                <input type="file" multiple accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileInput} />
                                <UploadCloud className="h-4 w-4" />
                                <span className="text-sm font-medium">Add more documents</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
