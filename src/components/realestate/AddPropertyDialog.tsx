'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Link2,
    Loader2,
    Home,
    MapPin,
    Bed,
    Bath,
    DollarSign,
    Check,
    AlertCircle,
    ExternalLink,
    Plus
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AddPropertyDialogProps {
    chatbotId: string
    locale?: string
    trigger?: React.ReactNode
    onPropertyAdded?: () => void
}

interface PropertyPreview {
    title: string
    description: string
    price: number
    bedrooms: number
    bathrooms: number
    propertyType: string
    listingType: string
    address: string
    suburb: string
    city: string
    images: string[]
    sourceUrl: string
}

const translations = {
    tr: {
        title: 'İlan Ekle',
        description: 'realestate.com.au veya domain.com.au URL\'si yapıştırın',
        urlLabel: 'İlan URL\'si',
        urlPlaceholder: 'https://www.realestate.com.au/property-...',
        preview: 'Önizleme',
        import: 'İçe Aktar',
        importing: 'İçe Aktarılıyor...',
        fetching: 'Bilgiler Çekiliyor...',
        cancel: 'İptal',
        success: 'İlan başarıyla eklendi!',
        updated: 'İlan güncellendi!',
        error: 'İlan alınamadı. URL\'yi kontrol edin.',
        magicButtonHint: 'Otomatik çekme başarısız (Site koruması). Lütfen "Sihirli Buton"u kullanarak ekleyin.',
        unsupported: 'Desteklenmeyen site. Sadece realestate.com.au ve domain.com.au desteklenir.',
        supportedSites: 'Desteklenen Siteler',
        bedrooms: 'Yatak Odası',
        bathrooms: 'Banyo',
        sale: 'Satılık',
        rent: 'Kiralık'
    },
    en: {
        title: 'Add Property',
        description: 'Paste a realestate.com.au or domain.com.au URL',
        urlLabel: 'Property URL',
        urlPlaceholder: 'https://www.realestate.com.au/property-...',
        preview: 'Preview',
        import: 'Import',
        importing: 'Importing...',
        fetching: 'Fetching Details...',
        cancel: 'Cancel',
        success: 'Property added successfully!',
        updated: 'Property updated!',
        error: 'Could not fetch property. Check the URL.',
        magicButtonHint: 'Auto-fetch failed (Site protection). Please use the "Magic Button" to add this property.',
        unsupported: 'Unsupported site. Only realestate.com.au and domain.com.au are supported.',
        supportedSites: 'Supported Sites',
        bedrooms: 'Bedrooms',
        bathrooms: 'Bathrooms',
        sale: 'For Sale',
        rent: 'For Rent'
    }
}

export function AddPropertyDialog({ chatbotId, locale = 'en', trigger, onPropertyAdded }: AddPropertyDialogProps) {
    const router = useRouter()
    const t = translations[locale as keyof typeof translations] || translations.en

    const [open, setOpen] = useState(false)
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [previewing, setPreviewing] = useState(false)
    const [preview, setPreview] = useState<PropertyPreview | null>(null)
    const [error, setError] = useState('')

    const isValidUrl = (urlString: string) => {
        return urlString.includes('realestate.com.au') || urlString.includes('domain.com.au')
    }

    const handlePreview = async () => {
        if (!url.trim()) return

        if (!isValidUrl(url)) {
            setError(t.unsupported)
            return
        }

        setPreviewing(true)
        setError('')
        setPreview(null)

        try {
            const response = await fetch(`/api/properties/scrape?url=${encodeURIComponent(url)}`)
            const data = await response.json()

            if (!response.ok) {
                // If scraping fails, suggest Magic Button
                throw new Error(t.magicButtonHint)
            }

            setPreview(data.preview)
        } catch (err: any) {
            setError(err.message || t.magicButtonHint)
        } finally {
            setPreviewing(false)
        }
    }

    const handleImport = async () => {
        if (!preview) return

        setLoading(true)

        try {
            const response = await fetch('/api/properties/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    chatbotId
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || t.error)
            }

            toast.success(data.action === 'updated' ? t.updated : t.success)
            setOpen(false)
            setUrl('')
            setPreview(null)
            onPropertyAdded?.()
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || t.error)
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
            maximumFractionDigits: 0
        }).format(price)
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) {
                setUrl('')
                setPreview(null)
                setError('')
            }
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        {t.title}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-blue-600" />
                        {t.title}
                    </DialogTitle>
                    <DialogDescription>
                        {t.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* URL Input */}
                    <div className="space-y-2">
                        <Label htmlFor="url" className="flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-blue-500" />
                            {t.urlLabel}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="url"
                                placeholder={t.urlPlaceholder}
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value)
                                    setError('')
                                }}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePreview}
                                disabled={!url.trim() || previewing}
                            >
                                {previewing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    t.preview
                                )}
                            </Button>
                        </div>

                        {/* Supported Sites */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{t.supportedSites}:</span>
                            <Badge variant="secondary" className="text-xs">realestate.com.au</Badge>
                            <Badge variant="secondary" className="text-xs">domain.com.au</Badge>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-lg">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {previewing && (
                        <div className="flex items-center justify-center p-8">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
                                <p className="text-sm text-muted-foreground">{t.fetching}</p>
                            </div>
                        </div>
                    )}

                    {/* Preview Card */}
                    {preview && !previewing && (
                        <div className="border rounded-lg overflow-hidden bg-slate-50">
                            {/* Image */}
                            {preview.images.length > 0 && (
                                <div className="relative h-40 bg-slate-200">
                                    <img
                                        src={preview.images[0]}
                                        alt={preview.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <Badge
                                        className={`absolute top-2 right-2 ${preview.listingType === 'rent'
                                            ? 'bg-purple-600'
                                            : 'bg-green-600'
                                            }`}
                                    >
                                        {preview.listingType === 'rent' ? t.rent : t.sale}
                                    </Badge>
                                </div>
                            )}

                            <div className="p-4 space-y-3">
                                {/* Title & Price */}
                                <div>
                                    <h3 className="font-semibold text-lg line-clamp-1">{preview.title}</h3>
                                    <div className="flex items-center gap-1 text-green-700 font-bold text-xl">
                                        <DollarSign className="h-5 w-5" />
                                        {formatPrice(preview.price)}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                    <MapPin className="h-4 w-4" />
                                    <span>{preview.suburb}, {preview.city}</span>
                                </div>

                                {/* Features */}
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Bed className="h-4 w-4 text-blue-600" />
                                        <span>{preview.bedrooms} {t.bedrooms}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Bath className="h-4 w-4 text-blue-600" />
                                        <span>{preview.bathrooms} {t.bathrooms}</span>
                                    </div>
                                </div>

                                {/* Source URL */}
                                <a
                                    href={preview.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Orijinal İlanı Gör
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                    >
                        {t.cancel}
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!preview || loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t.importing}
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                {t.import}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
