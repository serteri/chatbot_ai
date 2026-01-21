'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'
import {
    GraduationCap,
    MapPin,
    Clock,
    DollarSign,
    Search,
    Filter,
    Globe,
    Users,
    Award,
    Home,
    ExternalLink,
    Star,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    BarChart3
} from 'lucide-react'

interface LanguageSchool {
    id: string
    name: string
    country: string
    city: string
    languages: string[]
    courseDuration: string
    pricePerWeek: number | null
    intensity: string
    accommodation: boolean
    certifications: string[]
    website?: string
    description?: string
    multiLanguage?: {
        tr?: { name: string; description: string }
        en?: { name: string; description: string }
    }
    source?: 'database' | 'web_search' | 'chain_expansion' | 'ai_generated'
    verified?: boolean
    confidence?: number
}

interface SearchResults {
    database: LanguageSchool[]
    web: LanguageSchool[]
    generated: LanguageSchool[]
    total: number
}

export default function LanguageSchoolsPage() {
    const t = useTranslations('languageSchools')

    const [schoolData, setSchoolData] = useState<LanguageSchool[]>([])
    const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
    const [filteredData, setFilteredData] = useState<LanguageSchool[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCountry, setSelectedCountry] = useState('all')
    const [selectedLanguage, setSelectedLanguage] = useState('all')
    const [priceFilter, setPriceFilter] = useState('all')
    const [durationFilter, setDurationFilter] = useState('all')
    const [accommodationFilter, setAccommodationFilter] = useState('all')
    const [sortBy, setSortBy] = useState('relevance')

    // View state
    const [selectedSchool, setSelectedSchool] = useState<LanguageSchool | null>(null)
    const [viewMode, setViewMode] = useState('grid')

    // Safe translation helpers
    const safeTranslateLanguage = (language: string): string => {
        const langMap: Record<string, string> = {
            'English': 'İngilizce',
            'Spanish': 'İspanyolca',
            'French': 'Fransızca',
            'German': 'Almanca',
            'Italian': 'İtalyanca',
            'Japanese': 'Japonca',
            'Korean': 'Korece',
            'Chinese': 'Çince',
            'Chinese (Mandarin)': 'Çince (Mandarin)',
            'Arabic': 'Arapça',
            'Portuguese': 'Portekizce',
            'Russian': 'Rusça',
            'Turkish': 'Türkçe'
        }
        return langMap[language] || language
    }

    const safeTranslateCountry = (country: string): string => {
        const countryMap: Record<string, string> = {
            'USA': 'Amerika Birleşik Devletleri',
            'UK': 'İngiltere',
            'Canada': 'Kanada',
            'Australia': 'Avustralya',
            'Ireland': 'İrlanda',
            'Malta': 'Malta',
            'New Zealand': 'Yeni Zelanda',
            'South Africa': 'Güney Afrika',
            'Germany': 'Almanya',
            'France': 'Fransa',
            'Spain': 'İspanya',
            'Italy': 'İtalya',
            'Japan': 'Japonya',
            'South Korea': 'Güney Kore',
            'China': 'Çin',
            'Singapore': 'Singapur',
            'Turkey': 'Türkiye',
            'Unknown': 'Bilinmeyen',
            'Various': 'Çeşitli'
        }
        return countryMap[country] || country
    }

    // Fetch initial data
    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await fetch('/api/language-schools')
                if (response.ok) {
                    const data = await response.json()
                    setSchoolData(data.schools || [])
                    setFilteredData(data.schools || [])
                }
            } catch (error) {
                console.error('Failed to fetch schools:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSchools()
    }, [])

    // Live search with enhanced debounce
    useEffect(() => {
        const searchTimeout = setTimeout(async () => {
            if (searchTerm.length > 2) {
                setSearching(true)
                try {
                    const response = await fetch(`/api/language-schools/search?q=${encodeURIComponent(searchTerm)}`)
                    if (response.ok) {
                        const data = await response.json()
                        setSearchResults(data.results)

                        // Combine all search results for live display
                        const allResults = [
                            ...data.results.database,
                            ...data.results.web,
                            ...data.results.generated
                        ]
                        setFilteredData(allResults)
                    }
                } catch (error) {
                    console.error('Live search failed:', error)
                } finally {
                    setSearching(false)
                }
            } else if (searchTerm.length === 0) {
                // Reset to original data when search is cleared
                setSearchResults(null)
                setFilteredData(schoolData)
            } else if (searchTerm.length <= 2 && searchTerm.length > 0) {
                // Show filtered results for 1-2 characters
                const quickFilter = schoolData.filter(school =>
                    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    school.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    school.languages.some(lang => lang.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                setFilteredData(quickFilter)
                setSearchResults(null)
            }
        }, 300) // Reduced debounce for faster response

        return () => clearTimeout(searchTimeout)
    }, [searchTerm, schoolData])

    // Apply filters
    const processedData = useMemo(() => {
        let filtered = filteredData

        // Country filter
        if (selectedCountry !== 'all') {
            filtered = filtered.filter(school => school.country === selectedCountry)
        }

        // Language filter
        if (selectedLanguage !== 'all') {
            filtered = filtered.filter(school =>
                school.languages.includes(selectedLanguage)
            )
        }

        // Price filter
        if (priceFilter !== 'all') {
            filtered = filtered.filter(school => {
                if (!school.pricePerWeek) return false
                switch (priceFilter) {
                    case 'budget': return school.pricePerWeek <= 300
                    case 'mid': return school.pricePerWeek > 300 && school.pricePerWeek <= 400
                    case 'premium': return school.pricePerWeek > 400
                    default: return true
                }
            })
        }

        // Duration filter
        if (durationFilter !== 'all') {
            filtered = filtered.filter(school => {
                const duration = school.courseDuration.toLowerCase()
                switch (durationFilter) {
                    case 'shortTerm': return duration.includes('1-') || duration.includes('2-') || duration.includes('4-') || duration.includes('8-')
                    case 'longTerm': return duration.includes('12') || duration.includes('24') || duration.includes('48') || duration.includes('52')
                    default: return true
                }
            })
        }

        // Accommodation filter
        if (accommodationFilter !== 'all') {
            filtered = filtered.filter(school => {
                switch (accommodationFilter) {
                    case 'withAccommodation': return school.accommodation === true
                    case 'withoutAccommodation': return school.accommodation === false
                    default: return true
                }
            })
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'priceLowHigh':
                    return (a.pricePerWeek || 0) - (b.pricePerWeek || 0)
                case 'priceHighLow':
                    return (b.pricePerWeek || 0) - (a.pricePerWeek || 0)
                case 'nameAZ':
                    return a.name.localeCompare(b.name)
                case 'nameZA':
                    return b.name.localeCompare(a.name)
                case 'country':
                    return a.country.localeCompare(b.country)
                default: // relevance
                    // Prioritize verified schools
                    const aScore = (a.verified ? 100 : 0) + (a.confidence || 0) * 100
                    const bScore = (b.verified ? 100 : 0) + (b.confidence || 0) * 100
                    return bScore - aScore
            }
        })

        return filtered
    }, [filteredData, selectedCountry, selectedLanguage, priceFilter, durationFilter, accommodationFilter, sortBy])

    // Get unique values for filters
    const countries = useMemo(() => {
        const uniqueCountries = [...new Set(schoolData.map(s => s.country))].sort()
        return uniqueCountries
    }, [schoolData])

    const languages = useMemo(() => {
        const allLanguages = schoolData.flatMap(s => s.languages)
        const uniqueLanguages = [...new Set(allLanguages)].sort()
        return uniqueLanguages
    }, [schoolData])

    // Statistics
    const stats = useMemo(() => {
        const prices = schoolData.filter(s => s.pricePerWeek).map(s => s.pricePerWeek!)
        return {
            total: schoolData.length,
            countries: countries.length,
            languages: languages.length,
            avgPrice: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
            minPrice: prices.length ? Math.min(...prices) : 0,
            maxPrice: prices.length ? Math.max(...prices) : 0
        }
    }, [schoolData, countries.length, languages.length])

    const clearAllFilters = () => {
        setSearchTerm('')
        setSelectedCountry('all')
        setSelectedLanguage('all')
        setPriceFilter('all')
        setDurationFilter('all')
        setAccommodationFilter('all')
        setSortBy('relevance')
        setSearchResults(null)
        setFilteredData(schoolData)
    }

    const getSourceBadge = (school: LanguageSchool) => {
        if (school.verified) {
            return <Badge variant="default" className="text-xs">{t('card.verified')}</Badge>
        } else if (school.source === 'web_search') {
            return <Badge variant="outline" className="text-xs">{t('card.foundOnline')}</Badge>
        } else if (school.source === 'ai_generated' || school.source === 'chain_expansion') {
            return <Badge variant="secondary" className="text-xs">{t('card.estimated')}</Badge>
        }
        return null
    }

    const getSchoolDisplayName = (school: LanguageSchool) => {
        return school.multiLanguage?.tr?.name || school.name
    }

    const getSchoolDescription = (school: LanguageSchool) => {
        return school.multiLanguage?.tr?.description || school.description
    }

    // Get color theme based on primary language
    const getLanguageTheme = (languages: string[]) => {
        const primaryLang = languages[0]?.toLowerCase() || ''
        const themes: Record<string, { border: string; bg: string; badge: string; icon: string }> = {
            'english': { border: 'border-l-blue-500', bg: 'bg-gradient-to-br from-blue-50 to-white', badge: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'text-blue-600' },
            'spanish': { border: 'border-l-orange-500', bg: 'bg-gradient-to-br from-orange-50 to-white', badge: 'bg-orange-100 text-orange-700 border-orange-200', icon: 'text-orange-600' },
            'french': { border: 'border-l-indigo-500', bg: 'bg-gradient-to-br from-indigo-50 to-white', badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: 'text-indigo-600' },
            'german': { border: 'border-l-yellow-500', bg: 'bg-gradient-to-br from-yellow-50 to-white', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: 'text-yellow-600' },
            'japanese': { border: 'border-l-red-500', bg: 'bg-gradient-to-br from-red-50 to-white', badge: 'bg-red-100 text-red-700 border-red-200', icon: 'text-red-600' },
            'korean': { border: 'border-l-pink-500', bg: 'bg-gradient-to-br from-pink-50 to-white', badge: 'bg-pink-100 text-pink-700 border-pink-200', icon: 'text-pink-600' },
            'mandarin chinese': { border: 'border-l-rose-500', bg: 'bg-gradient-to-br from-rose-50 to-white', badge: 'bg-rose-100 text-rose-700 border-rose-200', icon: 'text-rose-600' },
            'chinese': { border: 'border-l-rose-500', bg: 'bg-gradient-to-br from-rose-50 to-white', badge: 'bg-rose-100 text-rose-700 border-rose-200', icon: 'text-rose-600' },
            'portuguese': { border: 'border-l-green-500', bg: 'bg-gradient-to-br from-green-50 to-white', badge: 'bg-green-100 text-green-700 border-green-200', icon: 'text-green-600' },
            'italian': { border: 'border-l-emerald-500', bg: 'bg-gradient-to-br from-emerald-50 to-white', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: 'text-emerald-600' },
            'russian': { border: 'border-l-purple-500', bg: 'bg-gradient-to-br from-purple-50 to-white', badge: 'bg-purple-100 text-purple-700 border-purple-200', icon: 'text-purple-600' },
            'arabic': { border: 'border-l-teal-500', bg: 'bg-gradient-to-br from-teal-50 to-white', badge: 'bg-teal-100 text-teal-700 border-teal-200', icon: 'text-teal-600' },
            'thai': { border: 'border-l-violet-500', bg: 'bg-gradient-to-br from-violet-50 to-white', badge: 'bg-violet-100 text-violet-700 border-violet-200', icon: 'text-violet-600' },
            'vietnamese': { border: 'border-l-amber-500', bg: 'bg-gradient-to-br from-amber-50 to-white', badge: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'text-amber-600' },
            'dutch': { border: 'border-l-cyan-500', bg: 'bg-gradient-to-br from-cyan-50 to-white', badge: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: 'text-cyan-600' },
            'swedish': { border: 'border-l-sky-500', bg: 'bg-gradient-to-br from-sky-50 to-white', badge: 'bg-sky-100 text-sky-700 border-sky-200', icon: 'text-sky-600' },
            'polish': { border: 'border-l-fuchsia-500', bg: 'bg-gradient-to-br from-fuchsia-50 to-white', badge: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200', icon: 'text-fuchsia-600' },
            'greek': { border: 'border-l-lime-500', bg: 'bg-gradient-to-br from-lime-50 to-white', badge: 'bg-lime-100 text-lime-700 border-lime-200', icon: 'text-lime-600' },
            'czech': { border: 'border-l-slate-500', bg: 'bg-gradient-to-br from-slate-50 to-white', badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'text-slate-600' },
        }
        return themes[primaryLang] || { border: 'border-l-gray-400', bg: 'bg-gradient-to-br from-gray-50 to-white', badge: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'text-gray-600' }
    }

    // Get country flag emoji
    const getCountryFlag = (country: string) => {
        const flags: Record<string, string> = {
            'USA': '🇺🇸', 'UK': '🇬🇧', 'Canada': '🇨🇦', 'Australia': '🇦🇺', 'Ireland': '🇮🇪',
            'Malta': '🇲🇹', 'New Zealand': '🇳🇿', 'South Africa': '🇿🇦', 'Germany': '🇩🇪',
            'France': '🇫🇷', 'Spain': '🇪🇸', 'Italy': '🇮🇹', 'Japan': '🇯🇵', 'South Korea': '🇰🇷',
            'China': '🇨🇳', 'Taiwan': '🇹🇼', 'Singapore': '🇸🇬', 'Mexico': '🇲🇽', 'Argentina': '🇦🇷',
            'Colombia': '🇨🇴', 'Chile': '🇨🇱', 'Peru': '🇵🇪', 'Ecuador': '🇪🇨', 'Guatemala': '🇬🇹',
            'Thailand': '🇹🇭', 'Vietnam': '🇻🇳', 'Philippines': '🇵🇭', 'Portugal': '🇵🇹',
            'Netherlands': '🇳🇱', 'Sweden': '🇸🇪', 'Czech Republic': '🇨🇿', 'Poland': '🇵🇱',
            'Greece': '🇬🇷', 'Russia': '🇷🇺', 'UAE': '🇦🇪', 'Jordan': '🇯🇴', 'Egypt': '🇪🇬',
            'Brazil': '🇧🇷', 'Morocco': '🇲🇦', 'Costa Rica': '🇨🇷'
        }
        return flags[country] || '🌍'
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">{t('loading')}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <GraduationCap className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold">{t('title')}</h1>
                        <p className="text-gray-600">{t('description')}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-100">{t('stats.totalSchools')}</CardTitle>
                            <div className="text-3xl font-bold">{stats.total}</div>
                        </CardHeader>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-100">{t('stats.countries')}</CardTitle>
                            <div className="text-3xl font-bold">{stats.countries}</div>
                        </CardHeader>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-purple-100">{t('stats.languages')}</CardTitle>
                            <div className="text-3xl font-bold">{stats.languages}</div>
                        </CardHeader>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-orange-100">{t('stats.avgPrice')}</CardTitle>
                            <div className="text-3xl font-bold">${stats.avgPrice}</div>
                        </CardHeader>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-100">{t('stats.cheapest')}</CardTitle>
                            <div className="text-3xl font-bold">${stats.minPrice}</div>
                        </CardHeader>
                    </Card>
                    <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-rose-100">{t('stats.mostExpensive')}</CardTitle>
                            <div className="text-3xl font-bold">${stats.maxPrice}</div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t('search.smartSearch')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Enhanced Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-12 text-lg h-12"
                            />
                            {/* Loading indicator */}
                            {searching && (
                                <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                </div>
                            )}
                            {/* Clear button */}
                            {searchTerm.length > 0 && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}

                            {/* Live search suggestions */}
                            {searchTerm.length > 0 && searchTerm.length <= 2 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                                    <div className="p-2 text-sm text-gray-500 border-b">
                                        {searchTerm.length === 1 ? 'Yazmaya devam edin...' : 'En az 3 karakter yazın'}
                                    </div>
                                    {/* Quick suggestions */}
                                    {schoolData
                                        .filter(school =>
                                            school.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            school.city.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .slice(0, 3)
                                        .map((school, index) => (
                                            <div
                                                key={index}
                                                className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                                                onClick={() => setSearchTerm(school.name)}
                                            >
                                                <div className="font-medium">{school.name}</div>
                                                <div className="text-xs text-gray-500">{school.city}, {school.country}</div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        {/* Search Results Info */}
                        {searchResults && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-sm font-medium text-blue-900">
                                    {t('search.searchResults')}: {searchResults.total} sonuç
                                </div>
                                <div className="text-xs text-blue-700 mt-1 space-x-4">
                                    {searchResults.database.length > 0 && (
                                        <span>Database: {searchResults.database.length}</span>
                                    )}
                                    {searchResults.web.length > 0 && (
                                        <span>Web: {searchResults.web.length}</span>
                                    )}
                                    {searchResults.generated.length > 0 && (
                                        <span>Önerilen: {searchResults.generated.length}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Filter Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                            {/* Country Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">{t('filters.country')}</label>
                                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                                    <SelectTrigger className="h-9 bg-white border-gray-300">
                                        <SelectValue placeholder={t('filters.allCountries')} />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999] bg-white border shadow-lg max-h-[300px]" position="popper" sideOffset={4}>
                                        <SelectItem value="all">{t('filters.allCountries')}</SelectItem>
                                        {countries.map(country => (
                                            <SelectItem key={country} value={country}>
                                                {safeTranslateCountry(country)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Language Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">{t('filters.language')}</label>
                                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                    <SelectTrigger className="h-9 bg-white border-gray-300">
                                        <SelectValue placeholder={t('filters.allLanguages')} />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999] bg-white border shadow-lg max-h-[300px]" position="popper" sideOffset={4}>
                                        <SelectItem value="all">{t('filters.allLanguages')}</SelectItem>
                                        {languages.map(language => (
                                            <SelectItem key={language} value={language}>
                                                {safeTranslateLanguage(language)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Price Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">{t('filters.priceRange')}</label>
                                <Select value={priceFilter} onValueChange={setPriceFilter}>
                                    <SelectTrigger className="h-9 bg-white border-gray-300">
                                        <SelectValue placeholder={t('filters.allPrices')} />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999] bg-white border shadow-lg" position="popper" sideOffset={4}>
                                        <SelectItem value="all">{t('filters.allPrices')}</SelectItem>
                                        <SelectItem value="budget">{t('filters.budget')}</SelectItem>
                                        <SelectItem value="mid">{t('filters.mid')}</SelectItem>
                                        <SelectItem value="premium">{t('filters.premium')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Duration Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">{t('filters.duration')}</label>
                                <Select value={durationFilter} onValueChange={setDurationFilter}>
                                    <SelectTrigger className="h-9 bg-white border-gray-300">
                                        <SelectValue placeholder={t('filters.allDurations')} />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999] bg-white border shadow-lg" position="popper" sideOffset={4}>
                                        <SelectItem value="all">{t('filters.allDurations')}</SelectItem>
                                        <SelectItem value="shortTerm">{t('filters.shortTerm')}</SelectItem>
                                        <SelectItem value="longTerm">{t('filters.longTerm')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Accommodation Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">{t('filters.accommodation')}</label>
                                <Select value={accommodationFilter} onValueChange={setAccommodationFilter}>
                                    <SelectTrigger className="h-9 bg-white border-gray-300">
                                        <SelectValue placeholder={t('filters.allDurations')} />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999] bg-white border shadow-lg" position="popper" sideOffset={4}>
                                        <SelectItem value="all">{t('filters.allDurations')}</SelectItem>
                                        <SelectItem value="withAccommodation">{t('filters.withAccommodation')}</SelectItem>
                                        <SelectItem value="withoutAccommodation">{t('filters.withoutAccommodation')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">{t('sort.sortBy')}</label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="h-9 bg-white border-gray-300">
                                        <SelectValue placeholder={t('sort.relevance')} />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999] bg-white border shadow-lg" position="popper" sideOffset={4}>
                                        <SelectItem value="relevance">{t('sort.relevance')}</SelectItem>
                                        <SelectItem value="priceLowHigh">{t('sort.priceLowHigh')}</SelectItem>
                                        <SelectItem value="priceHighLow">{t('sort.priceHighLow')}</SelectItem>
                                        <SelectItem value="nameAZ">{t('sort.nameAZ')}</SelectItem>
                                        <SelectItem value="country">{t('sort.country')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Clear Filters Button */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-transparent">Action</label>
                                <Button
                                    variant="outline"
                                    onClick={clearAllFilters}
                                    className="h-9 w-full"
                                    size="sm"
                                >
                                    <Filter className="h-3 w-3 mr-1" />
                                    {t('clearFilters')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* View Modes and Results */}
            <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="grid">{t('viewModes.grid')}</TabsTrigger>
                        <TabsTrigger value="table">{t('viewModes.table')}</TabsTrigger>
                    </TabsList>
                    <div className="text-sm text-gray-600">
                        {processedData.length} sonuç {processedData.length !== schoolData.length && `(${schoolData.length} toplam)`}
                    </div>
                </div>

                {/* Grid View */}
                <TabsContent value="grid" className="space-y-4">
                    {processedData.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">{t('noResults')}</h3>
                                <p className="text-gray-600 mb-4">{t('noResultsDescription')}</p>
                                <Button variant="outline" onClick={clearAllFilters}>
                                    {t('clearFilters')}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {processedData.map((school) => {
                                const theme = getLanguageTheme(school.languages)
                                return (
                                    <Card
                                        key={school.id}
                                        className={`hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-l-4 ${theme.border} ${theme.bg} hover:scale-[1.02]`}
                                        onClick={() => setSelectedSchool(school)}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xl">{getCountryFlag(school.country)}</span>
                                                        <CardTitle className="text-lg leading-tight text-gray-800">
                                                            {getSchoolDisplayName(school)}
                                                        </CardTitle>
                                                    </div>
                                                    <CardDescription className="mt-1 flex items-center space-x-1">
                                                        <MapPin className={`h-3 w-3 ${theme.icon}`} />
                                                        <span className="font-medium">{school.city}, {safeTranslateCountry(school.country)}</span>
                                                    </CardDescription>
                                                </div>
                                                <div className="flex flex-col items-end space-y-1">
                                                    {school.pricePerWeek && (
                                                        <Badge className={`text-sm font-bold ${theme.badge} border`}>
                                                            ${school.pricePerWeek}/{t('card.week')}
                                                        </Badge>
                                                    )}
                                                    {getSourceBadge(school)}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {/* Languages */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {school.languages.slice(0, 3).map(lang => (
                                                    <Badge key={lang} className={`text-xs ${theme.badge} border font-medium`}>
                                                        {safeTranslateLanguage(lang)}
                                                    </Badge>
                                                ))}
                                                {school.languages.length > 3 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{school.languages.length - 3}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Course Info */}
                                            <div className="space-y-2 text-sm bg-white/60 rounded-lg p-3">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className={`h-4 w-4 ${theme.icon}`} />
                                                    <span className="font-medium">{school.courseDuration}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <BarChart3 className={`h-4 w-4 ${theme.icon}`} />
                                                    <span>{school.intensity}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Home className={`h-4 w-4 ${theme.icon}`} />
                                                    <span>{school.accommodation ? (
                                                        <span className="text-green-600 font-medium">{t('card.available')}</span>
                                                    ) : (
                                                        <span className="text-gray-400">{t('card.notAvailable')}</span>
                                                    )}</span>
                                                </div>
                                            </div>

                                            {/* Certifications */}
                                            {school.certifications.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <div className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                                        <Award className={`h-3 w-3 ${theme.icon}`} />
                                                        {t('card.certifications')}:
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {school.certifications.slice(0, 3).map(cert => (
                                                            <Badge key={cert} variant="outline" className="text-xs bg-white/80 font-medium">
                                                                {cert}
                                                            </Badge>
                                                        ))}
                                                        {school.certifications.length > 3 && (
                                                            <span className="text-xs text-gray-500 font-medium">+{school.certifications.length - 3}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex space-x-2 pt-2">
                                                <Button size="sm" className={`flex-1 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-md`}>
                                                    {t('card.moreInfo')}
                                                </Button>
                                                {school.website && (
                                                    <Button size="sm" variant="outline" className="border-2 hover:bg-gray-50" asChild onClick={(e) => e.stopPropagation()}>
                                                        <a href={school.website} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Table View */}
                <TabsContent value="table">
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b bg-gray-50">
                                    <tr className="text-left">
                                        <th className="p-4 font-medium">{t('table.school')}</th>
                                        <th className="p-4 font-medium">{t('table.location')}</th>
                                        <th className="p-4 font-medium">{t('table.languages')}</th>
                                        <th className="p-4 font-medium">{t('table.pricePerWeek')}</th>
                                        <th className="p-4 font-medium">{t('table.duration')}</th>
                                        <th className="p-4 font-medium">{t('table.accommodation')}</th>
                                        <th className="p-4 font-medium">{t('table.actions')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {processedData.map((school) => (
                                        <tr key={school.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-medium">{getSchoolDisplayName(school)}</div>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        {getSourceBadge(school)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="h-3 w-3 text-gray-500" />
                                                    <span>{school.city}, {safeTranslateCountry(school.country)}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {school.languages.slice(0, 2).map(lang => (
                                                        <Badge key={lang} variant="secondary" className="text-xs">
                                                            {safeTranslateLanguage(lang)}
                                                        </Badge>
                                                    ))}
                                                    {school.languages.length > 2 && (
                                                        <span className="text-xs text-gray-500">+{school.languages.length - 2}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {school.pricePerWeek ? (
                                                    <div className="font-medium">${school.pricePerWeek}</div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-600">{school.courseDuration}</td>
                                            <td className="p-4">
                                                {school.accommodation ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedSchool(school)}
                                                    >
                                                        {t('table.viewDetails')}
                                                    </Button>
                                                    {school.website && (
                                                        <Button size="sm" variant="outline" asChild>
                                                            <a href={school.website} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="h-3 w-3" />
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
            </Tabs>

            {/* School Details Modal */}
            {selectedSchool && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                     onClick={() => setSelectedSchool(null)}>
                    <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{getSchoolDisplayName(selectedSchool)}</CardTitle>
                                    <CardDescription className="mt-2 flex items-center space-x-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{selectedSchool.city}, {safeTranslateCountry(selectedSchool.country)}</span>
                                        {getSourceBadge(selectedSchool)}
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setSelectedSchool(null)}>
                                    ✕
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Key Info Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-600">{t('modal.pricePerWeek')}</div>
                                    <div className="text-xl font-bold">
                                        {selectedSchool.pricePerWeek ? `$${selectedSchool.pricePerWeek}` : t('modal.contactForDetails')}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-600">{t('modal.courseDuration')}</div>
                                    <div className="text-lg font-semibold">{selectedSchool.courseDuration}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-600">{t('modal.classIntensity')}</div>
                                    <div className="text-lg font-semibold">{selectedSchool.intensity}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-600">{t('modal.accommodationOptions')}</div>
                                    <div className="text-lg font-semibold">
                                        {selectedSchool.accommodation ? t('card.available') : t('card.notAvailable')}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {getSchoolDescription(selectedSchool) && (
                                <div className="space-y-2">
                                    <div className="text-lg font-semibold">{t('modal.overview')}</div>
                                    <p className="text-gray-700">{getSchoolDescription(selectedSchool)}</p>
                                </div>
                            )}

                            {/* Languages */}
                            <div className="space-y-2">
                                <div className="text-lg font-semibold">{t('modal.availableLanguages')}</div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedSchool.languages.map(language => (
                                        <Badge key={language} variant="default">
                                            {safeTranslateLanguage(language)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Certifications */}
                            {selectedSchool.certifications.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-lg font-semibold">{t('modal.certificationPrograms')}</div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {selectedSchool.certifications.map(cert => (
                                            <Badge key={cert} variant="outline" className="justify-center py-2">
                                                <Award className="h-3 w-3 mr-1" />
                                                {cert}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex space-x-3 pt-4 border-t">
                                {selectedSchool.website && (
                                    <Button asChild className="flex-1">
                                        <a href={selectedSchool.website} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            {t('modal.officialWebsite')}
                                        </a>
                                    </Button>
                                )}
                                <Button variant="outline" onClick={() => setSelectedSchool(null)}>
                                    {t('modal.close')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}