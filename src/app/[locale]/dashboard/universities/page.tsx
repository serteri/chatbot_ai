'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
    Search, Filter, MapPin, Heart, ExternalLink, Loader2,
    TrendingUp, BookOpen, DollarSign, GraduationCap,
    Building2, Award, GitCompare
} from 'lucide-react'

interface University {
    id: string
    name: string
    country: string
    city?: string
    ranking?: number
    tuitionMin?: number
    tuitionMax?: number
    programs: string[]
    type?: string
    website?: string
    description?: string
    requirements?: any
}

// GÜNCELLENDİ: Veritabanı değeri (value) ile Çeviri anahtarı (key) eşleşmesi
const STUDY_FIELDS_MAPPING = [
    { value: 'Computer Science', key: 'computerScience' },
    { value: 'Engineering', key: 'engineering' },
    { value: 'Medicine', key: 'medicine' },
    { value: 'Business Administration', key: 'business' },
    { value: 'Economics', key: 'economics' },
    { value: 'Law', key: 'law' },
    { value: 'Psychology', key: 'psychology' },
    { value: 'Biology', key: 'biology' },
    { value: 'Architecture', key: 'architecture' },
    { value: 'Arts', key: 'arts' },
    { value: 'Social Sciences', key: 'socialSciences' }
]

export default function UniversitiesPage({ params }: { params: Promise<{ locale: string }> }) {
    const resolvedParams = React.use(params)
    const t = useTranslations('Universities')

    // Get country list with translations
    const getCountries = () => [
        { code: "all", name: t('countries.all'), flag: "🌍" },
        { code: "AF", name: t('countries.afghanistan'), flag: "🇦🇫" },
        { code: "AL", name: t('countries.albania'), flag: "🇦🇱" },
        { code: "DZ", name: t('countries.algeria'), flag: "🇩🇿" },
        { code: "AR", name: t('countries.argentina'), flag: "🇦🇷" },
        { code: "AM", name: t('countries.armenia'), flag: "🇦🇲" },
        { code: "AU", name: t('countries.australia'), flag: "🇦🇺" },
        { code: "AT", name: t('countries.austria'), flag: "🇦🇹" },
        { code: "AZ", name: t('countries.azerbaijan'), flag: "🇦🇿" },
        { code: "BH", name: t('countries.bahrain'), flag: "🇧🇭" },
        { code: "BD", name: t('countries.bangladesh'), flag: "🇧🇩" },
        { code: "BY", name: t('countries.belarus'), flag: "🇧🇾" },
        { code: "BE", name: t('countries.belgium'), flag: "🇧🇪" },
        { code: "BO", name: t('countries.bolivia'), flag: "🇧🇴" },
        { code: "BA", name: t('countries.bosnia'), flag: "🇧🇦" },
        { code: "BR", name: t('countries.brazil'), flag: "🇧🇷" },
        { code: "BG", name: t('countries.bulgaria'), flag: "🇧🇬" },
        { code: "CA", name: t('countries.canada'), flag: "🇨🇦" },
        { code: "CL", name: t('countries.chile'), flag: "🇨🇱" },
        { code: "CN", name: t('countries.china'), flag: "🇨🇳" },
        { code: "CO", name: t('countries.colombia'), flag: "🇨🇴" },
        { code: "CR", name: t('countries.costarica'), flag: "🇨🇷" },
        { code: "HR", name: t('countries.croatia'), flag: "🇭🇷" },
        { code: "CY", name: t('countries.cyprus'), flag: "🇨🇾" },
        { code: "CZ", name: t('countries.czechrepublic'), flag: "🇨🇿" },
        { code: "DK", name: t('countries.denmark'), flag: "🇩🇰" },
        { code: "EC", name: t('countries.ecuador'), flag: "🇪🇨" },
        { code: "EG", name: t('countries.egypt'), flag: "🇪🇬" },
        { code: "EE", name: t('countries.estonia'), flag: "🇪🇪" },
        { code: "FI", name: t('countries.finland'), flag: "🇫🇮" },
        { code: "FR", name: t('countries.france'), flag: "🇫🇷" },
        { code: "GE", name: t('countries.georgia'), flag: "🇬🇪" },
        { code: "DE", name: t('countries.germany'), flag: "🇩🇪" },
        { code: "GH", name: t('countries.ghana'), flag: "🇬🇭" },
        { code: "GR", name: t('countries.greece'), flag: "🇬🇷" },
        { code: "HU", name: t('countries.hungary'), flag: "🇭🇺" },
        { code: "IS", name: t('countries.iceland'), flag: "🇮🇸" },
        { code: "IN", name: t('countries.india'), flag: "🇮🇳" },
        { code: "ID", name: t('countries.indonesia'), flag: "🇮🇩" },
        { code: "IR", name: t('countries.iran'), flag: "🇮🇷" },
        { code: "IQ", name: t('countries.iraq'), flag: "🇮🇶" },
        { code: "IE", name: t('countries.ireland'), flag: "🇮🇪" },
        { code: "IL", name: t('countries.israel'), flag: "🇮🇱" },
        { code: "IT", name: t('countries.italy'), flag: "🇮🇹" },
        { code: "JP", name: t('countries.japan'), flag: "🇯🇵" },
        { code: "JO", name: t('countries.jordan'), flag: "🇯🇴" },
        { code: "KZ", name: t('countries.kazakhstan'), flag: "🇰🇿" },
        { code: "KE", name: t('countries.kenya'), flag: "🇰🇪" },
        { code: "KW", name: t('countries.kuwait'), flag: "🇰🇼" },
        { code: "KG", name: t('countries.kyrgyzstan'), flag: "🇰🇬" },
        { code: "LV", name: t('countries.latvia'), flag: "🇱🇻" },
        { code: "LB", name: t('countries.lebanon'), flag: "🇱🇧" },
        { code: "LT", name: t('countries.lithuania'), flag: "🇱🇹" },
        { code: "LU", name: t('countries.luxembourg'), flag: "🇱🇺" },
        { code: "MY", name: t('countries.malaysia'), flag: "🇲🇾" },
        { code: "MT", name: t('countries.malta'), flag: "🇲🇹" },
        { code: "MX", name: t('countries.mexico'), flag: "🇲🇽" },
        { code: "MD", name: t('countries.moldova'), flag: "🇲🇩" },
        { code: "ME", name: t('countries.montenegro'), flag: "🇲🇪" },
        { code: "MA", name: t('countries.morocco'), flag: "🇲🇦" },
        { code: "NL", name: t('countries.netherlands'), flag: "🇳🇱" },
        { code: "NZ", name: t('countries.newzealand'), flag: "🇳🇿" },
        { code: "NG", name: t('countries.nigeria'), flag: "🇳🇬" },
        { code: "MK", name: t('countries.northmacedonia'), flag: "🇲🇰" },
        { code: "NO", name: t('countries.norway'), flag: "🇳🇴" },
        { code: "OM", name: t('countries.oman'), flag: "🇴🇲" },
        { code: "PK", name: t('countries.pakistan'), flag: "🇵🇰" },
        { code: "PE", name: t('countries.peru'), flag: "🇵🇪" },
        { code: "PH", name: t('countries.philippines'), flag: "🇵🇭" },
        { code: "PL", name: t('countries.poland'), flag: "🇵🇱" },
        { code: "PT", name: t('countries.portugal'), flag: "🇵🇹" },
        { code: "QA", name: t('countries.qatar'), flag: "🇶🇦" },
        { code: "RO", name: t('countries.romania'), flag: "🇷🇴" },
        { code: "RU", name: t('countries.russia'), flag: "🇷🇺" },
        { code: "SA", name: t('countries.saudiarabia'), flag: "🇸🇦" },
        { code: "RS", name: t('countries.serbia'), flag: "🇷🇸" },
        { code: "SG", name: t('countries.singapore'), flag: "🇸🇬" },
        { code: "SK", name: t('countries.slovakia'), flag: "🇸🇰" },
        { code: "SI", name: t('countries.slovenia'), flag: "🇸🇮" },
        { code: "ZA", name: t('countries.southafrica'), flag: "🇿🇦" },
        { code: "KR", name: t('countries.southkorea'), flag: "🇰🇷" },
        { code: "ES", name: t('countries.spain'), flag: "🇪🇸" },
        { code: "LK", name: t('countries.srilanka'), flag: "🇱🇰" },
        { code: "SE", name: t('countries.sweden'), flag: "🇸🇪" },
        { code: "CH", name: t('countries.switzerland'), flag: "🇨🇭" },
        { code: "TJ", name: t('countries.tajikistan'), flag: "🇹🇯" },
        { code: "TH", name: t('countries.thailand'), flag: "🇹🇭" },
        { code: "TN", name: t('countries.tunisia'), flag: "🇹🇳" },
        { code: "TR", name: t('countries.turkey'), flag: "🇹🇷" },
        { code: "TM", name: t('countries.turkmenistan'), flag: "🇹🇲" },
        { code: "UA", name: t('countries.ukraine'), flag: "🇺🇦" },
        { code: "AE", name: t('countries.uae'), flag: "🇦🇪" },
        { code: "GB", name: t('countries.uk'), flag: "🇬🇧" },
        { code: "US", name: t('countries.usa'), flag: "🇺🇸" },
        { code: "UY", name: t('countries.uruguay'), flag: "🇺🇾" },
        { code: "UZ", name: t('countries.uzbekistan'), flag: "🇺🇿" },
        { code: "VE", name: t('countries.venezuela'), flag: "🇻🇪" },
        { code: "VN", name: t('countries.vietnam'), flag: "🇻🇳" },
        { code: "ZW", name: t('countries.zimbabwe'), flag: "🇿🇼" }
    ]

    // State Management
    const [universities, setUniversities] = useState<University[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState({
        country: 'all',
        type: 'all',
        field: 'all',
        rankingMin: '',
        rankingMax: '',
        tuitionMin: '',
        tuitionMax: ''
    })
    const [sortBy, setSortBy] = useState('ranking')
    const [selectedUniversities, setSelectedUniversities] = useState<University[]>([])
    const [favorites, setFavorites] = useState<string[]>([])
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    })

    // Modal States
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)

    // Simple debounce
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])



    useEffect(() => {
        fetchUniversities()
    }, [debouncedSearch, filters, pagination.page, sortBy])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedFavorites = localStorage.getItem('university-favorites')
            if (savedFavorites) {
                setFavorites(JSON.parse(savedFavorites))
            }
        }
    }, [])

    const fetchUniversities = async () => {
        setLoading(true)
        try {
            const searchParams = new URLSearchParams()
            searchParams.append('page', pagination.page.toString())
            searchParams.append('limit', pagination.limit.toString())
            searchParams.append('sort', sortBy)

            if (debouncedSearch) {
                searchParams.append('search', debouncedSearch)
            }

            if (filters.country !== 'all') {
                searchParams.append('country', filters.country)
            }

            if (filters.type !== 'all') {
                searchParams.append('type', filters.type)
            }

            if (filters.field !== 'all') {
                searchParams.append('field', filters.field)
            }

            if (filters.rankingMin) {
                searchParams.append('rankingMin', filters.rankingMin)
            }

            if (filters.rankingMax) {
                searchParams.append('rankingMax', filters.rankingMax)
            }

            if (filters.tuitionMin) {
                searchParams.append('tuitionMin', filters.tuitionMin)
            }

            if (filters.tuitionMax) {
                searchParams.append('tuitionMax', filters.tuitionMax)
            }

            const url = `/api/universities/search?${searchParams.toString()}`
            const res = await fetch(url)

            if (!res.ok) {
                throw new Error(`API returned ${res.status}`)
            }

            const data = await res.json()

            if (data.success && Array.isArray(data.data)) {
                setUniversities(data.data)

                if (data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: data.pagination.total || 0,
                        totalPages: data.pagination.totalPages || 1,
                        hasNext: data.pagination.hasNext || false,
                        hasPrev: data.pagination.hasPrev || false
                    }))
                }
            } else {
                setUniversities([])
                setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }))
            }

        } catch (error) {
            console.error('❌ Fetch failed:', error)
            toast.error(t('results.loadError') || 'Failed to load universities')
            setUniversities([])
            setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }))
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const clearFilters = () => {
        setFilters({
            country: 'all',
            type: 'all',
            field: 'all',
            rankingMin: '',
            rankingMax: '',
            tuitionMin: '',
            tuitionMax: ''
        })
        setSearchQuery('')
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const toggleFavorite = (universityId: string) => {
        const newFavorites = favorites.includes(universityId)
            ? favorites.filter(id => id !== universityId)
            : [...favorites, universityId]

        setFavorites(newFavorites)

        if (typeof window !== 'undefined') {
            localStorage.setItem('university-favorites', JSON.stringify(newFavorites))
        }

        toast.success(
            favorites.includes(universityId)
                ? t('results.removeFromFavorites')
                : t('results.addToFavorites')
        )
    }

    const toggleCompareSelection = (university: University) => {
        if (selectedUniversities.find(u => u.id === university.id)) {
            setSelectedUniversities(prev => prev.filter(u => u.id !== university.id))
        } else if (selectedUniversities.length < 3) {
            setSelectedUniversities(prev => [...prev, university])
        } else {
            toast.error(t('compare.maxUniversities'))
        }
    }

    const handleDetailClick = (university: University) => {
        setSelectedUniversity(university)
        setIsDetailModalOpen(true)
    }

    const formatTuition = (min?: number, max?: number) => {
        if (!min && !max) return t('results.contactForFees')
        if (min === 0 && max === 0) return t('results.free')
        if (min === max) return `$${min?.toLocaleString()}${t('results.perYear')}`
        return `$${min?.toLocaleString()} - $${max?.toLocaleString()}${t('results.perYear')}`
    }

    const getRankingBadge = (ranking?: number) => {
        if (!ranking) return null

        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline'

        if (ranking <= 50) {
            variant = 'default'
        } else if (ranking <= 200) {
            variant = 'secondary'
        }

        return (
            <Badge variant={variant} className="flex items-center gap-1">
                <Award className="w-3 h-3" /> #{ranking}
            </Badge>
        )
    }

    const getUniversityWebsite = (university: University) => {
        return university.website || `https://www.${university.name.toLowerCase().replace(/\s+/g, '')}.edu`
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-blue-600" />
                        {t('title')}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Search & Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            {t('filters.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white"
                            />
                        </div>

                        {/* Basic Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>{t('filters.country')}</Label>
                                <Select
                                    value={filters.country}
                                    onValueChange={(value) => handleFilterChange('country', value)}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder={t('filters.selectCountry')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 shadow-xl z-[999] max-h-60 overflow-y-auto">
                                        {getCountries().map((country) => (
                                            <SelectItem key={country.code} value={country.code}>
                                                <div className="flex items-center gap-2">
                                                    <span>{country.flag}</span>
                                                    <span>{country.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>{t('filters.universityType')}</Label>
                                <Select
                                    value={filters.type}
                                    onValueChange={(value) => handleFilterChange('type', value)}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder={t('filters.selectType')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 shadow-xl z-[999]">
                                        <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                                        <SelectItem value="Public">{t('filters.public')}</SelectItem>
                                        <SelectItem value="Private">{t('filters.private')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>{t('filters.studyField')}</Label>
                                <Select
                                    value={filters.field}
                                    onValueChange={(value) => handleFilterChange('field', value)}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder={t('filters.selectField')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 shadow-xl z-[999] max-h-60 overflow-y-auto">
                                        <SelectItem value="all">{t('filters.allFields')}</SelectItem>
                                        {STUDY_FIELDS_MAPPING.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {/* ÇEVİRİ KISMI DÜZELTİLDİ: fields.key */}
                                                {t(`fields.${item.key}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Ranking Range */}
                            <div>
                                <Label className="mb-2 block">{t('filters.rankingRange')}</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        value={filters.rankingMin}
                                        onChange={(e) => handleFilterChange('rankingMin', e.target.value)}
                                        placeholder={t('filters.rankingFrom')}
                                        min="1"
                                        max="1000"
                                        className="bg-white"
                                    />
                                    <Input
                                        type="number"
                                        value={filters.rankingMax}
                                        onChange={(e) => handleFilterChange('rankingMax', e.target.value)}
                                        placeholder={t('filters.rankingTo')}
                                        min="1"
                                        max="1000"
                                        className="bg-white"
                                    />
                                </div>
                            </div>

                            {/* Tuition Range */}
                            <div>
                                <Label className="mb-2 block">{t('filters.tuitionRange')}</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        value={filters.tuitionMin}
                                        onChange={(e) => handleFilterChange('tuitionMin', e.target.value)}
                                        placeholder={t('filters.tuitionMin')}
                                        min="0"
                                        max="100000"
                                        className="bg-white"
                                    />
                                    <Input
                                        type="number"
                                        value={filters.tuitionMax}
                                        onChange={(e) => handleFilterChange('tuitionMax', e.target.value)}
                                        placeholder={t('filters.tuitionMax')}
                                        min="0"
                                        max="100000"
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-2">
                            <Button onClick={clearFilters} variant="outline" className="bg-white">
                                {t('filters.clearFilters')}
                            </Button>

                            <div className="flex gap-2">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-48 bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 shadow-xl z-[999]">
                                        <SelectItem value="ranking">{t('filters.sortBy')}</SelectItem>
                                        <SelectItem value="name">{t('filters.sortByName')}</SelectItem>
                                        <SelectItem value="country">{t('filters.sortByCountry')}</SelectItem>
                                        <SelectItem value="tuition">{t('filters.sortByTuition')}</SelectItem>
                                    </SelectContent>
                                </Select>

                                {selectedUniversities.length > 1 && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsCompareModalOpen(true)}
                                        className="flex items-center gap-2 bg-white"
                                    >
                                        <GitCompare className="w-4 h-4" />
                                        {t('filters.compare')} ({selectedUniversities.length})
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {loading ? t('results.loading') : `${pagination.total || 0} ${t('results.found')}`}
                    </h2>
                </div>

                {/* University Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : universities && universities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {universities.map((university) => (
                            <Card key={university.id} className="hover:shadow-lg transition-all duration-200 group bg-white">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg leading-tight group-hover:text-blue-600 transition-colors">
                                                {university.name}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <MapPin className="w-4 h-4" />
                                                {university.city}, {university.country}
                                            </CardDescription>
                                        </div>

                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => toggleFavorite(university.id)}
                                            >
                                                <Heart className={`h-4 w-4 ${
                                                    favorites.includes(university.id)
                                                        ? 'fill-red-500 text-red-500'
                                                        : 'text-gray-400'
                                                }`} />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => toggleCompareSelection(university)}
                                            >
                                                <GitCompare className={`h-4 w-4 ${
                                                    selectedUniversities.find(u => u.id === university.id)
                                                        ? 'text-blue-600'
                                                        : 'text-gray-400'
                                                }`} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Ranking & Type */}
                                    <div className="flex justify-between items-center">
                                        {getRankingBadge(university.ranking)}
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Building2 className="w-3 h-3" />
                                            {university.type || 'University'}
                                        </Badge>
                                    </div>

                                    {/* Tuition */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <span className="font-medium text-green-600">
                      {formatTuition(university.tuitionMin, university.tuitionMax)}
                    </span>
                                    </div>

                                    {/* Programs (Preview) */}
                                    <div>
                                        <div className="flex flex-wrap gap-1">
                                            {university.programs.slice(0, 3).map((program) => (
                                                <Badge key={program} variant="secondary" className="text-xs">
                                                    {program}
                                                </Badge>
                                            ))}
                                            {university.programs.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{university.programs.length - 3} {t('results.more')}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDetailClick(university)}
                                            className="flex-1"
                                        >
                                            {t('results.viewDetails')}
                                        </Button>
                                        <Button size="sm" asChild>
                                            <a
                                                href={getUniversityWebsite(university)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                {t('results.visit')}
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t('results.noResults')}</h3>
                        <p className="text-gray-600 mb-4">
                            {t('results.noResultsDesc')}
                        </p>
                        <Button onClick={clearFilters} variant="outline" className="bg-white">
                            {t('filters.clearFilters')}
                        </Button>
                    </div>
                )}

                {/* Pagination */}
                {!loading && universities && universities.length > 0 && (
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            disabled={!pagination.hasPrev}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            className="bg-white"
                        >
                            {t('pagination.previous')}
                        </Button>
                        <div className="flex items-center px-4">
                            {pagination.page} / {pagination.totalPages || 1}
                        </div>
                        <Button
                            variant="outline"
                            disabled={!pagination.hasNext}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            className="bg-white"
                        >
                            {t('pagination.next')}
                        </Button>
                    </div>
                )}

                {/* University Detail Modal */}
                <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
                        {selectedUniversity && (
                            <>
                                <DialogHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <DialogTitle className="text-2xl font-bold mb-2 pr-8">
                                                {selectedUniversity.name}
                                            </DialogTitle>
                                            <DialogDescription className="text-base flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                {selectedUniversity.city}, {selectedUniversity.country}
                                            </DialogDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            {getRankingBadge(selectedUniversity.ranking)}
                                            <Badge variant="outline">
                                                {selectedUniversity.type}
                                            </Badge>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="space-y-6">
                                    {/* Quick Info */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                            <div className="font-semibold">#{selectedUniversity.ranking || 'N/A'}</div>
                                            <div className="text-xs text-gray-600">{t('results.worldRanking')}</div>
                                        </div>

                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                            <div className="font-semibold text-sm">
                                                {formatTuition(selectedUniversity.tuitionMin, selectedUniversity.tuitionMax)}
                                            </div>
                                            <div className="text-xs text-gray-600">{t('results.annualTuition')}</div>
                                        </div>

                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <BookOpen className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                            <div className="font-semibold">{selectedUniversity.programs.length}</div>
                                            <div className="text-xs text-gray-600">{t('results.programs')}</div>
                                        </div>

                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <Building2 className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                                            <div className="font-semibold">{selectedUniversity.type}</div>
                                            <div className="text-xs text-gray-600">{t('results.universityType')}</div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {selectedUniversity.description && (
                                        <div>
                                            <h4 className="font-semibold mb-2">{t('modal.about')}</h4>
                                            <p className="text-gray-700">{selectedUniversity.description}</p>
                                        </div>
                                    )}

                                    {/* Programs */}
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" />
                                            {t('modal.academicPrograms')} ({selectedUniversity.programs.length})
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {selectedUniversity.programs.map((program) => (
                                                <Badge key={program} variant="secondary" className="justify-center">
                                                    {program}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="flex gap-3 pt-4">
                                    <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                                        {t('modal.close')}
                                    </Button>
                                    <Button
                                        onClick={() => toggleFavorite(selectedUniversity.id)}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <Heart className={`w-4 h-4 ${
                                            favorites.includes(selectedUniversity.id)
                                                ? 'fill-red-500 text-red-500'
                                                : ''
                                        }`} />
                                        {favorites.includes(selectedUniversity.id)
                                            ? t('results.removeFromFavorites')
                                            : t('results.addToFavorites')
                                        }
                                    </Button>
                                    <Button asChild>
                                        <a
                                            href={getUniversityWebsite(selectedUniversity)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            {t('modal.visitWebsite')}
                                        </a>
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Compare Modal */}
                <Dialog open={isCompareModalOpen} onOpenChange={setIsCompareModalOpen}>
                    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto bg-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <GitCompare className="w-5 h-5" />
                                {t('compare.title')} ({selectedUniversities.length})
                            </DialogTitle>
                        </DialogHeader>

                        {selectedUniversities.length >= 2 && (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-semibold">{t('compare.feature')}</th>
                                        {selectedUniversities.map(university => (
                                            <th key={university.id} className="text-center p-3 min-w-48">
                                                <div className="font-semibold">{university.name}</div>
                                                <div className="text-sm text-gray-600">{university.country}</div>
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr className="border-b">
                                        <td className="p-3 font-medium">{t('results.worldRanking')}</td>
                                        {selectedUniversities.map(university => (
                                            <td key={university.id} className="text-center p-3">
                                                #{university.ranking || 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 font-medium">{t('results.universityType')}</td>
                                        {selectedUniversities.map(university => (
                                            <td key={university.id} className="text-center p-3">
                                                {university.type}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 font-medium">{t('results.annualTuition')}</td>
                                        {selectedUniversities.map(university => (
                                            <td key={university.id} className="text-center p-3">
                                                {formatTuition(university.tuitionMin, university.tuitionMax)}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 font-medium">{t('results.programs')}</td>
                                        {selectedUniversities.map(university => (
                                            <td key={university.id} className="text-center p-3">
                                                {university.programs.length}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-medium">Website</td>
                                        {selectedUniversities.map(university => (
                                            <td key={university.id} className="text-center p-3">
                                                <Button size="sm" variant="outline" asChild>
                                                    <a
                                                        href={getUniversityWebsite(university)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        {t('results.visit')}
                                                    </a>
                                                </Button>
                                            </td>
                                        ))}
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCompareModalOpen(false)}>
                                {t('modal.close')}
                            </Button>
                            <Button onClick={() => setSelectedUniversities([])}>
                                {t('compare.clearSelection')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}