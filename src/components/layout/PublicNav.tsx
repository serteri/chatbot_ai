'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useState } from 'react'
import {
    Menu,
    X,
    Shield,
    ClipboardCheck,
    Server,
    DollarSign,
    Lock,
    CalendarCheck
} from 'lucide-react'

export function PublicNav() {
    const params = useParams()
    const pathname = usePathname()
    const locale = (params?.locale as string) || 'en'
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const NAV_LINKS = [
        {
            label: 'Audit Features',
            href: `/${locale}/audit-features`,
            icon: ClipboardCheck,
        },
        {
            label: 'Data Sovereignty (Sydney)',
            href: `/${locale}/data-sovereignty`,
            icon: Server,
        },
        {
            label: 'Pricing',
            href: `/${locale}/pricing`,
            icon: DollarSign,
        },
    ]

    const isActive = (href: string) => {
        if (!pathname) return false
        // Strip hash for comparison
        const cleanHref = href.split('#')[0]
        if (cleanHref === `/${locale}` || cleanHref === `/${locale}/`) {
            return pathname === `/${locale}` || pathname === `/${locale}/`
        }
        return pathname.startsWith(cleanHref)
    }

    return (
        <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href={`/${locale}`} className="flex items-center space-x-2.5 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:shadow-lg group-hover:shadow-teal-500/30 transition-all duration-300">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-slate-900 leading-tight tracking-tight">
                                NDIS Shield Hub
                            </span>
                            <span className="text-[10px] font-medium text-teal-700 uppercase tracking-widest leading-none">
                                NDIS Compliance
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {NAV_LINKS.map((link) => {
                            const Icon = link.icon
                            const active = isActive(link.href)
                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${active
                                        ? 'text-teal-700 bg-teal-50/80'
                                        : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/60'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{link.label}</span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right Side — CTAs */}
                    <div className="flex items-center space-x-3">
                        {/* Language Switcher — COMMENTED OUT for English-only public marketing site
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
                                            href={`/${langCode}`}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            {langCode.toUpperCase()}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                        */}

                        {/* Auth / CTA — Desktop */}
                        <div className="hidden md:flex items-center space-x-3">
                            <Link
                                href={`/${locale}/auth/login`}
                                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/40 transition-all duration-200 font-medium text-sm"
                            >
                                <Lock className="h-4 w-4" />
                                <span>Login</span>
                            </Link>
                            <Link
                                href={`/${locale}/contact?type=demo`}
                                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 font-semibold text-sm"
                            >
                                <CalendarCheck className="h-4 w-4" />
                                <span>Book a Demo</span>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                            aria-label="Toggle navigation menu"
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden border-t border-slate-200 bg-white">
                        <div className="px-3 pt-3 pb-4 space-y-1">
                            {NAV_LINKS.map((link) => {
                                const Icon = link.icon
                                const active = isActive(link.href)
                                return (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${active
                                            ? 'text-teal-700 bg-teal-50/80'
                                            : 'text-slate-700 hover:text-teal-700 hover:bg-teal-50/60'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4 mr-2.5" />
                                        {link.label}
                                    </Link>
                                )
                            })}

                            <div className="pt-3 mt-2 border-t border-slate-200 space-y-2">
                                <Link
                                    href={`/${locale}/auth/login`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center px-3 py-2.5 border border-slate-300 text-slate-700 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/40 rounded-lg transition-colors font-medium text-sm"
                                >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Login
                                </Link>
                                <Link
                                    href={`/${locale}/contact?type=demo`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-colors font-semibold text-sm shadow-md shadow-teal-500/20"
                                >
                                    <CalendarCheck className="h-4 w-4 mr-2" />
                                    Book a Demo
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}