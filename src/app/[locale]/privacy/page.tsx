import { getTranslations } from 'next-intl/server'
import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Shield, Eye, Lock, Share2, Cookie, Mail, Trash2, FileText, Globe } from 'lucide-react'
import { Metadata } from 'next'

interface PageProps {
    params: Promise<{
        locale: string
    }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'legal.privacy' })

    return {
        title: t('title') + ' | PylonChat',
        description: t('intro'),
        alternates: {
            canonical: `https://www.pylonchat.com/${locale}/privacy`,
        },
        openGraph: {
            title: t('title'),
            description: t('intro'),
            url: `https://www.pylonchat.com/${locale}/privacy`,
            siteName: 'PylonChat',
            type: 'website',
        },
    }
}


export default async function PrivacyPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'legal.privacy' })
    const tCommon = await getTranslations({ locale, namespace: 'legal' })

    const sections = [
        { icon: Eye, titleKey: 'collectTitle', textKey: 'collectText', items: 'collectItems' },
        { icon: FileText, titleKey: 'useTitle', textKey: 'useText', items: 'useItems' },
        { icon: Share2, titleKey: 'shareTitle', textKey: 'shareText', items: 'shareItems' },
        { icon: Cookie, titleKey: 'cookiesTitle', textKey: 'cookiesText', items: null },
        { icon: Lock, titleKey: 'securityTitle', textKey: 'securityText', items: null },
        { icon: Globe, titleKey: 'thirdPartyTitle', textKey: 'thirdPartyText', items: null },
        { icon: Trash2, titleKey: 'retentionTitle', textKey: 'retentionText', items: null },
        { icon: Mail, titleKey: 'contactTitle', textKey: 'contactText', items: null },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
            <PublicNav />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
                    <div className="container mx-auto px-4 py-16 md:py-24">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                {t('title')}
                            </h1>
                            <p className="text-xl text-blue-100 mb-4">
                                {t('intro')}
                            </p>
                            <p className="text-sm text-blue-200">
                                {tCommon('lastUpdated')}: 18 Ocak 2026
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="max-w-4xl mx-auto">
                        {/* Quick Summary Card */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 mb-12 border border-blue-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                {t('summaryTitle')}
                            </h2>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-gray-700">{t('summaryItem1')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-gray-700">{t('summaryItem2')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-gray-700">{t('summaryItem3')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-gray-700">{t('summaryItem4')}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Sections */}
                        <div className="space-y-12">
                            {sections.map((section, index) => (
                                <section key={index} className="scroll-mt-20" id={`section-${index}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <section.icon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                                {t(section.titleKey)}
                                            </h2>
                                            <p className="text-gray-600 leading-relaxed mb-4">
                                                {t(section.textKey)}
                                            </p>
                                            {section.items && (
                                                <ul className="space-y-2 text-gray-600">
                                                    {[1, 2, 3, 4].map((i) => {
                                                        try {
                                                            const item = t(`${section.items}${i}`)
                                                            if (item && !item.includes(section.items)) {
                                                                return (
                                                                    <li key={i} className="flex items-start gap-2">
                                                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                                                        {item}
                                                                    </li>
                                                                )
                                                            }
                                                            return null
                                                        } catch {
                                                            return null
                                                        }
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            ))}
                        </div>

                        {/* Your Rights Section */}
                        <div className="mt-16 bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                {t('rightsTitle')}
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => {
                                    try {
                                        const right = t(`right${i}`)
                                        if (right && !right.includes('right')) {
                                            return (
                                                <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                                                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                                        ✓
                                                    </span>
                                                    <span className="text-gray-700">{right}</span>
                                                </div>
                                            )
                                        }
                                        return null
                                    } catch {
                                        return null
                                    }
                                })}
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div className="mt-12 text-center p-8 bg-blue-600 text-white rounded-2xl">
                            <Mail className="w-10 h-10 mx-auto mb-4 opacity-80" />
                            <h3 className="text-xl font-semibold mb-2">{t('questionsTitle')}</h3>
                            <p className="text-blue-100 mb-4">{t('questionsText')}</p>
                            <a
                                href="mailto:privacy@pylonchat.com"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                                privacy@pylonchat.com
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer locale={locale} />
        </div>
    )
}
