import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Bot,
    MessageSquare,
    FileText,
    BarChart3,
    Users,
    ChevronRight,
    ShoppingCart,
    GraduationCap,
    Plus,
    ArrowRight,
    MessageCircle,
    Building2
} from 'lucide-react'
import Link from 'next/link'
import { UsageIndicator } from '@/components/dashboard/UsageIndicator'

export default async function DashboardPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const t = await getTranslations({ locale })
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // Fetch subscription data
    let subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id }
    })

    // On-demand period refresh: Free kullanıcıların süresi geçmişse yenile
    if (subscription && subscription.planType === 'free') {
        const now = new Date()
        const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null

        if (!periodEnd || periodEnd < now) {
            // Dönem geçmiş, yenile
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)

            subscription = await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    currentPeriodStart: currentMonthStart,
                    currentPeriodEnd: nextMonthStart,
                    conversationsUsed: 0 // Yeni dönem için sıfırla
                }
            })
            console.log('✅ Free subscription period auto-refreshed for:', session.user.email)
        }
    }

    // Fetch real chatbot counts
    const chatbots = await prisma.chatbot.findMany({
        where: { userId: session.user.id },
        include: {
            _count: {
                select: {
                    documents: true,
                    conversations: true,
                }
            }
        }
    })

    // Chatbotları türlerine göre filtreleme
    const educationChatbots = chatbots.filter(bot => bot.industry === 'education')
    const ecommerceChatbots = chatbots.filter(bot => bot.industry === 'ecommerce')
    const realestateChatbots = chatbots.filter(bot => bot.industry === 'realestate')
    const generalChatbots = chatbots.filter(bot => bot.industry !== 'education' && bot.industry !== 'ecommerce' && bot.industry !== 'realestate')

    const totalDocuments = chatbots.reduce((sum, bot) => sum + bot._count.documents, 0)
    const totalConversations = chatbots.reduce((sum, bot) => sum + bot._count.conversations, 0)

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section with Chatbot Type Selection */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4">{t('dashboard.chatbotTypeQuestion')}</h1>
                        <p className="text-xl text-purple-100">
                            {t('dashboard.chatbotTypeDesc')}
                        </p>
                    </div>

                    {/* Chatbot Type Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {/* Education Chatbot */}
                        <Link href={`/${locale}/dashboard/education`}>
                            <Card className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all cursor-pointer group h-full">
                                <CardContent className="p-6 text-center">
                                    <div className="w-14 h-14 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <GraduationCap className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{t('nav.educationChatbot')}</h3>
                                    <p className="text-purple-100 text-sm mb-4">
                                        {t('dashboard.educationChatbotDesc')}
                                    </p>
                                    {educationChatbots.length > 0 && (
                                        <Badge className="bg-blue-500 mb-2">
                                            {educationChatbots.length} {t('dashboard.active')}
                                        </Badge>
                                    )}
                                    <div className="flex items-center justify-center text-sm">
                                        <span>{t('dashboard.exploreEducation')}</span>
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* E-commerce Chatbot */}
                        <Link href={`/${locale}/dashboard/ecommerce`}>
                            <Card className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all cursor-pointer group h-full">
                                <CardContent className="p-6 text-center">
                                    <div className="w-14 h-14 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <ShoppingCart className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{t('nav.ecommerceChatbot')}</h3>
                                    <p className="text-purple-100 text-sm mb-4">
                                        {t('dashboard.ecommerceChatbotDesc')}
                                    </p>
                                    {ecommerceChatbots.length > 0 && (
                                        <Badge className="bg-green-500 mb-2">
                                            {ecommerceChatbots.length} {t('dashboard.active')}
                                        </Badge>
                                    )}
                                    <div className="flex items-center justify-center text-sm">
                                        <span>{t('dashboard.exploreEcommerce')}</span>
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Real Estate Chatbot */}
                        <Link href={`/${locale}/dashboard/realestate`}>
                            <Card className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all cursor-pointer group h-full">
                                <CardContent className="p-6 text-center">
                                    <div className="w-14 h-14 bg-amber-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{t('nav.realestateChatbot')}</h3>
                                    <p className="text-purple-100 text-sm mb-4">
                                        {t('dashboard.realestateChatbotDesc')}
                                    </p>
                                    {realestateChatbots.length > 0 && (
                                        <Badge className="bg-amber-500 mb-2">
                                            {realestateChatbots.length} {t('dashboard.active')}
                                        </Badge>
                                    )}
                                    <div className="flex items-center justify-center text-sm">
                                        <span>{t('dashboard.exploreRealestate')}</span>
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* General Chatbots */}
                        <Link href={`/${locale}/dashboard/chatbots`}>
                            <Card className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all cursor-pointer group h-full">
                                <CardContent className="p-6 text-center">
                                    <div className="w-14 h-14 bg-gray-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <Bot className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{t('dashboard.generalChatbots')}</h3>
                                    <p className="text-purple-100 text-sm mb-4">
                                        {t('dashboard.generalChatbotsDesc')}
                                    </p>
                                    {generalChatbots.length > 0 && (
                                        <Badge className="bg-gray-500 mb-2">
                                            {generalChatbots.length} {t('dashboard.total')}
                                        </Badge>
                                    )}
                                    <div className="flex items-center justify-center text-sm">
                                        <span>{t('dashboard.manageGeneralChatbots')}</span>
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Platform Statistics */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Usage Indicator - Only show if user has subscription */}
                {subscription && (
                    <div className="mb-8">
                        <UsageIndicator
                            locale={locale}
                            subscription={{
                                planType: subscription.planType,
                                maxChatbots: subscription.maxChatbots,
                                maxDocuments: subscription.maxDocuments,
                                maxConversations: subscription.maxConversations,
                                conversationsUsed: subscription.conversationsUsed,
                                currentPeriodEnd: subscription.currentPeriodEnd
                            }}
                            currentUsage={{
                                chatbots: chatbots.length,
                                documents: totalDocuments,
                                conversations: totalConversations
                            }}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.totalChatbots')}</CardTitle>
                            <Bot className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{chatbots.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {chatbots.filter(bot => bot.isActive).length} {t('dashboard.active')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.totalConversations')}</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalConversations}</div>
                            <p className="text-xs text-muted-foreground">
                                {t('dashboard.acrossAllBots')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.totalDocuments')}</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalDocuments}</div>
                            <p className="text-xs text-muted-foreground">
                                {t('dashboard.knowledgeBase')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.averageResponseTime')}</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2.3s</div>
                            <p className="text-xs text-muted-foreground">
                                {t('dashboard.lastMonth')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ✅ YENİ EKLENEN: Konuşmalar Sayfasına Hızlı Erişim */}
                <div className="flex justify-center mt-6">
                    <Link href={`/${locale}/dashboard/conversations`} className="w-full max-w-sm">
                        <Button variant="outline" className="w-full text-lg py-6 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-gray-300">
                            <MessageCircle className="mr-3 h-5 w-5 text-purple-600" />
                            {t('nav.conversations')}
                        </Button>
                    </Link>
                </div>

                {/* Platform Features Preview */}
                <div className="text-center mb-8 mt-12">
                    <h2 className="text-3xl font-bold mb-4">{t('dashboard.platformFeatures')}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t('dashboard.platformFeaturesDesc')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center">
                        <CardHeader>
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <GraduationCap className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-blue-900">{t('dashboard.educationFeatures')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li>• {t('dashboard.universityGuidance')}</li>
                                <li>• {t('dashboard.visaRequirements')}</li>
                                <li>• {t('dashboard.scholarshipDatabase')}</li>
                                <li>• {t('dashboard.languageSchools')}</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <ShoppingCart className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle className="text-green-900">{t('dashboard.ecommerceFeatures')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li>• {t('dashboard.productRecommendations')}</li>
                                <li>• {t('dashboard.orderTracking')}</li>
                                <li>• {t('dashboard.customerSupport')}</li>
                                <li>• {t('dashboard.salesOptimization')}</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Bot className="h-8 w-8 text-purple-600" />
                            </div>
                            <CardTitle className="text-purple-900">{t('dashboard.customChatbots')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li>• {t('dashboard.customDocuments')}</li>
                                <li>• {t('dashboard.aiModels')}</li>
                                <li>• {t('dashboard.widgetCustomization')}</li>
                                <li>• {t('dashboard.analytics')}</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}