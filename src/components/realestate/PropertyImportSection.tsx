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

const localTranslations = {
    tr: {
        cardDescription: 'İlanlarınızı ekleyin, chatbot müşteri tercihlerine göre otomatik eşleştirme yapsın',
        createChatbotFirst: 'Önce bir emlak chatbotu oluşturun',
        manageProperties: 'İlanları Yönet',
        managePropertiesDesc: 'İlan ekle, düzenle, sil',
        goToProperties: 'İlan Sayfasına Git',
        smartImport: 'Akıllı İçe Aktar',
        smartImportDesc: 'Web sitenizden ilanları otomatik çekin',
        xmlImport: 'XML / Dosya Yükle',
        xmlImportDesc: 'REAXML veya JSON dosyası yükleyin',
        enterUrl: 'Web Sitesi Adresi',
        enterUrlPlaceholder: 'https://emlak-siteniz.com',
        detecting: 'İlanlar taranıyor...',
        reviewImport: 'İçe Aktarmayı İncele',
        foundProperties: 'Adet İlan Bulundu',
        importAll: 'Hepsini İçe Aktar',
        importing: 'İçe aktarılıyor...',
        successImport: 'İlan başarıyla eklendi!',
        errorImport: 'Bir hata oluştu.',
        noPropertiesFound: 'Bu adreste ilan bulunamadı. Lütfen geçerli bir emlak web sitesi veya ilan sayfası girin.',
        selectFile: 'Dosya Seç',
        supportedFormats: 'Desteklenen formatlar: .xml, .json'
    },
    en: {
        cardDescription: 'Add your listings, chatbot will automatically match based on customer preferences',
        createChatbotFirst: 'Create a real estate chatbot first',
        manageProperties: 'Manage Properties',
        managePropertiesDesc: 'Add, edit, delete properties',
        goToProperties: 'Go to Properties',
        smartImport: 'Smart Import',
        smartImportDesc: 'Automatically fetch listings from your website',
        xmlImport: 'Upload XML / File',
        xmlImportDesc: 'Upload REAXML or JSON file',
        enterUrl: 'Website URL',
        enterUrlPlaceholder: 'https://your-realestate-site.com',
        detecting: 'Scanning for properties...',
        reviewImport: 'Review Import',
        foundProperties: 'Properties Found',
        importAll: 'Import All',
        importing: 'Importing...',
        successImport: 'Properties successfully imported!',
        errorImport: 'An error occurred.',
        noPropertiesFound: 'No properties found at this URL. Please enter a valid real estate website or listing page.',
        selectFile: 'Select File',
        supportedFormats: 'Supported formats: .xml, .json'
    }
}

interface PropertyImportSectionProps {
    locale: string
    chatbots: Array<{
        id: string
        name: string
    }>
    translations: any
}

export function PropertyImportSection({ locale, chatbots, translations: rt }: PropertyImportSectionProps) {
    const lt = localTranslations[locale as keyof typeof localTranslations] || localTranslations.en
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
                toast.error(lt.noPropertiesFound)
                setImportStatus('idle')
            }
        } catch (e) {
            toast.error(lt.errorImport)
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
                    toast.error(lt.noPropertiesFound)
                    setImportStatus('idle')
                }
            } catch (e) {
                toast.error(lt.errorImport)
                setImportStatus('idle')
            } finally {
                setIsLoading(false)
            }
        }
        reader.readAsText(file)
    }

    const handleImport = async () => {
        if (!selectedChatbotId) return

        setImportStatus('importing')
        setImportProgress(0)
        let successCount = 0

        for (let i = 0; i < detectedProperties.length; i++) {
            const prop = detectedProperties[i]
            try {
                // Map NormalizedProperty to API schema
                const body = {
                    chatbotId: selectedChatbotId,
                    externalId: prop.externalId,
                    title: prop.title,
                    description: prop.description,
                    price: prop.price,
                    currency: prop.currency,
                    address: prop.address,
                    city: prop.city,
                    country: prop.country,
                    rooms: `${prop.bedrooms || 1}+1`, // Simplified mapping
                    bedrooms: prop.bedrooms,
                    bathrooms: prop.bathrooms,
                    area: prop.area,
                    propertyType: prop.propertyType as any,
                    listingType: prop.listingType as any,
                    images: prop.images,
                    source: 'api',
                    sourceUrl: prop.url,
                    status: 'active'
                }

                await fetch('/api/properties', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
                successCount++
            } catch (e) {
                console.error('Failed to import property:', prop.title)
            }
            setImportProgress(Math.round(((i + 1) / detectedProperties.length) * 100))
        }

        toast.success(`${successCount} ${lt.successImport}`)
        setImportStatus('success')
        setTimeout(() => {
            setIsOpen(false)
            setImportStatus('idle')
            setDetectedProperties([])
        }, 2000)
    }

    return (
        <>
            <Card className="mb-8 border-t-4 border-t-blue-500">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Home className="h-5 w-5 text-blue-600" />
                        <CardTitle>{rt.importOptions.title}</CardTitle>
                    </div>
                    <CardDescription>{lt.cardDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    {hasNoChatbots ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Home className="h-12 w-12 mx-auto mb-3 text-slate-200" />
                            <p className="text-sm mb-2">{lt.createChatbotFirst}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 1. Go to Properties Page (Existing) */}
                            <Link href={`/${locale}/dashboard/realestate/properties`}>
                                <div className="h-full p-4 border rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer flex flex-col items-center text-center group">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h4 className="font-medium text-sm mb-1">{lt.manageProperties}</h4>
                                    <p className="text-xs text-muted-foreground mb-4">{lt.managePropertiesDesc}</p>
                                    <Button size="sm" variant="outline" className="w-full mt-auto">
                                        {lt.goToProperties} <ArrowRight className="ml-2 h-3 w-3" />
                                    </Button>
                                </div>
                            </Link>

                            {/* 2. Smart Import (New) */}
                            <div
                                onClick={() => { setIsOpen(true); setMode('url'); }}
                                className="h-full p-4 border rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer flex flex-col items-center text-center group"
                            >
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Globe className="h-5 w-5 text-purple-600" />
                                </div>
                                <h4 className="font-medium text-sm mb-1">{lt.smartImport}</h4>
                                <p className="text-xs text-muted-foreground mb-4">{lt.smartImportDesc}</p>
                                <Button size="sm" variant="outline" className="w-full mt-auto">
                                    {lt.smartImport} <Plus className="ml-2 h-3 w-3" />
                                </Button>
                            </div>

                            {/* 3. XML Import (New) */}
                            <div
                                onClick={() => { setIsOpen(true); setMode('file'); }}
                                className="h-full p-4 border rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-all cursor-pointer flex flex-col items-center text-center group"
                            >
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                </div>
                                <h4 className="font-medium text-sm mb-1">{lt.xmlImport}</h4>
                                <p className="text-xs text-muted-foreground mb-4">{lt.xmlImportDesc}</p>
                                <Button size="sm" variant="outline" className="w-full mt-auto">
                                    {lt.xmlImport} <Upload className="ml-2 h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {mode === 'url' ? lt.smartImport : lt.xmlImport}
                        </DialogTitle>
                        <DialogDescription>
                            {mode === 'url' ? lt.smartImportDesc : lt.xmlImportDesc}
                        </DialogDescription>
                    </DialogHeader>

                    {importStatus === 'idle' && (
                        <div className="py-4">
                            {mode === 'url' ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{lt.enterUrl}</label>
                                    <Input
                                        placeholder={lt.enterUrlPlaceholder}
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{lt.selectFile}</label>
                                    <Input
                                        type="file"
                                        accept=".xml,.json"
                                        onChange={handleFileUpload}
                                    />
                                    <p className="text-xs text-muted-foreground">{lt.supportedFormats}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {importStatus === 'detecting' && (
                        <div className="py-8 text-center space-y-3">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                            <p className="text-sm text-muted-foreground">{lt.detecting}</p>
                        </div>
                    )}

                    {importStatus === 'review' && (
                        <div className="py-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-sm">{lt.foundProperties}</h4>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                    {detectedProperties.length}
                                </span>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-2">
                                {detectedProperties.map((prop, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm p-2 hover:bg-slate-50 rounded bg-white border">
                                        <div className="w-10 h-10 bg-slate-100 rounded flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${prop.images[0]})` }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{prop.title}</p>
                                            <p className="text-xs text-muted-foreground">{prop.price} {prop.currency}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {importStatus === 'importing' && (
                        <div className="py-8 space-y-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span>{lt.importing}</span>
                                <span>{importProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${importProgress}%` }} />
                            </div>
                        </div>
                    )}

                    {importStatus === 'success' && (
                        <div className="py-8 text-center text-green-600 space-y-2">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Check className="h-6 w-6" />
                            </div>
                            <p className="font-medium">{lt.successImport}</p>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-between items-center gap-2">
                        {(importStatus === 'idle' && mode === 'url') && (
                            <Button className="w-full" onClick={handleIdentify} disabled={!url || isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                                {lt.reviewImport}
                            </Button>
                        )}
                        {importStatus === 'review' && (
                            <Button className="w-full" onClick={handleImport}>
                                <Upload className="mr-2 h-4 w-4" />
                                {lt.importAll}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
