'use client'

import { useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { ChevronDown, Languages, CheckCircle } from 'lucide-react'

const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
]

export default function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false)
    const params = useParams()
    const pathname = usePathname()
    const currentLocale = (params?.locale as string) || 'tr'
    const currentLang = languages.find(lang => lang.code === currentLocale) || languages[0]

    // Get path without locale for switching
    const getLocalizedPath = (newLocale: string) => {
        const segments = pathname.split('/').filter(Boolean)
        segments[0] = newLocale // Replace first segment (locale) with new locale
        return `/${segments.join('/')}`
    }

    // Handle language change with page reload
    const handleLanguageChange = (newLocale: string) => {
        setIsOpen(false)
        const newPath = getLocalizedPath(newLocale)
        // Force page reload to properly update translations
        window.location.href = newPath
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
                <Languages className="h-4 w-4" />
                <span className="flex items-center space-x-1">
                    <span>{currentLang.flag}</span>
                    <span className="hidden sm:inline">{currentLang.name}</span>
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg border py-1 z-50 min-w-[160px]">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                            {lang.code === currentLocale && (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    )
}