'use client'

import React, { useState } from 'react'
import { Search, FileText, Download, ShieldCheck, ChevronRight } from 'lucide-react'

interface AnalysisRecord {
    id: string
    fileName: string
    participantName: string | null
    complianceScore: number
    pdfUrl: string | null
    region: string
    createdAt: string
}

export default function HistoryClientPage({ initialAnalyses }: { initialAnalyses: AnalysisRecord[] }) {
    const [searchQuery, setSearchQuery] = useState('')

    // Filter logic
    const filteredAnalyses = initialAnalyses.filter(record =>
        record.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.participantName && record.participantName.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Format Date helper
    const formatDate = (isoString: string) => {
        const date = new Date(isoString)
        return new Intl.DateTimeFormat('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-teal-600" />
                    Document Vault
                </h1>
                <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                    Securely access all your past NDIS document analyses and generated compliance addendums. All records reflect 2025/26 requirements and are securely stored in the Sovereign <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-xs text-slate-600">ap-southeast-2</span> data region.
                </p>
            </div>

            {/* Controls */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by file name or participant..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Participant</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Analyzed</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sovereignty</th>
                                <th className="py-3 px-6 text-xs text-right font-semibold text-slate-500 uppercase tracking-wider">Master Addendum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAnalyses.length > 0 ? (
                                filteredAnalyses.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6 text-sm text-slate-900 font-medium flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <span className="truncate max-w-[200px] sm:max-w-xs">{record.fileName}</span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 hidden sm:table-cell">
                                            {record.participantName || <span className="text-slate-400 italic">Unknown</span>}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600">
                                            {formatDate(record.createdAt)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                <ShieldCheck className="h-3 w-3" />
                                                Sydney ({record.region})
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {record.pdfUrl ? (
                                                <a
                                                    href={record.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200/50"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    Download
                                                </a>
                                            ) : (
                                                <span className="inline-flex items-center text-xs text-slate-400 italic">
                                                    Local only
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <Search className="h-8 w-8 mb-3 text-slate-300" />
                                            <p className="text-sm">No analyses found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
