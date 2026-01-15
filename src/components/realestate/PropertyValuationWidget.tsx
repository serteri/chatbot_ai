'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/dialog'

import { Calculator, TrendingUp, TrendingDown, Minus, Loader2, Sparkles, AlertTriangle, Search, AlertCircle, Info, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { AU_SUBURBS, type Suburb } from '@/data/suburbs'

type WarningLevel = 'none' | 'warning' | 'critical' | 'blocked'

interface ValuationUsageStatus {
    used: number
    limit: number
    remaining: number
    percentage: number
    warningLevel: WarningLevel
    planType: string
    isUnlimited: boolean
    message?: string
}

interface ValuationResult {
    estimatedValue: {
        min: number
        max: number
        median: number
    }
    confidence: 'high' | 'medium' | 'low'
    currency: string
    reasoning: string
    factors: {
        factor: string
        impact: 'positive' | 'negative' | 'neutral'
        description: string
    }[]
    marketInsights: string
    disclaimer: string
    usage?: ValuationUsageStatus
}

interface PropertyValuationWidgetProps {
    locale: string
}

const translations = {
    tr: {
        title: 'AI Değerleme',
        description: 'Yapay zeka ile emlak fiyat tahmini alın',
        getValuation: 'Değerleme Al',
        suburb: 'Bölge/Suburb',
        propertyType: 'Emlak Tipi',
        bedrooms: 'Yatak Odası',
        bathrooms: 'Banyo',
        carSpaces: 'Otopark',
        area: 'Alan (m²)',
        calculate: 'Hesapla',
        estimatedValue: 'Tahmini Değer',
        confidence: 'Güven Seviyesi',
        high: 'Yüksek',
        medium: 'Orta',
        low: 'Düşük',
        factors: 'Etki Faktörleri',
        marketInsights: 'Pazar Görüşleri',
        disclaimer: 'Yasal Uyarı',
        house: 'Ev',
        apartment: 'Daire',
        townhouse: 'Şehir Evi',
        unit: 'Ünite',
        land: 'Arsa',
        positive: 'Olumlu',
        negative: 'Olumsuz',
        neutral: 'Nötr',
        reasoning: 'Değerlendirme',
        // Usage translations
        monthlyUsage: 'Aylık Kullanım',
        valuationsUsed: 'değerleme kullanıldı',
        remaining: 'kalan',
        unlimited: 'Sınırsız',
        upgradeForMore: 'Daha fazla değerleme için planınızı yükseltin',
        warningLow: 'Değerleme hakkınız azalıyor!',
        warningCritical: 'Kritik: Çok az değerleme hakkınız kaldı!',
        warningBlocked: 'Aylık değerleme limitinize ulaştınız',
        plan: 'Plan'
    },
    en: {
        title: 'AI Valuation',
        description: 'Get AI-powered property price estimates',
        getValuation: 'Get Valuation',
        suburb: 'Suburb',
        propertyType: 'Property Type',
        bedrooms: 'Bedrooms',
        bathrooms: 'Bathrooms',
        carSpaces: 'Car Spaces',
        area: 'Area (sqm)',
        calculate: 'Calculate',
        estimatedValue: 'Estimated Value',
        confidence: 'Confidence Level',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        factors: 'Impact Factors',
        marketInsights: 'Market Insights',
        disclaimer: 'Disclaimer',
        house: 'House',
        apartment: 'Apartment',
        townhouse: 'Townhouse',
        unit: 'Unit',
        land: 'Land',
        positive: 'Positive',
        negative: 'Negative',
        neutral: 'Neutral',
        reasoning: 'Analysis',
        // Usage translations
        monthlyUsage: 'Monthly Usage',
        valuationsUsed: 'valuations used',
        remaining: 'remaining',
        unlimited: 'Unlimited',
        upgradeForMore: 'Upgrade your plan for more valuations',
        warningLow: 'Running low on valuations!',
        warningCritical: 'Critical: Very few valuations remaining!',
        warningBlocked: 'Monthly valuation limit reached',
        plan: 'Plan'
    },
    de: {
        title: 'KI-Bewertung',
        description: 'Erhalten Sie KI-gestützte Immobilienpreisschätzungen',
        getValuation: 'Bewertung erhalten',
        suburb: 'Stadtteil',
        propertyType: 'Immobilientyp',
        bedrooms: 'Schlafzimmer',
        bathrooms: 'Badezimmer',
        carSpaces: 'Parkplätze',
        area: 'Fläche (m²)',
        calculate: 'Berechnen',
        estimatedValue: 'Geschätzter Wert',
        confidence: 'Vertrauensniveau',
        high: 'Hoch',
        medium: 'Mittel',
        low: 'Niedrig',
        factors: 'Einflussfaktoren',
        marketInsights: 'Markteinblicke',
        disclaimer: 'Haftungsausschluss',
        house: 'Haus',
        apartment: 'Wohnung',
        townhouse: 'Reihenhaus',
        unit: 'Einheit',
        land: 'Grundstück',
        positive: 'Positiv',
        negative: 'Negativ',
        neutral: 'Neutral',
        reasoning: 'Analyse',
        // Usage translations
        monthlyUsage: 'Monatliche Nutzung',
        valuationsUsed: 'Bewertungen verwendet',
        remaining: 'verbleibend',
        unlimited: 'Unbegrenzt',
        upgradeForMore: 'Upgrade für mehr Bewertungen',
        warningLow: 'Bewertungen werden knapp!',
        warningCritical: 'Kritisch: Sehr wenige Bewertungen übrig!',
        warningBlocked: 'Monatliches Bewertungslimit erreicht',
        plan: 'Plan'
    },
    fr: {
        title: 'Évaluation IA',
        description: 'Obtenez des estimations de prix immobilier par IA',
        getValuation: 'Obtenir une évaluation',
        suburb: 'Quartier',
        propertyType: 'Type de propriété',
        bedrooms: 'Chambres',
        bathrooms: 'Salles de bain',
        carSpaces: 'Places de parking',
        area: 'Surface (m²)',
        calculate: 'Calculer',
        estimatedValue: 'Valeur estimée',
        confidence: 'Niveau de confiance',
        high: 'Élevé',
        medium: 'Moyen',
        low: 'Faible',
        factors: 'Facteurs d\'impact',
        marketInsights: 'Aperçu du marché',
        disclaimer: 'Avertissement',
        house: 'Maison',
        apartment: 'Appartement',
        townhouse: 'Maison de ville',
        unit: 'Unité',
        land: 'Terrain',
        positive: 'Positif',
        negative: 'Négatif',
        neutral: 'Neutre',
        reasoning: 'Analyse',
        // Usage translations
        monthlyUsage: 'Utilisation mensuelle',
        valuationsUsed: 'évaluations utilisées',
        remaining: 'restantes',
        unlimited: 'Illimité',
        upgradeForMore: 'Passez à un plan supérieur pour plus d\'évaluations',
        warningLow: 'Évaluations limitées restantes!',
        warningCritical: 'Critique: Très peu d\'évaluations restantes!',
        warningBlocked: 'Limite mensuelle d\'évaluations atteinte',
        plan: 'Plan'
    },
    es: {
        title: 'Valoración IA',
        description: 'Obtenga estimaciones de precios con IA',
        getValuation: 'Obtener valoración',
        suburb: 'Barrio',
        propertyType: 'Tipo de propiedad',
        bedrooms: 'Habitaciones',
        bathrooms: 'Baños',
        carSpaces: 'Estacionamientos',
        area: 'Área (m²)',
        calculate: 'Calcular',
        estimatedValue: 'Valor estimado',
        confidence: 'Nivel de confianza',
        high: 'Alto',
        medium: 'Medio',
        low: 'Bajo',
        factors: 'Factores de impacto',
        marketInsights: 'Perspectivas del mercado',
        disclaimer: 'Descargo de responsabilidad',
        house: 'Casa',
        apartment: 'Apartamento',
        townhouse: 'Casa adosada',
        unit: 'Unidad',
        land: 'Terreno',
        positive: 'Positivo',
        negative: 'Negativo',
        neutral: 'Neutral',
        reasoning: 'Análisis',
        // Usage translations
        monthlyUsage: 'Uso mensual',
        valuationsUsed: 'valoraciones usadas',
        remaining: 'restantes',
        unlimited: 'Ilimitado',
        upgradeForMore: 'Actualice su plan para más valoraciones',
        warningLow: '¡Pocas valoraciones restantes!',
        warningCritical: '¡Crítico: Muy pocas valoraciones restantes!',
        warningBlocked: 'Límite mensual de valoraciones alcanzado',
        plan: 'Plan'
    }
}

export function PropertyValuationWidget({ locale }: PropertyValuationWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<ValuationResult | null>(null)
    const [formData, setFormData] = useState({
        suburb: '',
        propertyType: 'house',
        bedrooms: 3,
        bathrooms: 2,
        carSpaces: 1,
        landArea: 0
    })

    // Autocomplete state
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [filteredSuburbs, setFilteredSuburbs] = useState<Suburb[]>([])
    const [inputValue, setInputValue] = useState('')

    const t = translations[locale as keyof typeof translations] || translations.en

    // Smart filtering for autocomplete - prioritize starts-with matches
    const filterSuburbs = (query: string): Suburb[] => {
        if (!query || query.length < 2) return []

        const lowerQuery = query.toLowerCase()

        // Get suburb name without state/postcode for matching
        const getSuburbName = (label: string) => label.split(',')[0].toLowerCase()

        // Exact matches first
        const exactMatches = AU_SUBURBS.filter(s =>
            getSuburbName(s.label) === lowerQuery
        )

        // Starts-with matches
        const startsWithMatches = AU_SUBURBS.filter(s =>
            getSuburbName(s.label).startsWith(lowerQuery) &&
            !exactMatches.includes(s)
        )

        // Contains matches
        const containsMatches = AU_SUBURBS.filter(s =>
            s.label.toLowerCase().includes(lowerQuery) &&
            !exactMatches.includes(s) &&
            !startsWithMatches.includes(s)
        )

        // Postcode matches
        const postcodeMatches = AU_SUBURBS.filter(s =>
            s.postcode.startsWith(lowerQuery) &&
            !exactMatches.includes(s) &&
            !startsWithMatches.includes(s) &&
            !containsMatches.includes(s)
        )

        return [...exactMatches, ...startsWithMatches, ...containsMatches, ...postcodeMatches].slice(0, 10)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
            maximumFractionDigits: 0
        }).format(value)
    }

    const handleSubmit = async () => {
        if (!formData.suburb) {
            toast.error('Please enter a suburb')
            return
        }

        setIsLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/valuation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    suburb: formData.suburb,
                    propertyType: formData.propertyType,
                    bedrooms: formData.bedrooms,
                    bathrooms: formData.bathrooms,
                    carSpaces: formData.carSpaces,
                    landArea: formData.landArea || undefined
                })
            })

            const data = await response.json()

            if (response.status === 403) {
                // Limit reached
                toast.error(locale === 'tr'
                    ? `Değerleme limitinize ulaştınız (${data.usage?.used || 0}/${data.usage?.limit || 5})`
                    : `Valuation limit reached (${data.usage?.used || 0}/${data.usage?.limit || 5})`)
                return
            }

            if (!response.ok) throw new Error('Failed to get valuation')

            setResult(data)
        } catch (error) {
            console.error(error)
            toast.error(locale === 'tr' ? 'Değerleme alınamadı' : 'Failed to get valuation')
        } finally {
            setIsLoading(false)
        }
    }

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high': return 'bg-green-100 text-green-700'
            case 'medium': return 'bg-yellow-100 text-yellow-700'
            case 'low': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getImpactIcon = (impact: string) => {
        switch (impact) {
            case 'positive': return <TrendingUp className="h-4 w-4 text-green-500" />
            case 'negative': return <TrendingDown className="h-4 w-4 text-red-500" />
            default: return <Minus className="h-4 w-4 text-gray-500" />
        }
    }

    const resetForm = () => {
        setFormData({
            suburb: '',
            propertyType: 'house',
            bedrooms: 3,
            bathrooms: 2,
            carSpaces: 1,
            landArea: 0
        })
        setInputValue('')
        setFilteredSuburbs([])
        setShowSuggestions(false)
        setResult(null)
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            resetForm()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{t.title}</h3>
                            <p className="text-sm text-muted-foreground">{t.description}</p>
                        </div>
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-purple-600" />
                        {t.title}
                    </DialogTitle>
                    <DialogDescription>{t.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Form */}
                    <div className="space-y-2">
                        <Label htmlFor="suburb">{t.suburb}</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            <Input
                                id="suburb"
                                placeholder="Start typing suburb or postcode..."
                                value={inputValue}
                                onChange={(e) => {
                                    const value = e.target.value
                                    setInputValue(value)
                                    const filtered = filterSuburbs(value)
                                    setFilteredSuburbs(filtered)
                                    setShowSuggestions(value.length >= 2)
                                    // Clear selected suburb when typing
                                    if (formData.suburb && value !== formData.suburb) {
                                        setFormData(prev => ({ ...prev, suburb: '' }))
                                    }
                                }}
                                onFocus={() => {
                                    if (inputValue.length >= 2) {
                                        setShowSuggestions(true)
                                    }
                                }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                className="pl-10"
                                autoComplete="off"
                            />
                            {showSuggestions && inputValue.length >= 2 && (
                                <div className="absolute z-[99999] w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-xl overflow-hidden">
                                    {filteredSuburbs.length > 0 ? (
                                        <ul className="max-h-64 overflow-auto">
                                            {filteredSuburbs.map((suburb) => (
                                                <li
                                                    key={suburb.value}
                                                    className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, suburb: suburb.value }))
                                                        setInputValue(suburb.label)
                                                        setShowSuggestions(false)
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="font-medium text-gray-900">{suburb.label.split(',')[0]}</span>
                                                            <span className="text-gray-500 ml-1">{suburb.state} {suburb.postcode}</span>
                                                        </div>
                                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{suburb.city}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="px-4 py-3 text-gray-500 text-sm">
                                            No suburbs found matching "{inputValue}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {formData.suburb && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Selected: {formData.suburb}
                            </div>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="propertyType">{t.propertyType}</Label>
                        <Select
                            value={formData.propertyType}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[9999] bg-white" position="popper" sideOffset={5}>
                                <SelectItem value="house">{t.house}</SelectItem>
                                <SelectItem value="apartment">{t.apartment}</SelectItem>
                                <SelectItem value="townhouse">{t.townhouse}</SelectItem>
                                <SelectItem value="unit">{t.unit}</SelectItem>
                                <SelectItem value="land">{t.land}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Label htmlFor="bedrooms">{t.bedrooms}</Label>
                            <Input
                                id="bedrooms"
                                type="number"
                                min={1}
                                max={10}
                                value={formData.bedrooms}
                                onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 1 }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="bathrooms">{t.bathrooms}</Label>
                            <Input
                                id="bathrooms"
                                type="number"
                                min={1}
                                max={10}
                                value={formData.bathrooms}
                                onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 1 }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="carSpaces">{t.carSpaces}</Label>
                            <Input
                                id="carSpaces"
                                type="number"
                                min={0}
                                max={10}
                                value={formData.carSpaces}
                                onChange={(e) => setFormData(prev => ({ ...prev, carSpaces: parseInt(e.target.value) || 0 }))}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                <Button onClick={handleSubmit} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Calculating...
                        </>
                    ) : (
                        <>
                            <Calculator className="mr-2 h-4 w-4" />
                            {t.calculate}
                        </>
                    )}
                </Button>

                {/* Results */}
                {result && (
                    <div className="space-y-4 border-t pt-4">
                        {/* Estimated Value */}
                        <div className="text-center p-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
                            <p className="text-sm text-purple-700 mb-1">{t.estimatedValue}</p>
                            <p className="text-3xl font-bold text-purple-900">
                                {formatCurrency(result.estimatedValue.median)}
                            </p>
                            <p className="text-sm text-purple-600 mt-1">
                                {formatCurrency(result.estimatedValue.min)} - {formatCurrency(result.estimatedValue.max)}
                            </p>
                            <Badge className={`mt-2 ${getConfidenceColor(result.confidence)}`}>
                                {t.confidence}: {t[result.confidence as keyof typeof t]}
                            </Badge>
                        </div>

                        {/* Reasoning */}
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <h4 className="font-medium mb-2">{t.reasoning}</h4>
                            <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                        </div>

                        {/* Factors */}
                        <div>
                            <h4 className="font-medium mb-2">{t.factors}</h4>
                            <div className="space-y-2">
                                {result.factors.map((factor, index) => (
                                    <div key={index} className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                                        {getImpactIcon(factor.impact)}
                                        <div>
                                            <span className="font-medium text-sm">{factor.factor}</span>
                                            <p className="text-xs text-muted-foreground">{factor.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Market Insights */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-1">{t.marketInsights}</h4>
                            <p className="text-sm text-blue-700">{result.marketInsights}</p>
                        </div>

                        {/* Disclaimer */}
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700">{result.disclaimer}</p>
                        </div>

                        {/* Usage Counter */}
                        {result.usage && (
                            <div className={`p-4 rounded-lg border ${
                                result.usage.warningLevel === 'critical'
                                    ? 'bg-red-50 border-red-200'
                                    : result.usage.warningLevel === 'warning'
                                        ? 'bg-orange-50 border-orange-200'
                                        : 'bg-gray-50 border-gray-200'
                            }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {result.usage.warningLevel === 'critical' ? (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        ) : result.usage.warningLevel === 'warning' ? (
                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                        ) : result.usage.isUnlimited ? (
                                            <Crown className="h-4 w-4 text-purple-500" />
                                        ) : (
                                            <Info className="h-4 w-4 text-gray-500" />
                                        )}
                                        <span className="text-sm font-medium">{t.monthlyUsage}</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs capitalize">
                                        {t.plan}: {result.usage.planType}
                                    </Badge>
                                </div>

                                {result.usage.isUnlimited ? (
                                    <div className="flex items-center gap-2 text-purple-700">
                                        <Crown className="h-4 w-4" />
                                        <span className="text-sm font-medium">{t.unlimited}</span>
                                        <span className="text-xs text-gray-500">({result.usage.used} {t.valuationsUsed})</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${
                                                    result.usage.warningLevel === 'critical' || result.usage.warningLevel === 'blocked'
                                                        ? 'bg-red-500'
                                                        : result.usage.warningLevel === 'warning'
                                                            ? 'bg-orange-500'
                                                            : 'bg-green-500'
                                                }`}
                                                style={{ width: `${Math.min(result.usage.percentage, 100)}%` }}
                                            />
                                        </div>

                                        {/* Usage Text */}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={`font-medium ${
                                                result.usage.warningLevel === 'critical' ? 'text-red-700' :
                                                result.usage.warningLevel === 'warning' ? 'text-orange-700' :
                                                'text-gray-700'
                                            }`}>
                                                {result.usage.used} / {result.usage.limit} {t.valuationsUsed}
                                            </span>
                                            <span className={`text-xs ${
                                                result.usage.warningLevel === 'critical' ? 'text-red-600' :
                                                result.usage.warningLevel === 'warning' ? 'text-orange-600' :
                                                'text-gray-500'
                                            }`}>
                                                {result.usage.remaining} {t.remaining}
                                            </span>
                                        </div>

                                        {/* Warning Messages */}
                                        {result.usage.warningLevel === 'warning' && (
                                            <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                {t.warningLow}
                                            </div>
                                        )}
                                        {result.usage.warningLevel === 'critical' && (
                                            <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {t.warningCritical}
                                            </div>
                                        )}

                                        {/* Upgrade prompt for non-enterprise users */}
                                        {result.usage.planType !== 'enterprise' && result.usage.percentage >= 50 && (
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <a
                                                    href={`/${locale}/pricing`}
                                                    className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                                >
                                                    <Crown className="h-3 w-3" />
                                                    {t.upgradeForMore}
                                                </a>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
