'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { MessageSquare, Mail, MapPin, Phone, Twitter, Linkedin, Github, Youtube } from 'lucide-react'

interface FooterProps {
    locale: string
    variant?: 'default' | 'dashboard'
}

export function Footer({ locale, variant = 'default' }: FooterProps) {
    const t = useTranslations('footer')
    const currentYear = new Date().getFullYear()

    const productLinks = [
        { name: t('links.features'), href: `/${locale}/#features` },
        { name: t('links.pricing'), href: `/${locale}/pricing` },
        { name: t('links.demo'), href: `/${locale}/demo` },
        { name: t('links.api'), href: `/${locale}/docs/api` },
    ]

    const companyLinks = [
        { name: t('links.about'), href: `/${locale}/about` },
        { name: t('links.blog'), href: `/${locale}/blog` },
        { name: t('links.careers'), href: `/${locale}/careers` },
        { name: t('links.contact'), href: `/${locale}/contact` },
    ]

    const legalLinks = [
        { name: t('links.privacy'), href: `/${locale}/privacy` },
        { name: t('links.terms'), href: `/${locale}/terms` },
        { name: t('links.cookies'), href: `/${locale}/cookies` },
        { name: t('links.gdpr'), href: `/${locale}/gdpr` },
    ]

    const supportLinks = [
        { name: t('links.helpCenter'), href: `/${locale}/help` },
        { name: t('links.docs'), href: `/${locale}/docs` },
        { name: t('links.faq'), href: `/${locale}/faq` },
        { name: t('links.status'), href: 'https://status.pylonchat.com' },
    ]

    if (variant === 'dashboard') {
        return (
            <footer className="border-t border-gray-200 bg-white">
                <div className="px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <MessageSquare className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-sm text-gray-600">
                                © {currentYear} PylonChat. {t('copyright')}
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <Link href={`/${locale}/privacy`} className="hover:text-gray-900 transition-colors">
                                {t('links.privacy')}
                            </Link>
                            <Link href={`/${locale}/terms`} className="hover:text-gray-900 transition-colors">
                                {t('links.terms')}
                            </Link>
                            <Link href={`/${locale}/help`} className="hover:text-gray-900 transition-colors">
                                {t('links.help')}
                            </Link>
                            <Link href={`/${locale}/docs`} className="hover:text-gray-900 transition-colors">
                                {t('links.docs')}
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        )
    }

    return (
        <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link href={`/${locale}`} className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">PylonChat</span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-6 max-w-xs">
                            {t('description')}
                        </p>
                        <div className="flex gap-4">
                            <a href="https://twitter.com/pylonchat" target="_blank" rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="https://linkedin.com/company/pylonchat" target="_blank" rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="https://github.com/pylonchat" target="_blank" rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="https://youtube.com/@pylonchat" target="_blank" rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                                <Youtube className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">{t('sections.product')}</h3>
                        <ul className="space-y-3">
                            {productLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">{t('sections.company')}</h3>
                        <ul className="space-y-3">
                            {companyLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">{t('sections.support')}</h3>
                        <ul className="space-y-3">
                            {supportLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">{t('sections.legal')}</h3>
                        <ul className="space-y-3">
                            {legalLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                        <a href="mailto:info@pylonchat.com" className="flex items-center gap-2 hover:text-white transition-colors">
                            <Mail className="h-4 w-4" />
                            info@pylonchat.com
                        </a>
                        <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {t('location')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} PylonChat. {t('copyright')}
                        </p>
                        <div className="flex items-center gap-6">
                            <select
                                className="bg-gray-800 text-gray-400 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                                defaultValue={locale}
                                onChange={(e) => window.location.href = `/${e.target.value}`}
                            >
                                <option value="tr">🇹🇷 Türkçe</option>
                                <option value="en">🇺🇸 English</option>
                                <option value="es">🇪🇸 Español</option>
                                <option value="fr">🇫🇷 Français</option>
                                <option value="de">🇩🇪 Deutsch</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
