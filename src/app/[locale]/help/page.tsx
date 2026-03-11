import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { PlayCircle, CreditCard, User, Shield, MessageCircle, FileText, ClipboardCheck, TrendingUp, HelpCircle } from 'lucide-react'
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
    const tContact = await getTranslations({ locale })

    const faqs = [
        {
            question: tContact('contact.faq.q1'),
            answer: tContact('contact.faq.a1')
        },
        {
            question: tContact('contact.faq.q2'),
            answer: tContact('contact.faq.a2')
        },
        {
            question: tContact('contact.faq.q3'),
            answer: tContact('contact.faq.a3')
        },
        {
            question: tContact('contact.faq.q4'),
            answer: tContact('contact.faq.a4')
        }
    ]

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
            id: "security",
            title: t('categories.security'),
            description: t('categories.securityDesc'),
            icon: Shield,
            color: "text-red-600 bg-red-100"
        },
        {
            id: "price-guide",
            title: t('categories.priceGuide'),
            description: t('categories.priceGuideDesc'),
            icon: TrendingUp,
            color: "text-indigo-600 bg-indigo-100"
        },
        {
            id: "audit",
            title: t('categories.audit'),
            description: t('categories.auditDesc'),
            icon: ClipboardCheck,
            color: "text-teal-600 bg-teal-100"
        },
        {
            id: "compliance",
            title: t('categories.compliance'),
            description: t('categories.complianceDesc'),
            icon: FileText,
            color: "text-orange-600 bg-orange-100"
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

                        <div className="flex justify-center">
                            <Link href={`/${locale}/contact`}>
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full text-lg shadow-lg">
                                    {t('contactSupport')}
                                </Button>
                            </Link>
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

                {/* FAQ Section */}
                <div className="mt-24 max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            {tContact('contact.faq.title')}
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {faq.question}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
