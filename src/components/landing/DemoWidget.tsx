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
        const stored = sessionStorage.getItem('pylonchat_demo_result')
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
            sessionStorage.setItem('pylonchat_demo_result', JSON.stringify(data))
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

    return (
        <section className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Try the Enterprise Analysis Engine
                    </h2>
                    <p className="mt-4 text-lg text-slate-600">
                        Drop a generic NDIS Service Agreement below. We'll find the highest-risk compliance gap for free.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 max-w-2xl mx-auto overflow-hidden relative">
                    {!result && !isAnalyzing && (
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="border-2 border-dashed border-teal-200 rounded-2xl p-12 hover:bg-teal-50/50 transition-colors cursor-pointer group"
                        >
                            <input
                                type="file"
                                id="demo-upload"
                                className="hidden"
                                accept=".pdf"
                                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                            />
                            <label htmlFor="demo-upload" className="cursor-pointer flex flex-col items-center">
                                <div className="h-16 w-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="h-8 w-8 text-teal-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Drag & Drop Service Agreement</h3>
                                <p className="text-sm text-slate-500 mt-2">Up to 20MB, PDF format only</p>
                            </label>
                        </div>
                    )}

                    {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="h-12 w-12 text-teal-600 animate-spin mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 animate-pulse">Scanning 11+ NDIS Risk Points...</h3>
                            <p className="text-sm text-slate-500 mt-2">Connecting to Sovereign Sydney AI Engine</p>
                        </div>
                    )}

                    {result && !isAnalyzing && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-left">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 truncate max-w-[200px]">{result.fileName}</h4>
                                        <p className="text-xs text-slate-500">Analysis Complete</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-red-600">{score}%</div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Compliance</p>
                                </div>
                            </div>

                            {topGap ? (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-6">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h5 className="font-semibold text-red-900 mb-1">Critical Gap Detected</h5>
                                            <p className="text-sm text-red-800">{topGap}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-6">
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h5 className="font-semibold text-emerald-900 mb-1">No Critical Gaps Found</h5>
                                            <p className="text-sm text-emerald-800">Your document appears strictly compliant.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Blurred Teaser */}
                            <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-6 overflow-hidden">
                                <div className="blur-[4px] opacity-60">
                                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                                    <div className="h-4 bg-slate-200 rounded w-full mb-3"></div>
                                    <div className="h-4 bg-slate-200 rounded w-5/6 mb-3"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                </div>

                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
                                    <div className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-teal-100 text-center">
                                        <p className="font-semibold text-slate-900 mb-1">
                                            {warnings.length} total compliance gaps found.
                                        </p>
                                        <p className="text-xs text-slate-600 mb-4">Create a free account to view the full report and generate a branded Master Addendum instantly.</p>
                                        <Link
                                            href="/register"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
                                        >
                                            Sign Up for Free to View All <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    )
}
