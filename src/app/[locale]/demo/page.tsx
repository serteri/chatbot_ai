import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { GraduationCap, ShoppingCart, ArrowRight, CheckCircle, MessageSquare } from 'lucide-react'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function DemoPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'home' })
    const tDemo = await getTranslations({ locale, namespace: 'home.demo' })
    const tEdu = await getTranslations({ locale, namespace: 'home.education' })
    const tEcom = await getTranslations({ locale, namespace: 'home.ecommerce' })

    return (
        <div className="min-h-screen flex flex-col">
            <PublicNav />

            <main className="flex-1 bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
                            {t('hero.titleHighlight')}
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            {t('discover.title')}
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {t('discover.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Education Chatbot */}
                        <Card className="overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-xl group bg-white">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                        <GraduationCap className="h-8 w-8 text-white" />
                                    </div>
                                    <Badge className="bg-blue-600 text-white border-none">
                                        {tDemo('badge')}
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl mb-2">
                                    {tEdu('title')}
                                </CardTitle>
                                <CardDescription className="text-base text-gray-600">
                                    {tEdu('description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-4 mb-8">
                                    <h4 className="font-semibold text-gray-900 mb-2">Includes:</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center space-x-3 text-gray-700">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span>{tEdu('feature1')}</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-gray-700">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span>{tEdu('feature2')}</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-gray-700">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span>{tEdu('feature3')}</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-gray-700">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span>{tEdu('feature4')}</span>
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/${locale}/demo/education`}>
                                    <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all">
                                        <MessageSquare className="mr-2 h-5 w-5" />
                                        {tEdu('tryFree')}
                                        <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* E-commerce Chatbot */}
                        <Card className="overflow-hidden border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-xl group bg-white">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 group-hover:from-green-100 group-hover:to-emerald-100 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                        <ShoppingCart className="h-8 w-8 text-white" />
                                    </div>
                                    <Badge className="bg-green-600 text-white border-none">
                                        {tDemo('badge')}
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl mb-2">
                                    {tEcom('title')}
                                </CardTitle>
                                <CardDescription className="text-base text-gray-600">
                                    {tEcom('description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-4 mb-8">
                                    <h4 className="font-semibold text-gray-900 mb-2">Includes:</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center space-x-3 text-gray-700">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span>{tEcom('feature1')}</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-gray-700">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span>{tEcom('feature2')}</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-gray-700">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span>{tEcom('feature3')}</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-gray-700">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span>{tEcom('feature4')}</span>
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/${locale}/demo/ecommerce`}>
                                    <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all">
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        {tEcom('tryFree')}
                                        <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer locale={locale} />
        </div>
    )
}
