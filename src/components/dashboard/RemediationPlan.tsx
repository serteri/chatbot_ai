'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, Check, ShieldAlert, FileWarning, X, Loader2 } from 'lucide-react'

interface RemediationPlanProps {
    warnings: string[]
    remediations: Record<string, string> | null
    isGenerating: boolean
}

export default function RemediationPlan({ warnings, remediations, isGenerating }: RemediationPlanProps) {
    const t = useTranslations('validator.remediation')
    const [selectedWarning, setSelectedWarning] = useState<string | null>(null)
    const [isCopied, setIsCopied] = useState(false)

    if (!warnings || warnings.length === 0) return null

    const handleCopy = async () => {
        if (!selectedWarning || !remediations) return
        const textToCopy = remediations[selectedWarning]
        if (!textToCopy) return

        try {
            await navigator.clipboard.writeText(textToCopy)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text', err)
        }
    }

    return (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-rose-100 bg-rose-50/50 px-6 py-4 flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <h3 className="font-semibold text-rose-900">Compliance Warnings &amp; Action Plan</h3>
            </div>

            <div className="divide-y divide-slate-100">
                {warnings.map((warning, idx) => (
                    <div key={idx} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex items-start gap-3">
                            <FileWarning className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-700 leading-relaxed">{warning}</p>
                        </div>
                        <button
                            onClick={() => setSelectedWarning(warning)}
                            disabled={isGenerating && !remediations}
                            className="shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-medium bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-teal-200"
                        >
                            {isGenerating && !remediations ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : null}
                            {t('fixSuggestion')}
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal for Fix Suggestion */}
            {selectedWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-teal-600" />
                                {t('fixSuggestionModalTitle')}
                            </h3>
                            <button
                                onClick={() => setSelectedWarning(null)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto bg-slate-50">
                            <div className="mb-4 text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 rounded-l-xl"></div>
                                <span className="font-semibold text-slate-800">Identified Gap:</span> {selectedWarning}
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative group">
                                {remediations?.[selectedWarning] ? (
                                    <div className="prose prose-sm prose-slate max-w-none">
                                        {/* Simple formatting for bold asterisks */}
                                        <div
                                            className="whitespace-pre-wrap text-slate-700 leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: remediations[selectedWarning]
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
                                        <p className="text-sm">Generating NDIS-compliant clauses...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 sm:px-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <p className="text-[11px] text-slate-400 italic max-w-md leading-relaxed">
                                {t('disclaimer')}
                            </p>
                            <button
                                onClick={handleCopy}
                                disabled={!remediations?.[selectedWarning]}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors focus:ring-4 focus:ring-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            >
                                {isCopied ? (
                                    <>
                                        <Check className="h-4 w-4 text-teal-400" />
                                        {t('copied')}
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        {t('copyToClipboard')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
