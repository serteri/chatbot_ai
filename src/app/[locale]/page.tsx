import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import {
    MessageSquare,
    GraduationCap,
    ShoppingCart,
    ArrowRight,
    CheckCircle,
    Zap,
    Globe,
    FileText,
    BarChart,
    Code,
    Settings,
    Building2
} from 'lucide-react'

interface HomePageProps {
    params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'home' })

    return (
        <>
            <PublicNav />

            {/* Hero Section */}
            <main className="flex-1">
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
                    <div className="container mx-auto px-4 py-20">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-5xl font-bold mb-6">
                                {t('hero.title')}
                            </h1>
                            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                                {t('hero.subtitle')}
                            </p>

                            <div className="flex flex-wrap justify-center gap-4 mb-12">
                                <Link href={`/${locale}/auth/register`}>
                                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                        <ArrowRight className="mr-2 h-5 w-5" />
                                        {t('hero.cta')}
                                    </Button>
                                </Link>
                                <Link href={`/${locale}/demo/education`}>
                                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                        <MessageSquare className="mr-2 h-5 w-5" />
                                        {t('hero.demoTry')}
                                    </Button>
                                </Link>
                            </div>

                            {/* Stats - Modern Glassmorphism Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative">
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <div className="p-2 bg-white/20 rounded-lg">
                                                <Zap className="h-5 w-5" />
                                            </div>
                                            <span className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                                5 dk
                                            </span>
                                        </div>
                                        <div className="text-blue-100 text-sm font-medium">
                                            {t('stats.setupTime')}
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative">
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <div className="p-2 bg-white/20 rounded-lg">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <span className="text-4xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                                                5+
                                            </span>
                                        </div>
                                        <div className="text-blue-100 text-sm font-medium">
                                            {t('stats.languages')}
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative">
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <div className="p-2 bg-white/20 rounded-lg">
                                                <MessageSquare className="h-5 w-5" />
                                            </div>
                                            <span className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                                                24/7
                                            </span>
                                        </div>
                                        <div className="text-blue-100 text-sm font-medium">
                                            {t('stats.supportLabel')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demo Chatbots Section */}
                <div className="container mx-auto px-4 py-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            {t('discover.title')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('discover.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Education Chatbot */}
                        <Card className="overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <GraduationCap className="h-7 w-7 text-white" />
                                    </div>
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                        {t('demo.badge')}
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl">
                                    {t('education.title')}
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {t('education.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4 mb-4">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span>{t('education.feature1')}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span>{t('education.feature2')}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span>{t('education.feature3')}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span>{t('education.feature4')}</span>
                                    </div>
                                </div>

                                <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                    <span className="text-sm text-blue-700 font-medium">
                                        {t('education.demoLangNote')}
                                    </span>
                                </div>

                                <Link href={`/${locale}/demo/education`}>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        <MessageSquare className="mr-2 h-5 w-5" />
                                        {t('education.tryFree')}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* E-commerce Chatbot */}
                        <Card className="overflow-hidden border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                                        <ShoppingCart className="h-7 w-7 text-white" />
                                    </div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                        {t('demo.badge')}
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl">
                                    {t('ecommerce.title')}
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {t('ecommerce.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4 mb-4">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span>{t('ecommerce.feature1')}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span>{t('ecommerce.feature2')}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span>{t('ecommerce.feature3')}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span>{t('ecommerce.feature4')}</span>
                                    </div>
                                </div>

                                <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                    <span className="text-sm text-green-700 font-medium">
                                        {t('ecommerce.demoLangNote')}
                                    </span>
                                </div>

                                <Link href={`/${locale}/demo/ecommerce`}>
                                    <Button className="w-full bg-green-600 hover:bg-green-700">
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        {t('ecommerce.tryFree')}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Real Estate Chatbot */}
                        <Card className="overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                                        <Building2 className="h-7 w-7 text-white" />
                                    </div>
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                        {t('demo.badge')}
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl">
                                    {t('realestate.title')}
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {t('realestate.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4 mb-4">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-amber-500" />
                                        <span>{t('realestate.feature1')}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-amber-500" />
                                        <span>{t('realestate.feature2')}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-amber-500" />
                                        <span>{t('realestate.feature3')}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-amber-500" />
                                        <span>{t('realestate.feature4')}</span>
                                    </div>
                                </div>

                                <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                                    <span className="text-sm text-amber-700 font-medium">
                                        {t('realestate.demoLangNote')}
                                    </span>
                                </div>

                                <Link href={`/${locale}/demo/realestate`}>
                                    <Button className="w-full bg-amber-600 hover:bg-amber-700">
                                        <Building2 className="mr-2 h-5 w-5" />
                                        {t('realestate.tryFree')}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="container mx-auto px-4 py-20 bg-gray-50">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            {t('features.title')}
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {t('features.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <Zap className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle>{t('features.easySetup.title')}</CardTitle>
                                <CardDescription>{t('features.easySetup.description')}</CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                    <Globe className="h-6 w-6 text-purple-600" />
                                </div>
                                <CardTitle>{t('features.multilingual.title')}</CardTitle>
                                <CardDescription>{t('features.multilingual.description')}</CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <FileText className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle>{t('features.smartLearning.title')}</CardTitle>
                                <CardDescription>{t('features.smartLearning.description')}</CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                                    <BarChart className="h-6 w-6 text-orange-600" />
                                </div>
                                <CardTitle>{t('features.analytics.title')}</CardTitle>
                                <CardDescription>{t('features.analytics.description')}</CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                    <Code className="h-6 w-6 text-indigo-600" />
                                </div>
                                <CardTitle>{t('features.integration.title')}</CardTitle>
                                <CardDescription>{t('features.integration.description')}</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                                    <Settings className="h-6 w-6 text-teal-600" />
                                </div>
                                <CardTitle>{t('features.customization.title')}</CardTitle>
                                <CardDescription>{t('features.customization.description')}</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <GraduationCap className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle>{t('features.education.title')}</CardTitle>
                                <CardDescription>{t('features.education.description')}</CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <ShoppingCart className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle>{t('features.ecommerce.title')}</CardTitle>
                                <CardDescription>{t('features.ecommerce.description')}</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-24 overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-pink-500/10 to-yellow-500/10 rounded-full blur-3xl" />

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-8">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            {t('cta.badge')}
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto">
                            {t('cta.title')}
                        </h2>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            {t('cta.subtitle')}
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mb-12">
                            <Link href={`/${locale}/auth/register`}>
                                <button className="h-14 px-8 rounded-xl bg-white text-blue-600 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                                    {t('cta.button')}
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </Link>
                            <Link href={`/${locale}/auth/login`}>
                                <button className="h-14 px-8 rounded-xl border-2 border-white/50 text-white font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center gap-2">
                                    {t('cta.login')}
                                </button>
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-blue-200">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <span>{t('cta.trust1')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <span>{t('cta.trust2')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <span>{t('cta.trust3')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer locale={locale} />
        </>
    )
}