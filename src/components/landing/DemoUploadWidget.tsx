'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, AlertTriangle, ShieldAlert, ArrowRight, Loader2, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

export function DemoUploadWidget() {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<{ score: number; warning: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }

    const processFile = async (selectedFile: File) => {
        if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
            setError('Please upload a PDF document.')
            return
        }
        if (selectedFile.size > 2 * 1024 * 1024) {
            setError('File too large. Demo is limited to 2MB PDFs.')
            return
        }

        setFile(selectedFile)
        setError(null)
        setIsAnalyzing(true)
        setResult(null)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            const res = await fetch('/api/public/demo-analyze', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Analysis failed')

            setResult({ score: data.score, warning: data.warning })
        } catch (err: any) {
            setError(err.message)
            setFile(null)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0])
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) processFile(e.target.files[0])
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`bg-white rounded-2xl shadow-xl shadow-cyan-900/5 border-2 border-dashed p-8 transition-all cursor-pointer text-center relative overflow-hidden group ${isDragging ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 hover:border-cyan-300'}`}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileInput} accept=".pdf" className="hidden" />

                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-50 text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-500'}`}>
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Upload an Agreement</h3>
                        <p className="text-sm text-slate-500 mb-4 px-4">
                            See how our AI detects compliance gaps instantly. Free 1-page scan.
                        </p>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center justify-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> {error}
                            </div>
                        )}
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-600 bg-cyan-50 px-4 py-2 rounded-full border border-cyan-100">
                            PDF Format Only (Max 2MB)
                        </div>
                    </motion.div>
                ) : isAnalyzing ? (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center"
                    >
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                            <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-cyan-600" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Analyzing Document</h3>
                        <p className="text-sm text-slate-500 mt-1">Checking against NDIS 2025/26 guidelines...</p>
                    </motion.div>
                ) : result ? (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl shadow-cyan-900/10 border border-slate-200 overflow-hidden"
                    >
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-amber-500" /> Demo Analysis Results
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{file.name}</p>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg border font-bold text-sm ${result.score >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                    result.score >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                        'text-red-700 bg-red-50 border-red-200'
                                }`}>
                                Score: {result.score}%
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Highest Priority Gap Detected:</p>
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
                                <p className="text-sm text-red-800 font-medium leading-relaxed">
                                    {result.warning}
                                </p>
                            </div>

                            <div className="relative">
                                {/* Blurred / Masked content simulation */}
                                <div className="space-y-3 opacity-30 blur-[2px] pointer-events-none select-none">
                                    <div className="w-full h-8 bg-slate-200 rounded-lg" />
                                    <div className="w-3/4 h-8 bg-slate-200 rounded-lg" />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-semibold text-white mb-2 shadow-lg">
                                        + 4 more compliance gaps hidden
                                    </div>
                                    <Link href="/appointment" className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md mt-2">
                                        Sign up to view full Audit Report <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}
