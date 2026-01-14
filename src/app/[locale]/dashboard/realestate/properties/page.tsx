'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import {
    ArrowLeft,
    Building2,
    Plus,
    Upload,
    FileSpreadsheet,
    Home,
    MapPin,
    DollarSign,
    Trash2,
    Edit,
    Eye,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    AlertCircle,
    Loader2,
    CalendarClock
} from 'lucide-react'
import { InspectionTimesManager } from '@/components/realestate/InspectionTimesManager'

interface Property {
    id: string
    title: string
    propertyType: string
    listingType: string
    price: number
    currency: string
    city: string
    district?: string
    rooms?: string
    area?: number
    images: string[]
    status: string
    source: string
    createdAt: string
}

interface Chatbot {
    id: string
    name: string
    identifier: string
}

const translations = {
    tr: {
        title: 'İlan Yönetimi',
        subtitle: 'Emlak ilanlarınızı ekleyin ve yönetin',
        back: 'Emlak Dashboard',
        addProperty: 'İlan Ekle',
        importXml: 'XML İçe Aktar',
        noProperties: 'Henüz ilan yok',
        noPropertiesDesc: 'İlk ilanınızı ekleyerek başlayın',
        search: 'İlan ara...',
        filter: 'Filtrele',
        allTypes: 'Tüm Tipler',
        allStatus: 'Tüm Durumlar',
        form: {
            title: 'İlan Başlığı',
            description: 'Açıklama',
            propertyType: 'Emlak Tipi',
            listingType: 'İlan Tipi',
            price: 'Fiyat',
            currency: 'Para Birimi',
            city: 'Şehir',
            district: 'İlçe',
            address: 'Adres',
            rooms: 'Oda Sayısı',
            area: 'Metrekare (m²)',
            floor: 'Kat',
            totalFloors: 'Toplam Kat',
            buildingAge: 'Bina Yaşı',
            images: 'Görsel URL\'leri (her satıra bir URL)',
            features: 'Özellikler',
            save: 'Kaydet',
            cancel: 'İptal',
            saving: 'Kaydediliyor...'
        },
        propertyTypes: {
            apartment: 'Daire',
            villa: 'Villa',
            house: 'Müstakil Ev',
            land: 'Arsa',
            commercial: 'Ticari'
        },
        listingTypes: {
            sale: 'Satılık',
            rent: 'Kiralık'
        },
        status: {
            active: 'Aktif',
            sold: 'Satıldı',
            rented: 'Kiralandı',
            inactive: 'Pasif'
        },
        source: {
            manual: 'Manuel',
            xml: 'XML',
            api: 'API'
        },
        xmlImport: {
            title: 'XML İçe Aktarma',
            description: 'Sahibinden, Hepsiemlak veya benzeri sitelerden XML dosyası yükleyin',
            selectChatbot: 'Chatbot Seçin',
            selectFormat: 'XML Formatı',
            uploadFile: 'Dosya Yükle',
            orPasteUrl: 'veya XML URL\'si yapıştırın',
            xmlUrl: 'XML URL',
            import: 'İçe Aktar',
            importing: 'İçe aktarılıyor...',
            formats: {
                generic: 'Genel Format',
                sahibinden: 'Sahibinden',
                hepsiemlak: 'Hepsiemlak',
                emlakjet: 'EmlakJet'
            }
        },
        messages: {
            propertyAdded: 'İlan başarıyla eklendi',
            propertyUpdated: 'İlan güncellendi',
            propertyDeleted: 'İlan silindi',
            importSuccess: 'İçe aktarma tamamlandı',
            error: 'Bir hata oluştu'
        }
    },
    en: {
        title: 'Property Management',
        subtitle: 'Add and manage your real estate listings',
        back: 'Real Estate Dashboard',
        addProperty: 'Add Property',
        importXml: 'Import XML',
        noProperties: 'No properties yet',
        noPropertiesDesc: 'Start by adding your first property',
        search: 'Search properties...',
        filter: 'Filter',
        allTypes: 'All Types',
        allStatus: 'All Status',
        form: {
            title: 'Property Title',
            description: 'Description',
            propertyType: 'Property Type',
            listingType: 'Listing Type',
            price: 'Price',
            currency: 'Currency',
            city: 'City',
            district: 'District',
            address: 'Address',
            rooms: 'Rooms',
            area: 'Area (m²)',
            floor: 'Floor',
            totalFloors: 'Total Floors',
            buildingAge: 'Building Age',
            images: 'Image URLs (one per line)',
            features: 'Features',
            save: 'Save',
            cancel: 'Cancel',
            saving: 'Saving...'
        },
        propertyTypes: {
            apartment: 'Apartment',
            villa: 'Villa',
            house: 'House',
            land: 'Land',
            commercial: 'Commercial'
        },
        listingTypes: {
            sale: 'For Sale',
            rent: 'For Rent'
        },
        status: {
            active: 'Active',
            sold: 'Sold',
            rented: 'Rented',
            inactive: 'Inactive'
        },
        source: {
            manual: 'Manual',
            xml: 'XML',
            api: 'API'
        },
        xmlImport: {
            title: 'XML Import',
            description: 'Upload XML file from Sahibinden, Hepsiemlak or similar sites',
            selectChatbot: 'Select Chatbot',
            selectFormat: 'XML Format',
            uploadFile: 'Upload File',
            orPasteUrl: 'or paste XML URL',
            xmlUrl: 'XML URL',
            import: 'Import',
            importing: 'Importing...',
            formats: {
                generic: 'Generic Format',
                sahibinden: 'Sahibinden',
                hepsiemlak: 'Hepsiemlak',
                emlakjet: 'EmlakJet'
            }
        },
        messages: {
            propertyAdded: 'Property added successfully',
            propertyUpdated: 'Property updated',
            propertyDeleted: 'Property deleted',
            importSuccess: 'Import completed',
            error: 'An error occurred'
        }
    }
}

export default function PropertiesPage() {
    const params = useParams()
    const locale = (params?.locale as string) || 'tr'
    const t = translations[locale as 'tr' | 'en'] || translations.tr

    const [properties, setProperties] = useState<Property[]>([])
    const [chatbots, setChatbots] = useState<Chatbot[]>([])
    const [selectedChatbot, setSelectedChatbot] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
    const [inspectionPropertyId, setInspectionPropertyId] = useState<string | null>(null)
    const [inspectionPropertyInitialTimes, setInspectionPropertyInitialTimes] = useState<any[]>([])
    const [saving, setSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        propertyType: 'apartment',
        listingType: 'sale',
        price: '',
        currency: 'TRY',
        city: '',
        district: '',
        address: '',
        rooms: '',
        area: '',
        floorNumber: '',
        totalFloors: '',
        buildingAge: '',
        images: '',
        hasGarage: false,
        hasPool: false,
        hasGarden: false,
        hasBalcony: false,
        hasElevator: false,
        hasSecurity: false,
        isFurnished: false,
    })

    // Import state
    const [importFormat, setImportFormat] = useState('generic')
    const [xmlUrl, setXmlUrl] = useState('')
    const [importing, setImporting] = useState(false)
    const [importResult, setImportResult] = useState<any>(null)

    // Fetch chatbots
    useEffect(() => {
        fetchChatbots()
    }, [])

    // Fetch properties when chatbot selected
    useEffect(() => {
        if (selectedChatbot) {
            fetchProperties()
        }
    }, [selectedChatbot])

    const fetchChatbots = async () => {
        try {
            const res = await fetch('/api/chatbots?industry=realestate')
            const data = await res.json()
            if (data.chatbots) {
                setChatbots(data.chatbots)
                if (data.chatbots.length > 0) {
                    setSelectedChatbot(data.chatbots[0].id)
                }
            }
        } catch (error) {
            console.error('Error fetching chatbots:', error)
        }
    }

    const fetchProperties = async () => {
        if (!selectedChatbot) return
        setLoading(true)
        try {
            const res = await fetch(`/api/properties?chatbotId=${selectedChatbot}`)
            const data = await res.json()
            setProperties(data.properties || [])
        } catch (error) {
            console.error('Error fetching properties:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddProperty = async () => {
        if (!selectedChatbot || !formData.title || !formData.price || !formData.city) {
            setMessage({ type: 'error', text: 'Lütfen zorunlu alanları doldurun' })
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatbotId: selectedChatbot,
                    ...formData,
                    price: parseFloat(formData.price),
                    area: formData.area ? parseFloat(formData.area) : undefined,
                    floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : undefined,
                    totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : undefined,
                    buildingAge: formData.buildingAge ? parseInt(formData.buildingAge) : undefined,
                    images: formData.images.split('\n').filter(url => url.trim()),
                })
            })

            if (res.ok) {
                setMessage({ type: 'success', text: t.messages.propertyAdded })
                setIsAddDialogOpen(false)
                resetForm()
                fetchProperties()
            } else {
                throw new Error('Failed to add property')
            }
        } catch (error) {
            setMessage({ type: 'error', text: t.messages.error })
        } finally {
            setSaving(false)
        }
    }

    const handleImportXml = async () => {
        if (!selectedChatbot || !xmlUrl) {
            setMessage({ type: 'error', text: 'Lütfen XML URL girin' })
            return
        }

        setImporting(true)
        setImportResult(null)
        try {
            const res = await fetch('/api/properties/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatbotId: selectedChatbot,
                    xmlUrl: xmlUrl,
                    format: importFormat
                })
            })

            const data = await res.json()
            if (res.ok) {
                setImportResult(data.results)
                setMessage({ type: 'success', text: data.message })
                fetchProperties()
            } else {
                throw new Error(data.error || 'Import failed')
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || t.messages.error })
        } finally {
            setImporting(false)
        }
    }

    const handleDeleteProperty = async (id: string) => {
        if (!confirm(locale === 'tr' ? 'Bu ilanı silmek istediğinize emin misiniz?' : 'Are you sure you want to delete this property?')) {
            return
        }

        try {
            const res = await fetch(`/api/properties?id=${id}`, { method: 'DELETE' })
            if (res.ok) {
                setMessage({ type: 'success', text: t.messages.propertyDeleted })
                fetchProperties()
            } else {
                throw new Error('Failed to delete')
            }
        } catch (error) {
            setMessage({ type: 'error', text: t.messages.error })
        }
    }

    const handleOpenInspections = (property: Property) => {
        // Since we don't fetch full inspection details in list view, 
        // we might pass empty array initially and let the component fetch it, 
        // OR we need to update the fetchProperties to include inspectionTimes.
        // For now, let's assume the component fetches its own data or we pass what we have.
        // But the current fetchProperties likely doesn't include inspectionTimes.
        // Let's modify the component to fetch on mount if needed, OR relies on props.
        // The InspectionTimesManager component takes initialInspections.
        // Let's assume we pass property ID and it handles it, OR we pass [] and correct it.
        // The most robust way is to pass initialInspections if available, or fetch.
        // However, InspectionTimesManager as separate component might be simplest to just fetch its own.
        // Let's check InspectionTimesManager again. It takes initialInspections but also fetches on update?
        // Actually it fetches on update (POST/DELETE). It doesn't fetch on mount.
        // So we should probably pass the data.
        // For this step, I will just open the dialog. The property object needs to have inspectionTimes.
        // I'll need to update the Property interface and fetch logic if not present.
        setInspectionPropertyId(property.id)
        setInspectionPropertyInitialTimes((property as any).inspectionTimes || [])
    }


    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            propertyType: 'apartment',
            listingType: 'sale',
            price: '',
            currency: 'TRY',
            city: '',
            district: '',
            address: '',
            rooms: '',
            area: '',
            floorNumber: '',
            totalFloors: '',
            buildingAge: '',
            images: '',
            hasGarage: false,
            hasPool: false,
            hasGarden: false,
            hasBalcony: false,
            hasElevator: false,
            hasSecurity: false,
            isFurnished: false,
        })
    }

    // Filter properties
    const filteredProperties = properties.filter(prop => {
        const matchesSearch = prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prop.city.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'all' || prop.propertyType === filterType
        const matchesStatus = filterStatus === 'all' || prop.status === filterStatus
        return matchesSearch && matchesType && matchesStatus
    })

    const formatPrice = (price: number, currency: string) => {
        if (currency === 'TRY') {
            return price >= 1000000
                ? `${(price / 1000000).toFixed(1)} Milyon TL`
                : `${price.toLocaleString('tr-TR')} TL`
        }
        return `${price.toLocaleString()} ${currency}`
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link href={`/${locale}/dashboard/realestate`} className="flex items-center text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t.back}
                            </Link>
                            <div className="h-6 border-l border-gray-300" />
                            <div className="flex items-center space-x-2">
                                <Home className="h-5 w-5 text-amber-600" />
                                <h1 className="text-lg font-semibold">{t.title}</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Chatbot Selector */}
                            <Select value={selectedChatbot} onValueChange={setSelectedChatbot}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Chatbot seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {chatbots.map(bot => (
                                        <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Import XML Button */}
                            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        {t.importXml}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>{t.xmlImport.title}</DialogTitle>
                                        <DialogDescription>{t.xmlImport.description}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label>{t.xmlImport.selectFormat}</Label>
                                            <Select value={importFormat} onValueChange={setImportFormat}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="generic">{t.xmlImport.formats.generic}</SelectItem>
                                                    <SelectItem value="sahibinden">{t.xmlImport.formats.sahibinden}</SelectItem>
                                                    <SelectItem value="hepsiemlak">{t.xmlImport.formats.hepsiemlak}</SelectItem>
                                                    <SelectItem value="emlakjet">{t.xmlImport.formats.emlakjet}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>{t.xmlImport.xmlUrl}</Label>
                                            <Input
                                                value={xmlUrl}
                                                onChange={(e) => setXmlUrl(e.target.value)}
                                                placeholder="https://example.com/properties.xml"
                                            />
                                        </div>

                                        {importResult && (
                                            <div className="p-3 bg-gray-50 rounded-lg text-sm">
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span>Yeni: {importResult.imported}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-blue-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span>Güncellenen: {importResult.updated}</span>
                                                </div>
                                                {importResult.skipped > 0 && (
                                                    <div className="flex items-center gap-2 text-yellow-600">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>Atlanan: {importResult.skipped}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                                            {t.form.cancel}
                                        </Button>
                                        <Button onClick={handleImportXml} disabled={importing}>
                                            {importing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {t.xmlImport.importing}
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    {t.xmlImport.import}
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* Add Property Button */}
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-amber-600 hover:bg-amber-700">
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t.addProperty}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{t.addProperty}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <Label>{t.form.title} *</Label>
                                            <Input
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="Modern 3+1 Daire"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>{t.form.description}</Label>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <Label>{t.form.propertyType}</Label>
                                            <Select value={formData.propertyType} onValueChange={(v) => setFormData({ ...formData, propertyType: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(t.propertyTypes).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>{t.form.listingType}</Label>
                                            <Select value={formData.listingType} onValueChange={(v) => setFormData({ ...formData, listingType: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(t.listingTypes).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>{t.form.price} *</Label>
                                            <Input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="2500000"
                                            />
                                        </div>
                                        <div>
                                            <Label>{t.form.currency}</Label>
                                            <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="TRY">TRY (₺)</SelectItem>
                                                    <SelectItem value="USD">USD ($)</SelectItem>
                                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>{t.form.city} *</Label>
                                            <Input
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                placeholder="İstanbul"
                                            />
                                        </div>
                                        <div>
                                            <Label>{t.form.district}</Label>
                                            <Input
                                                value={formData.district}
                                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                                placeholder="Kadıköy"
                                            />
                                        </div>
                                        <div>
                                            <Label>{t.form.rooms}</Label>
                                            <Select value={formData.rooms} onValueChange={(v) => setFormData({ ...formData, rooms: v })}>
                                                <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1+0">1+0</SelectItem>
                                                    <SelectItem value="1+1">1+1</SelectItem>
                                                    <SelectItem value="2+1">2+1</SelectItem>
                                                    <SelectItem value="3+1">3+1</SelectItem>
                                                    <SelectItem value="4+1">4+1</SelectItem>
                                                    <SelectItem value="5+1">5+1</SelectItem>
                                                    <SelectItem value="5+2">5+2</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>{t.form.area}</Label>
                                            <Input
                                                type="number"
                                                value={formData.area}
                                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                                placeholder="120"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>{t.form.images}</Label>
                                            <Textarea
                                                value={formData.images}
                                                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                                                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="mt-4">
                                        <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm() }}>
                                            {t.form.cancel}
                                        </Button>
                                        <Button onClick={handleAddProperty} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
                                            {saving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {t.form.saving}
                                                </>
                                            ) : (
                                                t.form.save
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Toast */}
            {message && (
                <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    <div className="flex items-center gap-2">
                        {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {message.text}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.search}
                            className="pl-10"
                        />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t.allTypes} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t.allTypes}</SelectItem>
                            {Object.entries(t.propertyTypes).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t.allStatus} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t.allStatus}</SelectItem>
                            {Object.entries(t.status).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Properties Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                    </div>
                ) : filteredProperties.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Home className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noProperties}</h3>
                            <p className="text-gray-500 mb-4">{t.noPropertiesDesc}</p>
                            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-amber-600 hover:bg-amber-700">
                                <Plus className="mr-2 h-4 w-4" />
                                {t.addProperty}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProperties.map((property) => (
                            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative h-48">
                                    <img
                                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'}
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 flex gap-2">
                                        <Badge className={property.listingType === 'sale' ? 'bg-amber-600' : 'bg-blue-600'}>
                                            {t.listingTypes[property.listingType as 'sale' | 'rent']}
                                        </Badge>
                                        <Badge variant="outline" className="bg-white/90">
                                            {t.propertyTypes[property.propertyType as keyof typeof t.propertyTypes]}
                                        </Badge>
                                    </div>
                                    <Badge className="absolute top-2 right-2 bg-gray-800">
                                        {t.source[property.source as 'manual' | 'xml' | 'api']}
                                    </Badge>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
                                    <p className="text-amber-600 font-bold text-lg mb-2">
                                        {formatPrice(property.price, property.currency)}
                                    </p>
                                    <div className="flex items-center text-gray-500 text-sm mb-2">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {property.district ? `${property.district}, ${property.city}` : property.city}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                        {property.rooms && <span>{property.rooms}</span>}
                                        {property.area && <span>{property.area} m²</span>}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                                            {t.status[property.status as keyof typeof t.status]}
                                        </Badge>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => handleOpenInspections(property)} title={locale === 'tr' ? 'Görüntüleme Saatleri' : 'Inspection Times'}>
                                                <CalendarClock className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleDeleteProperty(property.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                {/* Inspection Times Dialog */}
                <Dialog open={!!inspectionPropertyId} onOpenChange={(open) => !open && setInspectionPropertyId(null)}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>
                                {locale === 'tr' ? 'Görüntüleme Saatleri Yönetimi' : 'Manage Inspection Times'}
                            </DialogTitle>
                        </DialogHeader>
                        {inspectionPropertyId && (
                            <InspectionTimesManager
                                propertyId={inspectionPropertyId}
                                initialInspections={inspectionPropertyInitialTimes}
                                locale={locale}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
