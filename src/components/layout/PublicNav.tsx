'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
    MessageSquare,
    Menu,
    X,
    Globe,
    DollarSign,
    Info,
    Mail,
    GraduationCap,
    ShoppingCart,
    ChevronDown
} from 'lucide-react'

export function PublicNav() {
    const params = useParams()
    const pathname = usePathname()
    const locale = params?.locale as string || 'tr'
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const t = useTranslations('home.navbar')

    // Mevcut sayfanın locale olmayan kısmını al
    const getLocalizedPath = (newLocale: string) => {
        if (!pathname) return `/${newLocale}`

        const supportedLocales = ['tr', 'en', 'de', 'es', 'fr']
        const segments = pathname.split('/').filter(Boolean)

        // Check if first segment is a locale
        if (segments.length > 0 && supportedLocales.includes(segments[0])) {
            // Replace existing locale
            segments[0] = newLocale
        } else {
            // No locale in URL, prepend new locale
            segments.unshift(newLocale)
        }

        return `/${segments.join('/')}`
    }

    const getLanguageName = (langCode: string) => {
        switch (langCode) {
            case 'tr': return 'Türkçe'
            case 'en': return 'English'
            case 'de': return 'Deutsch'
            case 'es': return 'Español'
            case 'fr': return 'Français'
            default: return langCode.toUpperCase()
        }
    }

    const getLanguageFlag = (langCode: string) => {
        switch (langCode) {
            case 'tr': return '🇹🇷'
            case 'en': return '🇺🇸'
            case 'de': return '🇩🇪'
            case 'es': return '🇪🇸'
            case 'fr': return '🇫🇷'
            default: return '🌐'
        }
    }

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href={`/${locale}`} className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">PylonChat</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <Link
                            href={`/${locale}`}
                            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                        >
                            {t('home')}
                        </Link>

                        <Link
                            href={`/${locale}/pricing`}
                            className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                        >
                            <DollarSign className="h-4 w-4" />
                            <span>{t('pricing')}</span>
                        </Link>

                        <Link
                            href={`/${locale}/about`}
                            className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                        >
                            <Info className="h-4 w-4" />
                            <span>{t('about')}</span>
                        </Link>

                        <Link
                            href={`/${locale}/contact`}
                            className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                        >
                            <Mail className="h-4 w-4" />
                            <span>{t('contact')}</span>
                        </Link>

                        {/* Demos Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                <span>
                                    {locale === 'tr' ? 'Demolar'
                                        : locale === 'en' ? 'Demos'
                                            : locale === 'de' ? 'Demos'
                                                : locale === 'es' ? 'Demos'
                                                    : locale === 'fr' ? 'Démos'
                                                        : 'Demos'}
                                </span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute left-0 mt-2 w-72 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                                <div className="py-2">
                                    <Link
                                        href={`/${locale}/demo/education`}
                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                            <GraduationCap className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {locale === 'tr' ? 'Eğitim Chatbot'
                                                    : locale === 'en' ? 'Education Chatbot'
                                                        : locale === 'de' ? 'Bildungs-Chatbot'
                                                            : locale === 'es' ? 'Chatbot Educativo'
                                                                : locale === 'fr' ? 'Chatbot Éducatif'
                                                                    : 'Education Chatbot'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {locale === 'tr' ? 'Yurtdışı eğitim danışmanlığı'
                                                    : locale === 'en' ? 'Study abroad consultation'
                                                        : locale === 'de' ? 'Auslandsstudien-Beratung'
                                                            : locale === 'es' ? 'Consultoría de estudios en el extranjero'
                                                                : locale === 'fr' ? 'Consultation d\'études à l\'étranger'
                                                                    : 'Study abroad consultation'}
                                            </div>
                                        </div>
                                    </Link>
                                    <Link
                                        href={`/${locale}/demo/ecommerce`}
                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                                            <ShoppingCart className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {locale === 'tr' ? 'E-ticaret Chatbot'
                                                    : locale === 'en' ? 'E-commerce Chatbot'
                                                        : locale === 'de' ? 'E-Commerce-Chatbot'
                                                            : locale === 'es' ? 'Chatbot E-commerce'
                                                                : locale === 'fr' ? 'Chatbot E-commerce'
                                                                    : 'E-commerce Chatbot'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {locale === 'tr' ? 'Müşteri hizmetleri asistanı'
                                                    : locale === 'en' ? 'Customer service assistant'
                                                        : locale === 'de' ? 'Kundendienst-Assistent'
                                                            : locale === 'es' ? 'Asistente de atención al cliente'
                                                                : locale === 'fr' ? 'Assistant service client'
                                                                    : 'Customer service assistant'}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center space-x-4">
                        {/* Language Switcher */}
                        <div className="relative group">
                            <button className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                                <Globe className="h-4 w-4" />
                                <span className="uppercase text-sm font-medium">{locale}</span>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                                <div className="py-1">
                                    {['tr', 'en', 'de', 'es', 'fr'].map((langCode) => (
                                        <Link
                                            key={langCode}
                                            href={getLocalizedPath(langCode)}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            {getLanguageFlag(langCode)} {getLanguageName(langCode)}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Auth Links - Desktop */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                href={`/${locale}/auth/login`}
                                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                            >
                                {t('login')}
                            </Link>
                            <Link
                                href={`/${locale}/auth/register`}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                                {t('register')}
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link
                                href={`/${locale}`}
                                className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                {t('home')}
                            </Link>

                            <Link
                                href={`/${locale}/pricing`}
                                className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                <DollarSign className="h-4 w-4 mr-2" />
                                {t('pricing')}
                            </Link>

                            <Link
                                href={`/${locale}/about`}
                                className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                <Info className="h-4 w-4 mr-2" />
                                {t('about')}
                            </Link>

                            <Link
                                href={`/${locale}/contact`}
                                className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                {t('contact')}
                            </Link>

                            <Link
                                href={`/${locale}/demo/education`}
                                className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                <GraduationCap className="h-4 w-4 mr-2" />
                                {t('educationDemo')}
                            </Link>

                            <Link
                                href={`/${locale}/demo/ecommerce`}
                                className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {t('ecommerceDemo')}
                            </Link>

                            <div className="pt-4 border-t border-gray-200">
                                <Link
                                    href={`/${locale}/auth/login`}
                                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                                >
                                    {t('login')}
                                </Link>
                                <Link
                                    href={`/${locale}/auth/register`}
                                    className="block px-3 py-2 mt-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
                                >
                                    {t('register')}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}