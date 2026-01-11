'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { Globe, Check, Loader2, AlertCircle, Copy, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CustomDomainSettingsProps {
    chatbotId: string
    initialDomain?: string | null
}

export default function CustomDomainSettings({ chatbotId, initialDomain }: CustomDomainSettingsProps) {
    const [domain, setDomain] = useState(initialDomain || '')
    const [isSaving, setIsSaving] = useState(false)
    const [copied, setCopied] = useState(false)
    const t = useTranslations('customDomainSettings')

    const cnameTarget = "app.pylonchat.com"

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Basic validation
            let cleanDomain = domain.trim().toLowerCase()
            cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')

            const response = await fetch(`/api/chatbots/${chatbotId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customDomain: cleanDomain || null })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update')
            }

            toast.success(t('success'))
            setDomain(cleanDomain)
        } catch (error) {
            console.error(error)
            toast.error(t('error'))
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6 mt-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-slate-900">{t('title')}</h3>
                        <p className="text-sm text-slate-500">{t('description')}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="domain">{t('label')}</Label>
                        <div className="flex gap-2">
                            <Input
                                id="domain"
                                placeholder={t('placeholder')}
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                className="max-w-md"
                            />
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || domain === initialDomain}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('saving')}
                                    </>
                                ) : (
                                    t('save')
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* DNS Configuration Instructions */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
                        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                            {t('instructionTitle')}
                        </h4>
                        <p className="text-slate-600 mb-4">{t('instruction')}</p>

                        {/* Step by step instructions */}
                        <div className="space-y-3 mb-4">
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">1</span>
                                <p className="text-sm text-slate-700">{t('step1')}</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">2</span>
                                <p className="text-sm text-slate-700">{t('step2')}</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">3</span>
                                <p className="text-sm text-slate-700">{t('step3')}</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">4</span>
                                <p className="text-sm text-slate-700">{t('step4')}</p>
                            </div>
                        </div>

                        {/* CNAME Target with copy button */}
                        <div className="bg-white rounded-md p-3 border border-slate-200 flex items-center justify-between">
                            <code className="text-slate-800 font-mono text-sm">
                                {cnameTarget}
                            </code>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(cnameTarget)}
                                className="ml-2"
                            >
                                {copied ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>

                        {/* Example DNS Record Table */}
                        <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-slate-700">{t('tableType')}</th>
                                        <th className="px-3 py-2 text-left font-medium text-slate-700">{t('tableHost')}</th>
                                        <th className="px-3 py-2 text-left font-medium text-slate-700">{t('tableValue')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    <tr>
                                        <td className="px-3 py-2 font-mono text-slate-600">CNAME</td>
                                        <td className="px-3 py-2 font-mono text-slate-600">{t('tableHostExample')}</td>
                                        <td className="px-3 py-2 font-mono text-slate-600">{cnameTarget}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p className="mt-4 text-xs text-slate-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {t('propagationNote')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
