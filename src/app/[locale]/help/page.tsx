import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Search, PlayCircle, CreditCard, User, Bot, Shield, MessageCircle, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getTranslations } from 'next-intl/server'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function HelpPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'help' })

    const categories = [
        {
            id: "getting-started",
            title: t('categories.gettingStarted'),
            description: t('categories.gettingStartedDesc'),
            icon: PlayCircle,
            color: "text-blue-600 bg-blue-100"
        },
        {
            id: "billing",
            title: t('categories.billing'),
            description: t('categories.billingDesc'),
            icon: CreditCard,
            color: "text-green-600 bg-green-100"
        },
        {
            id: "account",
            title: t('categories.account'),
            description: t('categories.accountDesc'),
            icon: User,
            color: "text-purple-600 bg-purple-100"
        },
        {
            id: "chatbot",
            title: t('categories.chatbot'),
            description: t('categories.chatbotDesc'),
            icon: Bot,
            color: "text-orange-600 bg-orange-100"
        },
        {
            id: "security",
            title: t('categories.security'),
            description: t('categories.securityDesc'),
            icon: Shield,
            color: "text-red-600 bg-red-100"
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />
            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-white border-b border-gray-200 py-16 md:py-24">
                    <div className="container mx-auto px-4 text-center max-w-2xl">
                        <h1 className="text-4xl font-bold text-gray-900 mb-6">{t('title')}</h1>
                        <p className="text-xl text-gray-600 mb-8">
                            {t('subtitle')}
                        </p>

                        <div className="relative max-w-lg mx-auto">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <Input
                                type="search"
                                placeholder={t('searchPlaceholder')}
                                className="pl-12 py-6 text-lg rounded-full shadow-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {categories.map((category) => (
                            <Link key={category.id} href={`/${locale}/help/${category.id}`}>
                                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                                    <CardHeader>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${category.color}`}>
                                            <category.icon className="h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-xl">{category.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600">{category.description}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Contact Support Section */}
                    <div className="mt-20 max-w-3xl mx-auto text-center bg-blue-50 rounded-2xl p-10 border border-blue-100">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
                            <MessageCircle className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('stillNeedHelp')}</h2>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                            {t('contactDesc')}
                        </p>
                        <Link href={`/${locale}/contact`}>
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                                {t('contactSupport')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
