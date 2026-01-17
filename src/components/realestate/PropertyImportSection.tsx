'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Home,
    FileSpreadsheet,
    Plus,
    ArrowRight,
    Building2,
    Globe,
    Upload,
    Check,
    Loader2,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { NormalizedProperty } from '@/lib/imports/types'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface PropertyImportSectionProps {
    locale: string
    chatbots: Array<{
        id: string
        name: string
    }>
    translations: any // Keeping for potential backward compatibility
}

export function PropertyImportSection({ locale, chatbots }: PropertyImportSectionProps) {
    const t = useTranslations('propertyImport')
    const hasNoChatbots = chatbots.length === 0
    const [isOpen, setIsOpen] = useState(false)
    const [mode, setMode] = useState<'url' | 'file'>('url')
    const [url, setUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [detectedProperties, setDetectedProperties] = useState<NormalizedProperty[]>([])
    const [importStatus, setImportStatus] = useState<'idle' | 'detecting' | 'review' | 'importing' | 'success'>('idle')
    const [selectedChatbotId, setSelectedChatbotId] = useState(chatbots[0]?.id)
    const [importProgress, setImportProgress] = useState(0)

    const handleIdentify = async () => {
        if (mode === 'url' && !url) return

        setIsLoading(true)
        setImportStatus('detecting')
        setDetectedProperties([])

        try {
            const res = await fetch('/api/properties/import/detect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            })

            const data = await res.json()
            if (data.success && data.properties.length > 0) {
                setDetectedProperties(data.properties)
                setImportStatus('review')
            } else {
                toast.error(t('noPropertiesFound'))
                setImportStatus('idle')
            }
        } catch (e) {
            toast.error(t('errorImport'))
            setImportStatus('idle')
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            const content = event.target?.result as string
            setIsLoading(true)
            setImportStatus('detecting')

            try {
                const res = await fetch('/api/properties/import/detect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content })
                })

                const data = await res.json()
                if (data.success && data.properties.length > 0) {
                    setDetectedProperties(data.properties)
                    setImportStatus('review')
                } else {
                    toast.error(t('noPropertiesFound'))
                    setImportStatus('idle')
                }
            } catch (e) {
                toast.error(t('errorImport'))
                setImportStatus('idle')
            } finally {
                setIsLoading(false)
            }
        }
        reader.readAsText(file)
    }

    const handleImport = async () => {
        if (detectedProperties.length === 0 || !selectedChatbotId) return

        setIsLoading(true)
        setImportStatus('importing')
        let successCount = 0

        // Simulate progress for better UX
        const interval = setInterval(() => {
            setImportProgress(prev => Math.min(prev + 10, 90))
        }, 500)

        try {
            const res = await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatbotId: selectedChatbotId,
                    properties: detectedProperties
                })
            })

            if (res.ok) {
                clearInterval(interval)
                setImportProgress(100)
                setImportStatus('success')
                toast.success(t('successImport'))
                setTimeout(() => {
                    setIsOpen(false)
                    setImportStatus('idle')
                    setDetectedProperties([])
                    setImportProgress(0)
                }, 2000)
            } else {
                throw new Error('Import failed')
            }
        } catch (e) {
            clearInterval(interval)
            toast.error(t('errorImport'))
            setImportStatus('review')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Card className="mb-8 border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Home className="w-5 h-5 text-blue-600" />
                                {t('manageProperties')}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {t('cardDescription')}
                            </CardDescription>
                        </div>
                        <Link href={`/${locale}/dashboard/realestate/properties`}>
                            <Button variant="outline" className="gap-2">
                                {t('goToProperties')} <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {hasNoChatbots ? (
                        <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>{t('createChatbotFirst')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Smart Import Option */}
                            <div
                                onClick={() => { setIsOpen(true); setMode('url'); }}
                                className="h-full p-6 border rounded-xl hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 hover:shadow-md cursor-pointer flex flex-col items-center text-center group transition-all duration-200 bg-white dark:bg-slate-950 dark:border-slate-800"
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-lg mb-1 text-slate-900 dark:text-slate-100">{t('smartImport')}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('smartImportDesc')}</p>
                                <Button size="sm" variant="outline" className="w-full mt-auto border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:hover:text-blue-200">
                                    {t('smartImport')} <Plus className="ml-2 h-3 w-3" />
                                </Button>
                            </div>

                            {/* XML/File Import Option */}
                            <div
                                onClick={() => { setIsOpen(true); setMode('file'); }}
                                className="h-full p-6 border rounded-xl hover:border-green-400 hover:bg-green-50/30 dark:hover:bg-green-900/10 hover:shadow-md cursor-pointer flex flex-col items-center text-center group transition-all duration-200 bg-white dark:bg-slate-950 dark:border-slate-800"
                            >
                                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-lg mb-1 text-slate-900 dark:text-slate-100">{t('xmlImport')}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('xmlImportDesc')}</p>
                                <Button size="sm" variant="outline" className="w-full mt-auto border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-200">
                                    {t('xmlImport')} <Upload className="ml-2 h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {mode === 'url' ? <Globe className="w-5 h-5 text-blue-500" /> : <FileSpreadsheet className="w-5 h-5 text-green-500" />}
                            {mode === 'url' ? t('smartImport') : t('xmlImport')}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">
                            {mode === 'url' ? t('smartImportDesc') : t('xmlImportDesc')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {importStatus === 'idle' && (
                            <div className="space-y-4">
                                <Tabs defaultValue={mode} onValueChange={(v) => setMode(v as 'url' | 'file')} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800">
                                        <TabsTrigger value="url" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">{t('enterUrl')}</TabsTrigger>
                                        <TabsTrigger value="file" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">{t('xmlImport')}</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="url" className="pt-4 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('enterUrl')}</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder={t('enterUrlPlaceholder')}
                                                    value={url}
                                                    onChange={(e) => setUrl(e.target.value)}
                                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="file" className="pt-4 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('selectFile')}</label>
                                            <div className="flex items-center justify-center w-full">
                                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className="w-8 h-8 mb-4 text-slate-500 dark:text-slate-400" />
                                                        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">{t('selectFile')}</span></p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('supportedFormats')}</p>
                                                    </div>
                                                    <input type="file" className="hidden" accept=".xml,.json" onChange={handleFileUpload} />
                                                </label>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        )}

                        {importStatus === 'detecting' && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                                <p className="text-slate-600 dark:text-slate-300 font-medium">{t('detecting')}</p>
                            </div>
                        )}

                        {importStatus === 'review' && (
                            <div className="space-y-4">
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center">
                                            <Check className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-green-900 dark:text-green-100">{t('foundProperties')}</h4>
                                            <p className="text-sm text-green-700 dark:text-green-300">{detectedProperties.length} properties ready to import</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview List (Limited) */}
                                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800/50">
                                    {detectedProperties.slice(0, 5).map((p, i) => (
                                        <div key={i} className="p-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            {p.images?.[0] ? (
                                                <img src={p.images[0]} alt="" className="w-16 h-16 object-cover rounded-md bg-slate-200 dark:bg-slate-700" />
                                            ) : (
                                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center text-slate-400">
                                                    <Building2 className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-medium text-sm truncate text-slate-900 dark:text-slate-100">{p.title}</h5>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{p.city}, {p.propertyType}</p>
                                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                                                    {p.price > 0 ? `${p.currency} ${p.price.toLocaleString()}` : 'Price on request'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {detectedProperties.length > 5 && (
                                        <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50">
                                            + {detectedProperties.length - 5} more properties...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {importStatus === 'importing' && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }}></div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 font-medium">{t('importing')}</p>
                            </div>
                        )}

                        {importStatus === 'success' && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center animate-in fade-in zoom-in-95">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                                    <Check className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-green-700 dark:text-green-300">{t('successImport')}</h3>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex gap-2 sm:justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                        {importStatus === 'idle' && (
                            <>
                                <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">{t('cancelButton')}</Button>
                                <Button onClick={handleIdentify} disabled={isLoading || (mode === 'url' && !url)} className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500">
                                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {t('detectButton')}
                                </Button>
                            </>
                        )}
                        {importStatus === 'review' && (
                            <>
                                <Button variant="outline" onClick={() => setImportStatus('idle')} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">{t('cancelButton')}</Button>
                                <Button onClick={handleImport} className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500">
                                    {t('importAll')}
                                </Button>
                            </>
                        )}
                        {importStatus === 'success' && (
                            <Button onClick={() => setIsOpen(false)} className="w-full bg-green-600 hover:bg-green-700 text-white">
                                OK
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
