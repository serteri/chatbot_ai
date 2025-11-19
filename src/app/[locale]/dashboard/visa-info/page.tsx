'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Globe,
    Clock,
    DollarSign,
    FileText,
    Search,
    Filter,
    MapPin,
    Calendar,
    CheckCircle,
    AlertCircle,
    ExternalLink
} from 'lucide-react'

interface VisaInfo {
    id: string
    country: string
    visaType: string
    duration: string
    cost: number | null
    requirements: string[]
    processingTime: string
    website?: string
    description?: string
    multiLanguage?: {
        tr?: { title: string; description: string }
        en?: { title: string; description: string }
    }
}

export default function VisaInfoPage() {
    const [visaData, setVisaData] = useState<VisaInfo[]>([])
    const [filteredData, setFilteredData] = useState<VisaInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRegion, setSelectedRegion] = useState('all')
    const [costFilter, setCostFilter] = useState('all')
    const [selectedVisa, setSelectedVisa] = useState<VisaInfo | null>(null)

    // Fetch visa data
    useEffect(() => {
        const fetchVisaData = async () => {
            try {
                const response = await fetch('/api/visa-info')
                if (response.ok) {
                    const data = await response.json()
                    setVisaData(data.visas || [])
                    setFilteredData(data.visas || [])
                } else {
                    // Fallback with sample data if API not ready
                    const sampleData: VisaInfo[] = [
                        {
                            id: 'visa_germany',
                            country: 'Germany',
                            visaType: 'Student (National Visa)',
                            duration: '1-4 years',
                            cost: 75,
                            requirements: [
                                'University acceptance letter',
                                'Blocked account (€11,208/year)',
                                'Health insurance',
                                'Academic transcripts',
                                'Language proficiency'
                            ],
                            processingTime: '4-8 weeks',
                            website: 'https://www.germany.travel/visa',
                            description: 'German student visa for long-term academic programs.',
                            multiLanguage: {
                                tr: {
                                    title: 'Almanya Öğrenci Vizesi',
                                    description: 'Almanya\'da uzun süreli akademik programlar için vize'
                                }
                            }
                        },
                        {
                            id: 'visa_usa',
                            country: 'USA',
                            visaType: 'Student (F-1)',
                            duration: 'Program duration + 60 days',
                            cost: 350,
                            requirements: [
                                'SEVIS I-20 form',
                                'DS-160 application',
                                'Financial proof ($25,000+/year)',
                                'University acceptance',
                                'Visa interview'
                            ],
                            processingTime: '2-8 weeks',
                            website: 'https://travel.state.gov/student-visa',
                            description: 'F-1 visa for full-time academic study in the United States.',
                            multiLanguage: {
                                tr: {
                                    title: 'Amerika F-1 Öğrenci Vizesi',
                                    description: 'Amerika\'da tam zamanlı akademik eğitim için vize'
                                }
                            }
                        }
                    ]
                    setVisaData(sampleData)
                    setFilteredData(sampleData)
                }
            } catch (error) {
                console.error('Failed to fetch visa data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchVisaData()
    }, [])

    // Filter logic
    useEffect(() => {
        let filtered = visaData

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(visa =>
                visa.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                visa.visaType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                visa.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Region filter
        if (selectedRegion !== 'all') {
            const regions = {
                'north-america': ['USA', 'Canada', 'Mexico'],
                'europe': ['Germany', 'UK', 'France', 'Netherlands', 'Italy', 'Spain', 'Switzerland', 'Austria', 'Belgium', 'Portugal', 'Ireland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland', 'Poland', 'Czech Republic', 'Hungary', 'Slovakia', 'Slovenia', 'Romania', 'Bulgaria', 'Russia', 'Turkey'],
                'asia': ['Japan', 'South Korea', 'China', 'Singapore', 'Malaysia', 'Thailand', 'India', 'Hong Kong', 'Taiwan'],
                'oceania': ['Australia', 'New Zealand', 'Fiji'],
                'other': ['Brazil', 'Argentina', 'UAE', 'Egypt', 'South Africa']
            }

            const regionCountries = regions[selectedRegion as keyof typeof regions] || []
            filtered = filtered.filter(visa => regionCountries.includes(visa.country))
        }

        // Cost filter
        if (costFilter !== 'all') {
            filtered = filtered.filter(visa => {
                if (!visa.cost) return false
                switch (costFilter) {
                    case 'low': return visa.cost <= 100
                    case 'medium': return visa.cost > 100 && visa.cost <= 300
                    case 'high': return visa.cost > 300
                    default: return true
                }
            })
        }

        setFilteredData(filtered)
    }, [searchTerm, selectedRegion, costFilter, visaData])

    const regions = [
        { value: 'all', label: 'Tüm Bölgeler' },
        { value: 'north-america', label: 'Kuzey Amerika' },
        { value: 'europe', label: 'Avrupa' },
        { value: 'asia', label: 'Asya' },
        { value: 'oceania', label: 'Okyanusya' },
        { value: 'other', label: 'Diğer' }
    ]

    const costRanges = [
        { value: 'all', label: 'Tüm Maliyetler' },
        { value: 'low', label: 'Düşük (≤$100)' },
        { value: 'medium', label: 'Orta ($100-300)' },
        { value: 'high', label: 'Yüksek ($300+)' }
    ]

    const getCostBadgeColor = (cost: number | null) => {
        if (!cost) return 'secondary'
        if (cost <= 100) return 'default'
        if (cost <= 300) return 'secondary'
        return 'destructive'
    }

    const getProcessingBadgeColor = (time: string) => {
        const weeks = time.toLowerCase()
        if (weeks.includes('1-2') || weeks.includes('2-3')) return 'default'
        if (weeks.includes('4-6') || weeks.includes('3-5')) return 'secondary'
        return 'destructive'
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <Globe className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold">Öğrenci Vize Bilgileri</h1>
                        <p className="text-gray-600">70+ ülke için kapsamlı vize gereksinimleri</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Toplam Ülke</CardTitle>
                            <div className="text-2xl font-bold">{visaData.length}</div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Ortalama Maliyet</CardTitle>
                            <div className="text-2xl font-bold">
                                ${Math.round(visaData.filter(v => v.cost).reduce((sum, v) => sum + (v.cost || 0), 0) / visaData.filter(v => v.cost).length) || 0}
                            </div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">En Ucuz</CardTitle>
                            <div className="text-2xl font-bold">
                                ${visaData.filter(v => v.cost).length > 0 ? Math.min(...visaData.filter(v => v.cost).map(v => v.cost!)) : 0}
                            </div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">En Pahalı</CardTitle>
                            <div className="text-2xl font-bold">
                                ${visaData.filter(v => v.cost).length > 0 ? Math.max(...visaData.filter(v => v.cost).map(v => v.cost!)) : 0}
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filtreler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Arama</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Ülke, vize türü ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bölge</label>
                                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regions.map(region => (
                                            <SelectItem key={region.value} value={region.value}>
                                                {region.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Maliyet Aralığı</label>
                                <Select value={costFilter} onValueChange={setCostFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {costRanges.map(range => (
                                            <SelectItem key={range.value} value={range.value}>
                                                {range.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">İşlemler</label>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('')
                                        setSelectedRegion('all')
                                        setCostFilter('all')
                                    }}
                                    className="w-full"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filtreleri Temizle
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="grid" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="grid">Kart Görünümü</TabsTrigger>
                    <TabsTrigger value="table">Tablo Görünümü</TabsTrigger>
                    <TabsTrigger value="compare">Karşılaştır</TabsTrigger>
                </TabsList>

                <TabsContent value="grid" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredData.map((visa) => (
                            <Card key={visa.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                                  onClick={() => setSelectedVisa(visa)}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg flex items-center space-x-2">
                                                <span>{visa.country}</span>
                                                <Badge variant="outline">{visa.visaType.split(' ')[0]}</Badge>
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {visa.multiLanguage?.tr?.title || visa.visaType}
                                            </CardDescription>
                                        </div>
                                        {visa.cost && (
                                            <Badge variant={getCostBadgeColor(visa.cost)}>
                                                ${visa.cost}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{visa.duration}</span>
                                        </div>
                                        <Badge variant={getProcessingBadgeColor(visa.processingTime)} className="text-xs">
                                            {visa.processingTime}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">Ana Gereksinimler:</div>
                                        <div className="space-y-1">
                                            {visa.requirements.slice(0, 3).map((req, idx) => (
                                                <div key={idx} className="flex items-start space-x-2 text-sm text-gray-600">
                                                    <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                                                    <span>{req}</span>
                                                </div>
                                            ))}
                                            {visa.requirements.length > 3 && (
                                                <div className="text-xs text-gray-400">
                                                    +{visa.requirements.length - 3} gereksinim daha
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {visa.website && (
                                        <Button variant="outline" size="sm" className="w-full" asChild>
                                            <a href={visa.website} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Resmi Bilgi
                                            </a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredData.length === 0 && (
                        <Card>
                            <CardContent className="text-center py-12">
                                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No visa information found</h3>
                                <p className="text-gray-600 mb-4">
                                    Try adjusting your search criteria or filters
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('')
                                        setSelectedRegion('all')
                                        setCostFilter('all')
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="table">
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="p-4 font-medium">Country</th>
                                        <th className="p-4 font-medium">Visa Type</th>
                                        <th className="p-4 font-medium">Cost</th>
                                        <th className="p-4 font-medium">Processing Time</th>
                                        <th className="p-4 font-medium">Duration</th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredData.map((visa) => (
                                        <tr key={visa.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4 font-medium">{visa.country}</td>
                                            <td className="p-4">{visa.visaType}</td>
                                            <td className="p-4">
                                                {visa.cost ? (
                                                    <Badge variant={getCostBadgeColor(visa.cost)}>
                                                        ${visa.cost}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={getProcessingBadgeColor(visa.processingTime)}>
                                                    {visa.processingTime}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-gray-600">{visa.duration}</td>
                                            <td className="p-4">
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedVisa(visa)}
                                                    >
                                                        View Details
                                                    </Button>
                                                    {visa.website && (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={visa.website} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="compare">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visa Comparison</CardTitle>
                            <CardDescription>
                                Click on countries in the grid view to compare their visa requirements
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-gray-500">
                                <Globe className="h-12 w-12 mx-auto mb-4" />
                                <p>Comparison feature coming soon...</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Detailed Visa Modal */}
            {selectedVisa && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                     onClick={() => setSelectedVisa(null)}>
                    <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-xl flex items-center space-x-3">
                                        <span>{selectedVisa.country}</span>
                                        <Badge variant="outline">{selectedVisa.visaType}</Badge>
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        {selectedVisa.multiLanguage?.tr?.description || selectedVisa.description}
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setSelectedVisa(null)}>
                                    ✕
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Key Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-600">Cost</div>
                                    <div className="text-lg font-bold">
                                        {selectedVisa.cost ? `$${selectedVisa.cost}` : 'Variable'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-600">Processing Time</div>
                                    <div className="text-lg font-bold">{selectedVisa.processingTime}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-600">Duration</div>
                                    <div className="text-lg font-bold">{selectedVisa.duration}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-600">Visa Type</div>
                                    <div className="text-lg font-bold">{selectedVisa.visaType}</div>
                                </div>
                            </div>

                            {/* Requirements */}
                            <div className="space-y-3">
                                <div className="text-lg font-semibold">Required Documents</div>
                                <div className="grid gap-3">
                                    {selectedVisa.requirements.map((req, idx) => (
                                        <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">{req}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-3">
                                {selectedVisa.website && (
                                    <Button asChild className="flex-1">
                                        <a href={selectedVisa.website} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Official Website
                                        </a>
                                    </Button>
                                )}
                                <Button variant="outline" onClick={() => setSelectedVisa(null)}>
                                    Close
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}