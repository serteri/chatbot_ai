'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl' // useLocale eklendi
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    LogOut,
    User,
    Users,
    Globe,
    GraduationCap,
    ShoppingCart,
    Bot,
    Settings,
    ChevronDown,
    LayoutDashboard,
    MessageSquare,
    BarChart3,
    CreditCard,
    Building2,
    HeadphonesIcon
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface DashboardNavProps {
    user: {
        name?: string | null
        email?: string | null
    }
}

export default function DashboardNav({ user }: DashboardNavProps) {
    const t = useTranslations()
    const locale = useLocale() // Mevcut dili güvenli bir şekilde alıyoruz
    const router = useRouter()
    const pathname = usePathname()

    const changeLocale = (newLocale: string) => {
        // HATA DÜZELTME: URL mantığı yenilendi
        const supportedLocales = ['tr', 'en', 'de', 'fr', 'es'];
        const pathSegments = pathname.split('/').filter(Boolean);

        // Eğer URL'in ilk parçası desteklenen bir dil ise (örn: /tr/dashboard), onu değiştir
        if (supportedLocales.includes(pathSegments[0])) {
            pathSegments[0] = newLocale;
        } else {
            // Eğer URL'de dil yoksa (örn: /dashboard), en başa yeni dili ekle
            pathSegments.unshift(newLocale);
        }

        const newPath = `/${pathSegments.join('/')}`;
        router.push(newPath);
    }

    const currentLocale = locale; // Artık pathname'i parse etmeye gerek yok

    const handleLogout = async () => {
        await signOut({
            callbackUrl: `/${currentLocale}`,
            redirect: true
        })
    }

    return (
        <nav className="border-b bg-white sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* SOL TARA: Logo ve Menüler */}
                    <div className="flex items-center space-x-8">
                        <Link href={`/${currentLocale}/dashboard`} className="text-xl font-bold text-blue-600 flex items-center gap-2">
                            <Bot className="h-6 w-6" />
                            <span>PylonChat</span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-1">
                            {/* Dashboard Linki */}
                            <Link
                                href={`/${currentLocale}/dashboard`}
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition flex items-center gap-2"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                {t('nav.dashboard')}
                            </Link>

                            {/* Chatbot Selection Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition flex items-center gap-1 group outline-none">
                                        <Bot className="h-4 w-4" />
                                        <span>{t('chatbots.title')}</span>
                                        <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-blue-600 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white border border-gray-200 shadow-xl z-[999] min-w-[240px] animate-in fade-in-0 zoom-in-95 mt-2">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/${currentLocale}/dashboard/chatbots`} className="cursor-pointer font-medium flex items-center gap-2 py-2.5">
                                            <span>🤖</span> {t('dashboard.generalChatbots')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    <DropdownMenuItem asChild>
                                        <Link href={`/${currentLocale}/dashboard/education`} className="cursor-pointer flex items-center gap-2 py-2.5 text-gray-600 hover:text-blue-600">
                                            <div className="p-1 bg-blue-100 rounded text-blue-600">
                                                <GraduationCap className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">Eğitim Asistanları</span>
                                                <span className="text-xs text-gray-400 font-normal">Üniversite & Vize</span>
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/${currentLocale}/dashboard/ecommerce`} className="cursor-pointer flex items-center gap-2 py-2.5 text-gray-600 hover:text-blue-600">
                                            <div className="p-1 bg-green-100 rounded text-green-600">
                                                <ShoppingCart className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {locale === 'tr' ? 'E-Ticaret Asistanları'
                                                        : locale === 'en' ? 'E-Commerce Assistants'
                                                            : locale === 'de' ? 'E-Commerce-Assistenten'
                                                                : locale === 'es' ? 'Asistentes de E-Commerce'
                                                                    : locale === 'fr' ? 'Assistants E-Commerce'
                                                                        : 'E-Commerce Assistants'}
                                                </span>
                                                <span className="text-xs text-gray-400 font-normal">
                                                    {locale === 'tr' ? 'Satış & Destek'
                                                        : locale === 'en' ? 'Sales & Support'
                                                            : locale === 'de' ? 'Vertrieb & Support'
                                                                : locale === 'es' ? 'Ventas y Soporte'
                                                                    : locale === 'fr' ? 'Ventes et Support'
                                                                        : 'Sales & Support'}
                                                </span>
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/${currentLocale}/dashboard/realestate`} className="cursor-pointer flex items-center gap-2 py-2.5 text-gray-600 hover:text-amber-600">
                                            <div className="p-1 bg-amber-100 rounded text-amber-600">
                                                <Building2 className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {locale === 'tr' ? 'Emlak Asistanları'
                                                        : locale === 'en' ? 'Real Estate Assistants'
                                                            : locale === 'de' ? 'Immobilien-Assistenten'
                                                                : locale === 'es' ? 'Asistentes Inmobiliarios'
                                                                    : locale === 'fr' ? 'Assistants Immobiliers'
                                                                        : 'Real Estate Assistants'}
                                                </span>
                                                <span className="text-xs text-gray-400 font-normal">
                                                    {locale === 'tr' ? 'Lead Eleme & Randevu'
                                                        : locale === 'en' ? 'Lead Qualification & Booking'
                                                            : locale === 'de' ? 'Lead-Qualifizierung & Buchung'
                                                                : locale === 'es' ? 'Calificación de Leads y Reservas'
                                                                    : locale === 'fr' ? 'Qualification de Leads et Réservation'
                                                                        : 'Lead Qualification & Booking'}
                                                </span>
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Link
                                href={`/${currentLocale}/dashboard/conversations`}
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition flex items-center gap-2"
                            >
                                <MessageSquare className="h-4 w-4" />
                                {t('nav.conversations')}
                            </Link>

                            <Link
                                href={`/${currentLocale}/dashboard/pricing`}
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition"
                            >
                                {t('nav.pricing')}
                            </Link>
                        </div>
                    </div>

                    {/* SAĞ TARAF: Dil ve Kullanıcı */}
                    <div className="flex items-center space-x-3">
                        {/* Dil Seçici */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-9 px-3 border border-gray-200 hover:bg-gray-50 hover:text-blue-600">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        <span className="font-semibold text-xs">{currentLocale.toUpperCase()}</span>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white border border-gray-200 shadow-xl z-[999] min-w-[160px] p-1 mt-2" align="end">
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                    {currentLocale === 'tr' ? 'Dil Seçin' :
                                        currentLocale === 'de' ? 'Sprache wählen' :
                                            currentLocale === 'fr' ? 'Choisir la langue' :
                                                currentLocale === 'es' ? 'Elegir idioma' :
                                                    'Select Language'}
                                </div>

                                <DropdownMenuItem onClick={() => changeLocale('tr')} className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-sm ${currentLocale === 'tr' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">🇹🇷</span>
                                        <span>Türkçe</span>
                                    </div>
                                    {currentLocale === 'tr' && <span className="text-blue-600">✓</span>}
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => changeLocale('en')} className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-sm ${currentLocale === 'en' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">🇬🇧</span>
                                        <span>English</span>
                                    </div>
                                    {currentLocale === 'en' && <span className="text-blue-600">✓</span>}
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => changeLocale('de')} className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-sm ${currentLocale === 'de' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">🇩🇪</span>
                                        <span>Deutsch</span>
                                    </div>
                                    {currentLocale === 'de' && <span className="text-blue-600">✓</span>}
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => changeLocale('fr')} className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-sm ${currentLocale === 'fr' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">🇫🇷</span>
                                        <span>Français</span>
                                    </div>
                                    {currentLocale === 'fr' && <span className="text-blue-600">✓</span>}
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => changeLocale('es')} className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-sm ${currentLocale === 'es' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">🇪🇸</span>
                                        <span>Español</span>
                                    </div>
                                    {currentLocale === 'es' && <span className="text-blue-600">✓</span>}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-9 px-2 hover:bg-gray-50 group border border-transparent hover:border-gray-200">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <span className="max-w-[100px] truncate mr-1 font-medium text-gray-700 group-hover:text-gray-900">
                                        {user.name || user.email}
                                    </span>
                                    <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white border border-gray-200 shadow-xl z-[999] min-w-[200px] mt-2 p-1" align="end">
                                <div className="px-2 py-1.5 mb-1 border-b border-gray-50">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>

                                <DropdownMenuItem asChild>
                                    <Link href={`/${currentLocale}/dashboard/profile`} className="cursor-pointer py-2.5">
                                        <User className="h-4 w-4 mr-2 text-gray-500" />
                                        {t('nav.profile')}
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href={`/${currentLocale}/dashboard/settings`} className="cursor-pointer py-2.5">
                                        <Settings className="h-4 w-4 mr-2 text-gray-500" />
                                        {t('nav.settings')}
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href={`/${currentLocale}/dashboard/team`} className="cursor-pointer py-2.5">
                                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                                        {t('nav.team')}
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href={`/${currentLocale}/dashboard/analytics`} className="cursor-pointer py-2.5">
                                        <BarChart3 className="h-4 w-4 mr-2 text-gray-500" />
                                        {t('nav.analytics')}
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href={`/${currentLocale}/dashboard/billing`} className="cursor-pointer py-2.5">
                                        <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                                        {t('nav.billing')}
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href={`/${currentLocale}/dashboard/support`} className="cursor-pointer py-2.5">
                                        <HeadphonesIcon className="h-4 w-4 mr-2 text-gray-500" />
                                        {t('nav.support')}
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-gray-100 my-1" />

                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 py-2.5">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    {t('nav.logout')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </nav>
    )
}