'use client'

import React, { useState, useRef } from 'react'
import { Upload, Building2, CheckCircle, Loader2, Image as ImageIcon, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
    initialCompanyName: string
    initialLogoUrl: string
}

export default function BrandingSettings({ initialCompanyName, initialLogoUrl }: Props) {
    const [companyName, setCompanyName] = useState(initialCompanyName)
    const [logoUrl, setLogoUrl] = useState(initialLogoUrl)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file (PNG, JPG, SVG)')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Logo must be under 5MB')
            return
        }
        setSelectedFile(file)
        setLogoPreview(URL.createObjectURL(file))
        setSaveStatus('idle')
    }

    const removeLogo = () => {
        setSelectedFile(null)
        setLogoPreview(null)
        setLogoUrl('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSave = async () => {
        setIsSaving(true)
        setSaveStatus('idle')
        try {
            const formData = new FormData()
            formData.append('companyName', companyName)
            if (selectedFile) {
                formData.append('logo', selectedFile)
            }

            const res = await fetch('/api/user/branding', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error('Failed to save')
            const data = await res.json()
            if (data.logoUrl) setLogoUrl(data.logoUrl)
            setSaveStatus('success')
            setSelectedFile(null)
            setTimeout(() => setSaveStatus('idle'), 3000)
        } catch {
            setSaveStatus('error')
        } finally {
            setIsSaving(false)
        }
    }

    const currentLogo = logoPreview || logoUrl

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-teal-600" />
                    White-Label Branding
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Customise your firm&apos;s identity on all generated NDIS Compliance Addendum PDFs.
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Company Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Company / Provider Name
                    </label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => { setCompanyName(e.target.value); setSaveStatus('idle') }}
                        placeholder="e.g. Hireup Pty Ltd"
                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                        This will appear in the PDF header and signature block.
                    </p>
                </div>

                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Firm Logo
                    </label>
                    <div className="flex gap-4 items-start">
                        {/* Preview Box */}
                        <div className="h-24 w-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
                            {currentLogo ? (
                                <img
                                    src={currentLogo}
                                    alt="Logo preview"
                                    className="h-full w-full object-contain p-2"
                                />
                            ) : (
                                <ImageIcon className="h-8 w-8 text-slate-300" />
                            )}
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 space-y-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                                >
                                    <Upload className="h-4 w-4" />
                                    {currentLogo ? 'Change Logo' : 'Upload Logo'}
                                </button>
                                {currentLogo && (
                                    <button
                                        onClick={removeLogo}
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition cursor-pointer"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <p className="text-xs text-slate-400">
                                PNG, JPG, or SVG. Max 5MB. Logo will appear in the top-right corner of your Addendum PDFs.
                            </p>
                        </div>
                    </div>
                </div>

                {/* PDF Preview */}
                {(companyName || currentLogo) && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-800 px-4 py-2">
                            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                                <Eye className="h-3.5 w-3.5" />
                                Addendum PDF Header Preview
                            </span>
                        </div>
                        <div className="bg-white p-5 border-b border-slate-100">
                            <div className="bg-slate-900 rounded-lg p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-white font-bold text-sm tracking-wide">
                                        NDIS SERVICE AGREEMENT ADDENDUM
                                    </div>
                                    <div className="text-slate-400 text-[10px] mt-0.5">
                                        Master Compliance Document • NDIS Practice Standards & Price Guide 2025/26
                                    </div>
                                </div>
                                {currentLogo && (
                                    <img src={currentLogo} alt="Logo" className="h-10 w-auto max-w-[120px] object-contain rounded" />
                                )}
                            </div>
                            {companyName && (
                                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Provider:</span>
                                        <span className="text-xs font-semibold text-slate-800">{companyName}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex items-center justify-between pt-2">
                    <div>
                        {saveStatus === 'success' && (
                            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                                <CheckCircle className="h-4 w-4" />
                                Branding saved successfully
                            </span>
                        )}
                        {saveStatus === 'error' && (
                            <span className="text-sm text-red-600 font-medium">
                                Failed to save. Please try again.
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
                    >
                        {isSaving ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                        ) : (
                            <><Building2 className="h-4 w-4" /> Save Branding</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
