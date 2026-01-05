import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, User, Clock, ChevronRight, GraduationCap, ShoppingCart, Bot } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs' // Tabs import edildi

// Çeviri anahtarlarını statik olarak getir
import { getFormatter } from 'next-intl/server'

interface ConversationsPageProps {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ filter?: string }>
}

export default async function ConversationsPage({
                                                    params,
                                                    searchParams,
                                                }: ConversationsPageProps) {
    const { locale } = await params
    const searchParamsResolved = await searchParams
    const t = await getTranslations({ locale })
    const format = await getFormatter({ locale })

    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // URL'den filtre parametresini al
    const currentFilter = searchParamsResolved.filter || 'all';

    // Filtreleme koşulunu hazırla
    let industryFilter: { industry?: string | null } = {};

    if (currentFilter === 'education') {
        industryFilter = { industry: 'education' };
    } else if (currentFilter === 'ecommerce') {
        industryFilter = { industry: 'ecommerce' };
    } else if (currentFilter === 'general') {
        // Ne education ne de ecommerce olanları filtrele
        industryFilter = { NOT: { industry: { in: ['education', 'ecommerce'] } } };
    }

    // Konuşmaları getir (Filtre uygulandı)
    const conversations = await prisma.conversation.findMany({
        where: {
            chatbot: {
                userId: session.user.id,
                ...industryFilter // ✅ Filtre koşulunu ekledik
            }
        },
        include: {
            chatbot: {
                select: {
                    name: true,
                    botName: true,
                    industry: true // ✅ Chatbot türünü çekiyoruz
                }
            },
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' }
            },
            _count: {
                select: { messages: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    })

    // Toplam istatistikler için TÜM konuşmaları çekiyoruz (ya da cache'ten/ayrı sorguyla)
    // Basitlik için, istatistikleri mevcut filtrelenmiş konuşmalardan hesaplayalım:
    const totalConversationsCount = conversations.length;
    const activeCount = conversations.filter(c => c.status === 'active').length;
    const completedCount = conversations.filter(c => c.status === 'completed').length;

    // Sektör Etiketi için yardımcı fonksiyon
    const getIndustryIcon = (industry: string | null) => {
        if (industry === 'education') return <GraduationCap className="h-4 w-4 mr-1 text-blue-600" />;
        if (industry === 'ecommerce') return <ShoppingCart className="h-4 w-4 mr-1 text-green-600" />;
        return <Bot className="h-4 w-4 mr-1 text-gray-600" />;
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{t('conversations.title')}</h1>
                <p className="text-gray-600 mt-2">{t('conversations.subtitle')}</p>
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('conversations.total')}</CardTitle>
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalConversationsCount}</div>
                        <p className="text-xs text-gray-600">{t('conversations.last50')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('conversations.active')}</CardTitle>
                        <MessageSquare className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount}</div>
                        <p className="text-xs text-gray-600">{t('conversations.ongoing')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('conversations.completed')}</CardTitle>
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedCount}</div>
                        <p className="text-xs text-gray-600">{t('conversations.finished')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* ✅ DÜZELTME: Konuşma Filtreleme (Tabs) */}
            <Tabs value={currentFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-fit mb-4">
                    <Link href={`/${locale}/dashboard/conversations`}>
                        <TabsTrigger value="all" className="w-full">
                            {t('conversations.filter.all')}
                        </TabsTrigger>
                    </Link>
                    <Link href={`/${locale}/dashboard/conversations?filter=education`}>
                        <TabsTrigger value="education" className="w-full">
                            {t('conversations.filter.education')}
                        </TabsTrigger>
                    </Link>
                    <Link href={`/${locale}/dashboard/conversations?filter=ecommerce`}>
                        <TabsTrigger value="ecommerce" className="w-full">
                            {t('conversations.filter.ecommerce')}
                        </TabsTrigger>
                    </Link>
                    <Link href={`/${locale}/dashboard/conversations?filter=general`}>
                        <TabsTrigger value="general" className="w-full">
                            {t('conversations.filter.general')}
                        </TabsTrigger>
                    </Link>
                </TabsList>
            </Tabs>


            {/* Konuşmalar Listesi */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('conversations.allConversations')}</CardTitle>
                    <CardDescription>{t('conversations.recentConversations')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {totalConversationsCount === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">
                                {currentFilter === 'all' ? t('conversations.noConversations') : t('conversations.noFilteredConversations')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {conversations.map((conv) => (
                                <Link
                                    key={conv.id}
                                    href={`/${locale}/conversations/${conv.id}`}
                                    className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                {/* ✅ Geliştirme: Sektör İkonu Ekle */}
                                                {getIndustryIcon(conv.chatbot.industry)}

                                                <Badge variant="secondary" className="bg-slate-100">
                                                    {conv.chatbot.name}
                                                </Badge>
                                                <Badge
                                                    variant={conv.status === 'active' ? 'default' : 'outline'}
                                                    className={conv.status === 'active' ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-gray-300'}
                                                >
                                                    {conv.status === 'active' ? t('conversations.active') : t('conversations.completed')}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    {conv.visitorId.substring(0, 12)}...
                                                </div>
                                                <div className="flex items-center">
                                                    <MessageSquare className="h-4 w-4 mr-1" />
                                                    {conv._count.messages} {t('conversations.messages')}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {new Date(conv.createdAt).toLocaleString()}
                                                </div>
                                            </div>

                                            {conv.messages[0] && (
                                                <p className="text-sm text-gray-700 line-clamp-2">
                                                    {conv.messages[0].content}
                                                </p>
                                            )}
                                        </div>

                                        <ChevronRight className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}