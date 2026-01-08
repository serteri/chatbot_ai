'use client'

import { useTranslations } from 'next-intl'
import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    Users,
    Target,
    Lightbulb,
    Award,
    Globe,
    MessageSquare,
    GraduationCap,
    ShoppingCart,
    ArrowRight,
    Mail,
    CheckCircle
} from 'lucide-react'

export default function AboutPage() {
    const t = useTranslations()
    const params = useParams()
    const locale = params.locale as string

    return (
        <>
            <PublicNav />

            <div className="min-h-screen bg-white">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            {t('about.title')}
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            {t('about.subtitle')}
                        </p>
                        <p className="text-lg text-blue-100 max-w-4xl mx-auto">
                            {t('about.description')}
                        </p>
                    </div>
                </div>

                {/* Mission & Vision */}
                <div className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                            <div className="bg-white p-8 rounded-2xl shadow-lg">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <Target className="h-6 w-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">{t('about.mission')}</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed">
                                    {t('about.missionText')}
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-lg">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                                        <Lightbulb className="h-6 w-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">{t('about.vision')}</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed">
                                    {t('about.visionText')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Values */}
                <div className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">
                            {t('about.values')}
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Award className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-900">{t('about.innovation')}</h3>
                                <p className="text-gray-600">{t('about.innovationText')}</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-900">{t('about.quality')}</h3>
                                <p className="text-gray-600">{t('about.qualityText')}</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Globe className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-900">{t('about.accessibility')}</h3>
                                <p className="text-gray-600">{t('about.accessibilityText')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* What We Do */}
                <div className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">
                            {t('about.whatWeDo')}
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-blue-500">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <GraduationCap className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{t('about.educationTitle')}</h3>
                                </div>
                                <p className="text-gray-600 mb-6">{t('about.educationDesc')}</p>
                                <ul className="space-y-2">
                                    <li className="flex items-center space-x-2 text-sm text-gray-600">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>{locale === 'tr' ? '70+ ülke vize bilgisi' : '70+ countries visa info'}</span>
                                    </li>
                                    <li className="flex items-center space-x-2 text-sm text-gray-600">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>{locale === 'tr' ? '150+ dil okulu veritabanı' : '150+ language schools database'}</span>
                                    </li>
                                    <li className="flex items-center space-x-2 text-sm text-gray-600">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>{locale === 'tr' ? 'Burs fırsatları rehberi' : 'Scholarship opportunities guide'}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-green-500">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                                        <ShoppingCart className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{t('about.ecommerceTitle')}</h3>
                                </div>
                                <p className="text-gray-600 mb-6">{t('about.ecommerceDesc')}</p>
                                <ul className="space-y-2">
                                    <li className="flex items-center space-x-2 text-sm text-gray-600">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>{locale === 'tr' ? 'Ürün önerileri' : 'Product recommendations'}</span>
                                    </li>
                                    <li className="flex items-center space-x-2 text-sm text-gray-600">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>{locale === 'tr' ? 'Sipariş takibi' : 'Order tracking'}</span>
                                    </li>
                                    <li className="flex items-center space-x-2 text-sm text-gray-600">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>{locale === 'tr' ? 'Akıllı satış asistanı' : 'Smart sales assistant'}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-16">
                            {t('about.stats')}
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-4xl font-bold mb-2">10K+</div>
                                <div className="text-blue-200">{t('about.activeUsers')}</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">70+</div>
                                <div className="text-blue-200">{t('about.countries')}</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">9</div>
                                <div className="text-blue-200">{t('about.languages')}</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">98%</div>
                                <div className="text-blue-200">{t('about.satisfaction')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                {t('about.team')}
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                {t('about.teamDesc')}
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-200">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <Users className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {locale === 'tr' ? 'Deneyimli Ekip' : 'Experienced Team'}
                                        </h3>
                                        <p className="text-gray-600">
                                            {locale === 'tr'
                                                ? 'AI, makine öğrenmesi ve müşteri deneyimi konularında uzman ekibimiz'
                                                : 'Our expert team in AI, machine learning and customer experience'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                {t('about.contactTitle')}
                            </h2>
                            <p className="text-xl text-gray-600 mb-8">
                                {t('about.contactDesc')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href={`/${locale}/contact`}
                                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    <Mail className="h-5 w-5" />
                                    <span>{t('about.contactButton')}</span>
                                </Link>

                                <Link
                                    href={`/${locale}/auth/register`}
                                    className="inline-flex items-center space-x-2 bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                                >
                                    <span>{t('about.startFree')}</span>
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer locale={locale} />
        </>
    )
}