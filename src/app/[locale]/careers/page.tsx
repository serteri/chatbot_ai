import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Briefcase, Globe, Users, ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function CareersPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'careers' })

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />
            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-blue-600 text-white py-20 lg:py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/50 backdrop-blur-sm z-0"></div>
                    <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl mx-auto">
                        <Badge className="mb-6 bg-blue-500/50 hover:bg-blue-500/60 border-blue-400 text-blue-100 px-4 py-1 text-sm uppercase tracking-wide">
                            {t('title')}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            {t('title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                            {t('subtitle')}
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 py-16 -mt-20 relative z-20">
                    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-8 md:p-12 text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Briefcase className="h-8 w-8" />
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                {t('noOpeningsTitle')}
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                                {t('noOpeningsDesc')}
                            </p>

                            <div className="bg-gray-50 rounded-xl p-6 md:p-8 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {t('sendCvTitle')}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {t('sendCvDesc')}
                                </p>
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {t('sendButton')}
                                </Button>
                                <div className="mt-4 text-sm text-gray-400">
                                    careers@pylonchat.com
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
