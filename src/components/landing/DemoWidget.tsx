'use client'

import React, { useState, useEffect } from 'react'
import { Upload, FileText, AlertTriangle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

export default function DemoWidget() {
    const [file, setFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<any>(null)

    useEffect(() => {
        const stored = sessionStorage.getItem('ndisshield_demo_result')
        if (stored) {
            setResult(JSON.parse(stored))
        }
    }, [])

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        if (result) return toast.info('You have already used your free analysis.')
        const dropped = e.dataTransfer.files[0]
        handleFileSelect(dropped)
    }

    const handleFileSelect = async (selected: File) => {
        if (result) return toast.info('You have already used your free analysis.')
        if (selected && selected.name.toLowerCase().endsWith('.pdf')) {
            setFile(selected)
            await analyzeDemo(selected)
        } else {
            toast.error('Please upload a PDF file.')
        }
    }

    const analyzeDemo = async (fileObj: File) => {
        setIsAnalyzing(true)
        const toastId = toast.loading('Analyzing document against NDIS 2025/26 standards...')

        try {
            const formData = new FormData()
            formData.append('file', fileObj)

            const res = await fetch('/api/public/demo-analyze', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to analyze')

            setResult(data)
            sessionStorage.setItem('ndisshield_demo_result', JSON.stringify(data))
            toast.success('Analysis complete!', { id: toastId })
        } catch (e: any) {
            toast.error(e.message, { id: toastId })
            setFile(null)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const warnings = result?.analysis?.warnings || []
    const topGap = warnings.length > 0 ? warnings[0] : null
    const score = result?.analysis?.complianceScore ?? 100

    const remainingGapsCount = Math.max(0, warnings.length - 1)

    const getActiveClause = (warning: string) => {
        const lowerWarning = warning.toLowerCase()
        if (lowerWarning.includes('consent') || lowerWarning.includes('privacy') || lowerWarning.includes('sharing')) return "Clause 1.1: Informed Consent: The participant hereby provides informed consent to collect and share necessary care information strictly as required by the NDIS Act 2013."
        if (lowerWarning.includes('date') || lowerWarning.includes('start') || lowerWarning.includes('end')) return "Clause 1.1: Duration: The Service Agreement shall commence on [Start Date] and remain in effect until [End Date]."
        if (lowerWarning.includes('nominee') || lowerWarning.includes('rep')) return "Clause 1.1: Representation: The nominated representative is formally recorded as [Name]."
        if (lowerWarning.includes('cancel')) return "Clause 1.1: Cancellation: A minimum of 2 clear business days notice is required as per the NDIS Price Guide 2025/26."
        if (lowerWarning.includes('price') || lowerWarning.includes('pricing')) return "Clause 1.1: Pricing: All supports align strictly with the NDIS Price Guide maximum limits."
        return "Clause 1.1: General Compliance: The parties incorporate the latest NDIS Practice Standards into this agreement."
    }

    return (
        <div className="w-full max-w-2xl mx-auto mt-10">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                {!result && !isAnalyzing && (
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-cyan-500/30 rounded-2xl p-8 sm:p-12 hover:bg-cyan-500/10 transition-colors cursor-pointer group"
                    >
                        <input
                            type="file"
                            id="demo-upload"
                            className="hidden"
                            accept=".pdf"
                            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                        />
                        <label htmlFor="demo-upload" className="cursor-pointer flex flex-col items-center">
                            <div className="h-16 w-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="h-8 w-8 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Drag & Drop Service Agreement</h3>
                            <p className="text-sm text-slate-400 mt-2">Up to 20MB, PDF format only</p>
                        </label>
                    </div>
                )}

                {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-12 w-12 text-cyan-500 animate-spin mb-4" />
                        <h3 className="text-lg font-semibold text-white animate-pulse">Scanning 11+ NDIS Risk Points...</h3>
                        <p className="text-sm text-slate-400 mt-2">Connecting to Sovereign Sydney AI Engine</p>
                    </div>
                )}

                {result && !isAnalyzing && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-left">
                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-700/50">
                            <div className="flex items-center gap-3 w-full max-w-[70%]">
                                <div className="h-10 w-10 shrink-0 bg-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-white truncate w-full">{result.fileName}</h4>
                                    <p className="text-xs text-slate-400">Analysis Complete</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0 pl-2">
                                <div className="text-2xl sm:text-3xl font-bold text-red-500">{score}%</div>
                                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Compliance</p>
                            </div>
                        </div>

                        {topGap ? (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 mb-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h5 className="font-semibold text-red-400 mb-1">Critical Gap Detected</h5>
                                        <p className="text-sm text-slate-300">{topGap}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
                                    <div className="text-xs font-semibold text-cyan-400 mb-1 uppercase tracking-wider">Active Clause Preview</div>
                                    <p className="text-sm text-slate-300 italic">"{getActiveClause(topGap)}"</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mb-6">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h5 className="font-semibold text-emerald-400 mb-1">No Critical Gaps Found</h5>
                                        <p className="text-sm text-slate-300">Your document appears strictly compliant.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Blurred Teaser */}
                        <div className="relative rounded-xl border border-slate-700 bg-slate-900 p-6 overflow-hidden">
                            <div className="blur-[4px] opacity-40">
                                <div className="h-4 bg-slate-600 rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-slate-600 rounded w-full mb-3"></div>
                                <div className="h-4 bg-slate-600 rounded w-5/6 mb-3"></div>
                                <div className="h-4 bg-slate-600 rounded w-1/2"></div>
                            </div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
                                <div className="bg-slate-800 px-6 py-5 rounded-2xl shadow-2xl border border-slate-700 text-center mx-4 w-full sm:w-auto">
                                    <p className="font-semibold text-white mb-3">
                                        {warnings.length} total compliance gaps found.
                                    </p>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] transition-all"
                                    >
                                        View {remainingGapsCount > 0 ? remainingGapsCount : 'more'} more gaps and download your branded Addendum - Sign up free
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
