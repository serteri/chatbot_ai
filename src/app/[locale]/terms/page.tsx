import { getTranslations } from 'next-intl/server'
import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { FileText, CheckCircle, XCircle, AlertTriangle, CreditCard, Scale, Shield, Mail } from 'lucide-react'

interface PageProps {
    params: Promise<{
        locale: string
    }>
}

export default async function TermsPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'legal.terms' })
    const tCommon = await getTranslations({ locale, namespace: 'legal' })

    const sections = [
        { icon: CheckCircle, titleKey: 'agreementTitle', textKey: 'agreementText', color: 'blue' },
        { icon: FileText, titleKey: 'serviceTitle', textKey: 'serviceText', color: 'blue' },
        { icon: CheckCircle, titleKey: 'userTitle', textKey: 'userText', color: 'green' },
        { icon: XCircle, titleKey: 'prohibitedTitle', textKey: 'prohibitedText', color: 'red' },
        { icon: CreditCard, titleKey: 'paymentTitle', textKey: 'paymentText', color: 'purple' },
        { icon: Shield, titleKey: 'intellectualTitle', textKey: 'intellectualText', color: 'blue' },
        { icon: AlertTriangle, titleKey: 'liabilityTitle', textKey: 'liabilityText', color: 'orange' },
        { icon: Scale, titleKey: 'terminationTitle', textKey: 'terminationText', color: 'gray' },
    ]

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; icon: string; border: string }> = {
            blue: { bg: 'bg-blue-100', icon: 'text-blue-600', border: 'border-blue-200' },
            green: { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-200' },
            red: { bg: 'bg-red-100', icon: 'text-red-600', border: 'border-red-200' },
            purple: { bg: 'bg-purple-100', icon: 'text-purple-600', border: 'border-purple-200' },
            orange: { bg: 'bg-orange-100', icon: 'text-orange-600', border: 'border-orange-200' },
            gray: { bg: 'bg-gray-100', icon: 'text-gray-600', border: 'border-gray-200' },
        }
        return colors[color] || colors.blue
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
            <PublicNav />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                    <div className="container mx-auto px-4 py-16 md:py-24">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                {t('title')}
                            </h1>
                            <p className="text-xl text-gray-300 mb-4">
                                {t('intro')}
                            </p>
                            <p className="text-sm text-gray-400">
                                {tCommon('lastUpdated')}: 18 Ocak 2026
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table of Contents */}
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 -mt-12 relative z-10">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('tocTitle')}</h2>
                            <div className="grid md:grid-cols-2 gap-2">
                                {sections.map((section, index) => (
                                    <a
                                        key={index}
                                        href={`#section-${index}`}
                                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                                            {index + 1}
                                        </span>
                                        {t(section.titleKey)}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {sections.map((section, index) => {
                            const colors = getColorClasses(section.color)
                            return (
                                <section key={index} className="scroll-mt-24" id={`section-${index}`}>
                                    <div className={`rounded-2xl border ${colors.border} overflow-hidden`}>
                                        <div className={`${colors.bg} px-6 py-4 flex items-center gap-4`}>
                                            <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm`}>
                                                <section.icon className={`w-5 h-5 ${colors.icon}`} />
                                            </div>
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                {index + 1}. {t(section.titleKey)}
                                            </h2>
                                        </div>
                                        <div className="bg-white px-6 py-5">
                                            <p className="text-gray-600 leading-relaxed">
                                                {t(section.textKey)}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )
                        })}

                        {/* Governing Law */}
                        <section className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-200">
                            <Scale className="w-10 h-10 text-gray-400 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {t('governingTitle')}
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                {t('governingText')}
                            </p>
                        </section>

                        {/* Contact Section */}
                        <div className="text-center p-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl">
                            <Mail className="w-10 h-10 mx-auto mb-4 opacity-80" />
                            <h3 className="text-xl font-semibold mb-2">{t('questionsTitle')}</h3>
                            <p className="text-gray-300 mb-4">{t('questionsText')}</p>
                            <a
                                href="mailto:legal@pylonchat.com"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                                legal@pylonchat.com
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer locale={locale} />
        </div>
    )
}
