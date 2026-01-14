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
import { Calculator, TrendingUp, TrendingDown, Minus, Loader2, Sparkles, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

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
        reasoning: 'Değerlendirme'
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
        reasoning: 'Analysis'
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
        reasoning: 'Analyse'
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
        reasoning: 'Analyse'
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
        reasoning: 'Análisis'
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

    const t = translations[locale as keyof typeof translations] || translations.en

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

            if (!response.ok) throw new Error('Failed to get valuation')

            const data = await response.json()
            setResult(data)
        } catch (error) {
            console.error(error)
            toast.error('Failed to get valuation')
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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="suburb">{t.suburb}</Label>
                            <Input
                                id="suburb"
                                placeholder="e.g., Albion, Brisbane"
                                value={formData.suburb}
                                onChange={(e) => setFormData(prev => ({ ...prev, suburb: e.target.value }))}
                                className="mt-1"
                            />
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
                                <SelectContent>
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
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
