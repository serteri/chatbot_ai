'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Play, Pause, Trash2 } from 'lucide-react'

type FileStatus = 'idle' | 'uploading' | 'pending' | 'processing' | 'completed' | 'failed'

interface QueuedFile {
    id: string
    file: File
    status: FileStatus
    progress: number
    error?: string
    taskId?: string // DB Reference
    analysisId?: string // Final result reference
}

export default function BulkValidator() {
    const [queue, setQueue] = useState<QueuedFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isProcessingLoopActive, setIsProcessingLoopActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ── Drag & Drop Handlers ──
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const addFilesToQueue = (files: FileList | File[]) => {
        const newFiles: QueuedFile[] = Array.from(files)
            .filter(f => f.type === 'application/pdf' && f.size <= 20 * 1024 * 1024)
            .map(file => ({
                id: crypto.randomUUID(),
                file,
                status: 'idle',
                progress: 0
            }))

        setQueue(prev => [...prev, ...newFiles])
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files) {
            addFilesToQueue(e.dataTransfer.files)
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFilesToQueue(e.target.files)
        }
    }

    const removeFile = (id: string) => {
        setQueue(prev => prev.filter(q => q.id !== id))
    }

    // ── Metrics ──
    const totalFiles = queue.length
    const completedFiles = queue.filter(q => q.status === 'completed').length
    const failedFiles = queue.filter(q => q.status === 'failed').length
    const progressPercent = totalFiles > 0 ? Math.round(((completedFiles + failedFiles) / totalFiles) * 100) : 0

    // ── Processing Logic Hooks ──
    const startBulkProcess = () => setIsProcessingLoopActive(true)
    const pauseBulkProcess = () => setIsProcessingLoopActive(false)

    // Sequence Step 1: Upload Idle Files to Azure Blob
    useEffect(() => {
        if (!isProcessingLoopActive) return

        const uploadNextFile = async () => {
            const idleFile = queue.find(q => q.status === 'idle')
            if (!idleFile) return // No more files to upload

            // Mark as uploading
            setQueue(prev => prev.map(q => q.id === idleFile.id ? { ...q, status: 'uploading' } : q))

            try {
                const formData = new FormData()
                formData.append('file', idleFile.file)

                const res = await fetch('/api/validator/bulk-upload', {
                    method: 'POST',
                    body: formData
                })

                if (!res.ok) throw new Error('Failed to upload')

                const data = await res.json()

                // Mark as pending Azure OpenAI processing
                setQueue(prev => prev.map(q => q.id === idleFile.id ? { ...q, status: 'pending', taskId: data.taskId } : q))
            } catch (err: any) {
                setQueue(prev => prev.map(q => q.id === idleFile.id ? { ...q, status: 'failed', error: err.message } : q))
            }
        }

        const uploadingCount = queue.filter(q => q.status === 'uploading').length
        // Process up to 3 uploads concurrently to Azure
        if (uploadingCount < 3) {
            uploadNextFile()
        }

    }, [queue, isProcessingLoopActive])

    // Sequence Step 2: Trigger Analysis for Pending Tasks
    useEffect(() => {
        if (!isProcessingLoopActive) return

        const processNextFile = async () => {
            const pendingFile = queue.find(q => q.status === 'pending')
            if (!pendingFile || !pendingFile.taskId) return

            // Mark as processing
            setQueue(prev => prev.map(q => q.id === pendingFile.id ? { ...q, status: 'processing' } : q))

            try {
                const res = await fetch('/api/validator/bulk-process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ taskId: pendingFile.taskId })
                })

                if (!res.ok) throw new Error('Analysis Extract Failed')

                const data = await res.json()

                // Mark as completed
                setQueue(prev => prev.map(q => q.id === pendingFile.id ? { ...q, status: 'completed', analysisId: data.analysisId, progress: 100 } : q))
            } catch (err: any) {
                setQueue(prev => prev.map(q => q.id === pendingFile.id ? { ...q, status: 'failed', error: err.message } : q))
            }
        }

        const processingCount = queue.filter(q => q.status === 'processing').length
        // STRICTLY sequential to avoid Vercel timeouts and OpenAI rate limits (1 at a time)
        if (processingCount === 0) {
            processNextFile()
        }

    }, [queue, isProcessingLoopActive])

    return (
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

            {/* Dropzone Area */}
            {totalFiles === 0 ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 m-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 transition-all cursor-pointer ${isDragging ? 'border-teal-400 bg-teal-50/50 scale-[0.99]' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'}`}
                >
                    <input
                        type="file"
                        multiple
                        accept="application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileInput}
                    />
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

                                <div className="w-48 flex-shrink-0 flex items-center justify-end gap-3">
                                    {/* Status Indicators */}
                                    {item.status === 'idle' && <span className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-lg tracking-wide uppercase">Queued</span>}
                                    {item.status === 'uploading' && <span className="px-2.5 py-1 text-[11px] font-medium bg-blue-100 text-blue-700 rounded-lg tracking-wide flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Uploading</span>}
                                    {item.status === 'pending' && <span className="px-2.5 py-1 text-[11px] font-medium bg-amber-100 text-amber-700 rounded-lg tracking-wide uppercase">Pending Azure</span>}
                                    {item.status === 'processing' && <span className="px-2.5 py-1 text-[11px] font-medium bg-teal-100 text-teal-700 rounded-lg tracking-wide uppercase flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Analyzing</span>}
                                    {item.status === 'completed' && <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-100 text-emerald-700 rounded-lg tracking-wide uppercase flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Done</span>}
                                    {item.status === 'failed' && <span className="px-2.5 py-1 text-[11px] font-medium bg-rose-100 text-rose-700 rounded-lg tracking-wide uppercase flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Failed</span>}

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
                            className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50/50 hover:border-teal-200 transition-colors cursor-pointer cursor-allowed mt-2"
                        >
                            <input
                                type="file"
                                multiple
                                accept="application/pdf"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileInput}
                            />
                            <UploadCloud className="h-4 w-4" />
                            <span className="text-sm font-medium">Add more documents</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
