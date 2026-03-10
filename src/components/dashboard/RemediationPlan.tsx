'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, Check, ShieldAlert, FileWarning, X, Loader2, FileDown, AlertCircle, BookOpen } from 'lucide-react'
import { logPdfExport } from '@/app/[locale]/dashboard/validator/actions'
import { toast } from 'sonner'

export interface WarningDetail {
    text: string
    confidenceScore: number
    requiresManualReview: boolean
    sourceCitation: string
}

interface RemediationPlanProps {
    warnings: string[]
    warningDetails?: WarningDetail[]
    summary: string
    remediations: Record<string, string> | null
    isGenerating: boolean
    filename: string
    participantName?: string
    complianceScore?: number
}

function ConfidenceBadge({ score }: { score: number }) {
    const color =
        score >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        score >= 70 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                     'bg-red-50 text-red-700 border-red-200'
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${color}`}>
            {score}% confidence
        </span>
    )
}

export default function RemediationPlan({ warnings, warningDetails, summary, remediations, isGenerating, filename, participantName, complianceScore }: RemediationPlanProps) {
    const t = useTranslations('validator.remediation')
    const [selectedWarning, setSelectedWarning] = useState<string | null>(null)
    const [isCopied, setIsCopied] = useState(false)
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    // Form states
    const [finalParticipantName, setFinalParticipantName] = useState(participantName || '')
    const [providerName, setProviderName] = useState('')
    const [providerAbn, setProviderAbn] = useState('')
    const [nomineeName, setNomineeName] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isLoadingBranding, setIsLoadingBranding] = useState(true)

    // Fetch branding data for auto-completion
    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const res = await fetch('/api/user/branding')
                if (res.ok) {
                    const data = await res.json()
                    if (data.companyName) setProviderName(data.companyName)
                    if (data.abn) setProviderAbn(data.abn)
                }
            } catch (err) {
                console.error('Failed to fetch branding for form', err)
            } finally {
                setIsLoadingBranding(false)
            }
        }
        fetchBranding()
    }, [])

    if (!warnings || warnings.length === 0) return null

    const handleCopy = async () => {
        if (!selectedWarning || !remediations) return
        const textToCopy = remediations[selectedWarning]
        if (!textToCopy) return

        try {
            await navigator.clipboard.writeText(textToCopy)
            setIsCopied(true)
            toast.success('Copied to clipboard')
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text', err)
            toast.error('Failed to copy')
        }
    }

    const handleGeneratePDF = async () => {
        if (!remediations) return

        try {
            setIsGeneratingPdf(true)
            toast.loading('Preparing your branded NDIS Addendum PDF...', { id: 'pdf-gen' })

            const res = await fetch('/api/validator/generate-addendum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: filename,
                    participantName: finalParticipantName || 'Not specified',
                    companyName: providerName,
                    abn: providerAbn,
                    nomineeName: nomineeName,
                    startDate: startDate,
                    endDate: endDate,
                    complianceScore: complianceScore ?? 0,
                    warnings,
                    approverName: '',
                    approverTitle: '',
                }),
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || 'PDF generation failed')
            }

            // Receive the PDF binary from the server
            const pdfBlob = await res.blob()

            // Also save to vault
            const vaultForm = new FormData()
            vaultForm.append('pdf', pdfBlob, 'NDIS Shield Hub_NDIS_Addendum.pdf')
            vaultForm.append('fileName', filename)
            vaultForm.append('summary', summary)
            vaultForm.append('warnings', JSON.stringify(warnings))
            vaultForm.append('remediations', JSON.stringify(remediations))
            vaultForm.append('complianceScore', String(complianceScore ?? 0))
            vaultForm.append('participantName', finalParticipantName || 'Unknown')
            vaultForm.append('documentStartDate', startDate || '')
            vaultForm.append('documentEndDate', endDate || '')

            console.log('[RemediationPlan] Saving to vault with dates:', { startDate, endDate, participantName: finalParticipantName })

            const saveRes = await fetch('/api/validator/save-analysis', {
                method: 'POST',
                body: vaultForm,
            })

            if (saveRes.ok) {
                setIsSaved(true)
            }

            // Trigger download
            const url = URL.createObjectURL(pdfBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = `NDIS Shield Hub_NDIS_Addendum_${filename.replace('.pdf', '')}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success('Branded Addendum PDF downloaded successfully!', { id: 'pdf-gen' })

            // Fire audit log
            logPdfExport()
        } catch (err) {
            console.error('Failed to generate PDF:', err)
            toast.error('PDF generation failed. Please try again.', { id: 'pdf-gen' })
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    return (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-rose-100 bg-rose-50/50 px-6 py-4 flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <h3 className="font-semibold text-rose-900">Compliance Warnings &amp; Action Plan</h3>
            </div>

            <div className="divide-y divide-slate-100">
                {warnings.map((warning, idx) => {
                    const detail = warningDetails?.[idx]
                    return (
                        <div key={idx} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <FileWarning className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-700 leading-relaxed">{warning}</p>

                                    {/* Confidence + manual-review flag */}
                                    {detail && (
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <ConfidenceBadge score={detail.confidenceScore} />
                                            {detail.confidenceScore < 90 && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold bg-orange-50 text-orange-700 border-orange-200">
                                                    ⚠️ Manual Review Suggested
                                                </span>
                                            )}
                                            {/* NDIS source citation */}
                                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                                                <BookOpen className="h-3 w-3" />
                                                {detail.sourceCitation}
                                            </span>
                                        </div>
                                    )}
                                </div>
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
                    )
                })}
            </div>

            {/* Smart Data Intake Form */}
            <div className="px-6 py-5 bg-white border-t border-rose-100">
                <div className="bg-teal-50 px-4 py-2.5 flex items-center gap-2 border-b border-teal-100">
                    <AlertCircle className="h-4 w-4 text-teal-600" />
                    <h4 className="text-sm font-semibold text-teal-900">Information Required for Addendum</h4>
                </div>
                <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Participant Name *
                        </label>
                        <input
                            type="text"
                            value={finalParticipantName}
                            onChange={e => setFinalParticipantName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Provider Name *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={providerName}
                                onChange={e => setProviderName(e.target.value)}
                                placeholder="Your Company Name"
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50"
                            />
                            {isLoadingBranding && <Loader2 className="h-3 w-3 animate-spin absolute right-3 top-2.5 text-slate-400" />}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Provider ABN *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={providerAbn}
                                onChange={e => setProviderAbn(e.target.value)}
                                placeholder="e.g. 12 345 678 901"
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50"
                            />
                            {isLoadingBranding && <Loader2 className="h-3 w-3 animate-spin absolute right-3 top-2.5 text-slate-400" />}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider truncate">
                            Nominee Name (Optional)
                        </label>
                        <input
                            type="text"
                            value={nomineeName}
                            onChange={e => setNomineeName(e.target.value)}
                            placeholder="Representative Name"
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider truncate">
                            Start Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50 text-slate-700"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider truncate">
                            End Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50 text-slate-700"
                        />
                    </div>
                </div>
            </div>

            {/* Footer with Master Addendum Action */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                        Review and apply these fixes individually, or generate a full branded addendum.
                    </p>
                    {isSaved && (
                        <p className="text-xs font-medium text-teal-600 flex items-center gap-1.5 animate-in fade-in">
                            <Check className="h-3 w-3" /> Saved to Document Vault
                        </p>
                    )}
                </div>

                <button
                    onClick={handleGeneratePDF}
                    disabled={isGeneratingPdf || !remediations || Object.keys(remediations).length === 0 || !finalParticipantName.trim() || !providerName.trim() || !providerAbn.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isGeneratingPdf ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <FileDown className="h-4 w-4" />
                    )}
                    {t('generateMasterAddendum')}
                </button>
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

                            <div className="mb-3 text-sm font-medium text-slate-700">
                                {t('addExactText')}
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative group">
                                {remediations?.[selectedWarning] ? (
                                    <div className="prose prose-sm prose-slate max-w-none">
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
