'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Search, Loader2, ArrowLeft, Globe, Users, DollarSign, GraduationCap, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface University {
    id: string
    name: string
    country: string
    city: string
    ranking?: number | null
    logo?: string | null
    type: string
    tuitionFee?: string | null
    studentCount?: number | null
    internationalStudents?: number | null
    programs?: string[]
    website?: string | null
}

export default function NewApplicationPage({ params }: { params: { locale: string } }) {
    const t = useTranslations('ApplicationTracker')
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
    const [universities, setUniversities] = useState<University[]>([])
    const [searchResults, setSearchResults] = useState<University[]>([])
    const [showResults, setShowResults] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const searchContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [formData, setFormData] = useState({
        program: '',
        degree: "Bachelor's",
        intake: '',
        deadline: '',
        notes: ''
    })

    const debouncedSearch = useDebounce(searchQuery, 300)

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    useEffect(() => {
        fetchUniversities()
    }, [])

    useEffect(() => {
        if (debouncedSearch && !selectedUniversity) {
            searchUniversities(debouncedSearch)
        } else if (!debouncedSearch) {
            setSearchResults([])
            setShowResults(false)
        }
    }, [debouncedSearch, selectedUniversity])

    const fetchUniversities = async () => {
        try {
            const res = await fetch('/api/universities?limit=100')
            if (res.ok) {
                const data = await res.json()
                setUniversities(data.universities || [])
            }
        } catch (error) {
            console.error('Error fetching universities:', error)
        }
    }

    const searchUniversities = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([])
            setShowResults(false)
            return
        }

        setIsSearching(true)
        try {
            const res = await fetch(`/api/universities?search=${encodeURIComponent(query)}&limit=10`)
            if (res.ok) {
                const data = await res.json()
                setSearchResults(data.universities || [])
                setShowResults(true)
            }
        } catch (error) {
            console.error('Error searching universities:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const selectUniversity = (uni: University) => {
        setSelectedUniversity(uni)
        setSearchQuery(uni.name)
        setSearchResults([])
        setShowResults(false)
        // Blur the input
        if (inputRef.current) {
            inputRef.current.blur()
        }
    }

    const clearSelection = () => {
        setSelectedUniversity(null)
        setSearchQuery('')
        setSearchResults([])
        setShowResults(false)
        // Focus back to input
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)

        // Clear selection if user is typing and it doesn't match selected university
        if (selectedUniversity && value !== selectedUniversity.name) {
            setSelectedUniversity(null)
        }
    }

    const handleInputFocus = () => {
        if (searchQuery && !selectedUniversity) {
            setShowResults(true)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedUniversity) {
            toast.error(t('selectUniversity'))
            return
        }

        if (!formData.program || !formData.intake) {
            toast.error(t('fillRequired'))
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/student/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    universityId: selectedUniversity.id,
                    ...formData
                })
            })

            if (res.ok) {
                toast.success(t('addSuccess'))
                router.push(`/${params.locale}/dashboard/student/applications`)
            } else {
                toast.error(t('addError'))
            }
        } catch (error) {
            toast.error(t('addError'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/${params.locale}/dashboard/student/applications`)}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('backToApplications')}
                    </Button>
                    <h1 className="text-3xl font-bold">{t('addNew')}</h1>
                    <p className="text-gray-600">{t('addDescription')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* University Search */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('searchUniversity')}</CardTitle>
                            <CardDescription>{t('searchUniversityDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div ref={searchContainerRef} className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        ref={inputRef}
                                        type="text"
                                        placeholder={t('searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={handleInputChange}
                                        onFocus={handleInputFocus}
                                        className="pl-10 pr-10"
                                        disabled={!!selectedUniversity}
                                    />
                                    {selectedUniversity && (
                                        <button
                                            type="button"
                                            onClick={clearSelection}
                                            className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Loading indicator */}
                                {isSearching && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm text-gray-600">Searching...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Search Results Dropdown */}
                                {showResults && searchResults.length > 0 && !isSearching && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                                        {searchResults.map((uni) => (
                                            <button
                                                key={uni.id}
                                                type="button"
                                                onClick={() => selectUniversity(uni)}
                                                className="w-full p-4 hover:bg-gray-50 border-b last:border-b-0 text-left transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {uni.logo && (
                                                        <img
                                                            src={uni.logo}
                                                            alt={uni.name}
                                                            className="w-12 h-12 object-contain"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-sm">{uni.name}</h4>
                                                        <p className="text-xs text-gray-600">
                                                            {uni.city}, {uni.country}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {uni.ranking && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    #{uni.ranking}
                                                                </Badge>
                                                            )}
                                                            <span className="text-xs text-gray-500">{uni.type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* No results */}
                                {showResults && searchResults.length === 0 && searchQuery && !isSearching && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg p-4">
                                        <div className="text-center text-gray-500 text-sm">
                                            No universities found for "{searchQuery}"
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Selected University Card */}
                            {selectedUniversity && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-4">
                                        {selectedUniversity.logo && (
                                            <img
                                                src={selectedUniversity.logo}
                                                alt={selectedUniversity.name}
                                                className="w-16 h-16 object-contain"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-lg">{selectedUniversity.name}</h3>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {selectedUniversity.city}, {selectedUniversity.country}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={clearSelection}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                {selectedUniversity.ranking && (
                                                    <div className="flex items-center gap-2">
                                                        <GraduationCap className="w-4 h-4 text-blue-600" />
                                                        <span>#{selectedUniversity.ranking}</span>
                                                    </div>
                                                )}
                                                {selectedUniversity.studentCount && (
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-blue-600" />
                                                        <span>{selectedUniversity.studentCount.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {selectedUniversity.internationalStudents && (
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-blue-600" />
                                                        <span>{selectedUniversity.internationalStudents.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {selectedUniversity.tuitionFee && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-blue-600" />
                                                        <span className="text-xs">{selectedUniversity.tuitionFee}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {selectedUniversity.programs && selectedUniversity.programs.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {selectedUniversity.programs.slice(0, 3).map((program) => (
                                                        <Badge key={program} variant="outline" className="text-xs">
                                                            {program}
                                                        </Badge>
                                                    ))}
                                                    {selectedUniversity.programs.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{selectedUniversity.programs.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Application Details */}
                    {selectedUniversity && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('applicationDetails')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t('program')} *</Label>
                                        <Input
                                            value={formData.program}
                                            onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                                            placeholder={t('programPlaceholder')}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>{t('degree')} *</Label>
                                        <Select
                                            value={formData.degree}
                                            onValueChange={(value) => setFormData({ ...formData, degree: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Bachelor's">{t('degrees.bachelors')}</SelectItem>
                                                <SelectItem value="Master's">{t('degrees.masters')}</SelectItem>
                                                <SelectItem value="PhD">{t('degrees.phd')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t('intake')} *</Label>
                                        <Input
                                            value={formData.intake}
                                            onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                                            placeholder={t('intakePlaceholder')}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>{t('deadline')}</Label>
                                        <Input
                                            type="date"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{t('notes')}</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder={t('notesPlaceholder')}
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Submit Button */}
                    {selectedUniversity && (
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/${params.locale}/dashboard/student/applications`)}
                            >
                                {t('cancel')}
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {t('add')}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}