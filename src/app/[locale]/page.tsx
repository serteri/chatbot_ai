import { PublicNav } from '@/components/layout/PublicNav'
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
    CheckCircle
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

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div>
                                    <div className="text-3xl font-bold">150+</div>
                                    <div className="text-blue-200">
                                        {t('stats.usersLabel')}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">70+</div>
                                    <div className="text-blue-200">
                                        {t('stats.satisfactionLabel')}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">24/7</div>
                                    <div className="text-blue-200">
                                        {t('stats.supportLabel')}
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                                <div className="space-y-4 mb-6">
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
                                <div className="space-y-4 mb-6">
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

                                <Link href={`/${locale}/demo/ecommerce`}>
                                    <Button className="w-full bg-green-600 hover:bg-green-700">
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        {t('ecommerce.tryFree')}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-4">
                            {t('cta.title')}
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            {t('cta.subtitle')}
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href={`/${locale}/auth/register`}>
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                    {t('cta.button')}
                                </Button>
                            </Link>
                            <Link href={`/${locale}/auth/login`}>
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                    {t('cta.login')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}