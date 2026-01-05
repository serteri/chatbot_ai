import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Sparkles, Globe, Brain } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface GoogleLikeSearchProps {
    onSearch: (query: string) => void
    onResults: (results: any) => void
    placeholder?: string
    className?: string
}

interface SearchSuggestion {
    text: string
    type: 'autocomplete' | 'suggestion' | 'recent'
    confidence?: number
}

export function GoogleLikeSearch({ onSearch, onResults, placeholder, className }: GoogleLikeSearchProps) {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [smartSuggestions, setSmartSuggestions] = useState<string[]>([])

    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('language-school-searches')
        if (saved) {
            setRecentSearches(JSON.parse(saved).slice(0, 5))
        }
    }, [])

    // Live search with intelligent suggestions
    useEffect(() => {
        const searchTimeout = setTimeout(async () => {
            if (query.length === 0) {
                setSuggestions([])
                setShowSuggestions(false)
                return
            }

            // Generate instant suggestions
            const instantSuggestions = generateInstantSuggestions(query)
            setSuggestions(instantSuggestions)
            setShowSuggestions(true)

            // Trigger smart search for 3+ characters
            if (query.length >= 3) {
                setIsSearching(true)
                try {
                    const response = await fetch(`/api/language-schools/search?q=${encodeURIComponent(query)}`)
                    if (response.ok) {
                        const data = await response.json()

                        // Update suggestions with smart AI suggestions
                        if (data.results.suggestions) {
                            setSmartSuggestions(data.results.suggestions.slice(0, 3))
                        }

                        // Trigger search results
                        onResults(data.results)
                        onSearch(query)
                    }
                } catch (error) {
                    console.error('Smart search failed:', error)
                } finally {
                    setIsSearching(false)
                }
            }
        }, 300)

        return () => clearTimeout(searchTimeout)
    }, [query, onSearch, onResults])

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const generateInstantSuggestions = (input: string): SearchSuggestion[] => {
        const lowerInput = input.toLowerCase()
        const suggestions: SearchSuggestion[] = []

        // Auto-complete common queries
        const commonQueries = [
            'EF Education First London',
            'Kaplan International New York',
            'EC English Malta',
            'ILAC Toronto',
            'Goethe Institute Berlin',
            'Alliance Française Paris',
            'Instituto Cervantes Madrid',
            'cheap English schools',
            'premium language schools',
            'business English courses',
            'intensive Spanish courses',
            'German language schools',
            'French schools Paris',
            'Japanese schools Tokyo',
            'short term courses',
            'university pathway programs'
        ]

        // Add matching autocomplete suggestions
        commonQueries
            .filter(q => q.toLowerCase().includes(lowerInput))
            .slice(0, 4)
            .forEach(match => {
                suggestions.push({
                    text: match,
                    type: 'autocomplete',
                    confidence: 0.9
                })
            })

        // Add recent searches that match
        recentSearches
            .filter(search => search.toLowerCase().includes(lowerInput))
            .slice(0, 2)
            .forEach(search => {
                suggestions.push({
                    text: search,
                    type: 'recent',
                    confidence: 0.8
                })
            })

        // Add smart suggestions based on query analysis
        const smartSugs = generateSmartQuerySuggestions(input)
        suggestions.push(...smartSugs.slice(0, 3))

        return suggestions.slice(0, 8)
    }

    const generateSmartQuerySuggestions = (input: string): SearchSuggestion[] => {
        const lowerInput = input.toLowerCase()
        const suggestions: SearchSuggestion[] = []

        // Location-based suggestions
        if (!hasLocation(lowerInput)) {
            if (lowerInput.includes('english')) {
                suggestions.push(
                    { text: input + ' London', type: 'suggestion', confidence: 0.7 },
                    { text: input + ' New York', type: 'suggestion', confidence: 0.7 },
                    { text: input + ' Malta', type: 'suggestion', confidence: 0.6 }
                )
            }
        }

        // Chain-based suggestions
        if (!hasChain(lowerInput) && !lowerInput.includes('school')) {
            suggestions.push(
                { text: 'EF ' + input, type: 'suggestion', confidence: 0.6 },
                { text: 'Kaplan ' + input, type: 'suggestion', confidence: 0.6 }
            )
        }

        // Price-based suggestions
        if (!hasPriceIntent(lowerInput)) {
            suggestions.push(
                { text: 'budget ' + input, type: 'suggestion', confidence: 0.5 },
                { text: 'premium ' + input, type: 'suggestion', confidence: 0.5 }
            )
        }

        return suggestions
    }

    const hasLocation = (input: string): boolean => {
        return /\b(london|new york|paris|berlin|tokyo|sydney|toronto|dublin|malta|barcelona)\b/i.test(input)
    }

    const hasChain = (input: string): boolean => {
        return /\b(ef|kaplan|ec|ilac|lsi|kings|stafford)\b/i.test(input)
    }

    const hasPriceIntent = (input: string): boolean => {
        return /\b(cheap|expensive|budget|premium|affordable)\b/i.test(input)
    }

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery)
        setShowSuggestions(false)

        // Save to recent searches
        const newRecentSearches = [
            searchQuery,
            ...recentSearches.filter(s => s !== searchQuery)
        ].slice(0, 5)

        setRecentSearches(newRecentSearches)
        localStorage.setItem('language-school-searches', JSON.stringify(newRecentSearches))

        // Trigger search
        onSearch(searchQuery)
    }

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        handleSearch(suggestion.text)
    }

    const clearSearch = () => {
        setQuery('')
        setSuggestions([])
        setShowSuggestions(false)
        setSmartSuggestions([])
        inputRef.current?.focus()
    }

    const getSuggestionIcon = (type: string) => {
        switch (type) {
            case 'autocomplete': return <Search className="h-4 w-4 text-gray-400" />
            case 'suggestion': return <Sparkles className="h-4 w-4 text-blue-500" />
            case 'recent': return <Globe className="h-4 w-4 text-green-500" />
            default: return <Search className="h-4 w-4 text-gray-400" />
        }
    }

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    ref={inputRef}
                    placeholder={placeholder || "Search schools, cities, or chains (e.g., 'EF London', 'budget Malta')"}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 0 && setShowSuggestions(true)}
                    className="pl-12 pr-12 text-lg h-14 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />

                {/* Loading indicator */}
                {isSearching && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Clear button */}
                {query.length > 0 && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-2xl mt-2 z-50 max-h-96 overflow-y-auto">
                    {/* Quick Search Info */}
                    <div className="p-3 border-b border-gray-100 bg-blue-50">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Smart Search Suggestions</span>
                        </div>
                        {query.length >= 3 && (
                            <div className="text-xs text-blue-600 mt-1">
                                Press Enter to search • {suggestions.length} suggestions found
                            </div>
                        )}
                    </div>

                    {/* Suggestions List */}
                    <div className="py-2">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors group"
                            >
                                <div className="flex-shrink-0">
                                    {getSuggestionIcon(suggestion.type)}
                                </div>

                                <div className="flex-1">
                                    <div className="text-gray-900 group-hover:text-blue-900">
                                        {suggestion.text}
                                    </div>

                                    <div className="flex items-center space-x-2 mt-1">
                                        <Badge
                                            variant={
                                                suggestion.type === 'autocomplete' ? 'default' :
                                                    suggestion.type === 'suggestion' ? 'secondary' : 'outline'
                                            }
                                            className="text-xs"
                                        >
                                            {suggestion.type === 'autocomplete' ? 'Auto-complete' :
                                                suggestion.type === 'suggestion' ? 'Smart suggestion' : 'Recent'}
                                        </Badge>

                                        {suggestion.confidence && (
                                            <span className="text-xs text-gray-500">
                        {Math.round(suggestion.confidence * 100)}% match
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Smart AI Suggestions */}
                    {smartSuggestions.length > 0 && (
                        <div className="border-t border-gray-100 bg-purple-50">
                            <div className="p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Brain className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-800">AI Recommendations</span>
                                </div>
                                <div className="space-y-1">
                                    {smartSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleSearch(suggestion)}
                                            className="text-sm text-purple-700 hover:text-purple-900 cursor-pointer hover:underline"
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search Tips */}
                    <div className="border-t border-gray-100 p-3 bg-gray-50">
                        <div className="text-xs text-gray-600">
                            <strong>Search tips:</strong> Try "EF London", "budget Malta", "intensive Spanish", or "Kaplan USA"
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}