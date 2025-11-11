import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, FileText, MessageSquare, Plus } from 'lucide-react'
import { CreateChatbotDialog } from '@/components/chatbot/CreateChatbotDialog'
import { getLocale } from 'next-intl/server'

export default async function DashboardPage({
                                                params
                                            }: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const session = await auth()
    const t = await getTranslations({ locale })
    console.log('🌍 Dashboard locale:', t('dashboard.title'))
    console.log('🌍 Test translation:', t('dashboard.subtitle'))
    if (!session?.user?.id) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            subscription: true,
            chatbots: {
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            conversations: true,
                            documents: true,
                        }
                    }
                }
            }
        }
    })

    if (!user) {
        redirect('/login')
    }

    const totalChatbots = await prisma.chatbot.count({
        where: { userId: session.user.id }
    })

    const totalConversations = await prisma.conversation.count({
        where: {
            chatbot: {
                userId: session.user.id
            }
        }
    })

    const totalDocuments = await prisma.document.count({
        where: {
            chatbot: {
                userId: session.user.id
            }
        }
    })

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
                <p className="mt-2 text-gray-600">
                    {t('dashboard.subtitle')}
                </p>
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.chatbotCount')}</CardTitle>
                        <Bot className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalChatbots}</div>
                        <p className="text-xs text-gray-600">
                            {t('dashboard.limit')}: {user.subscription?.maxChatbots === -1 ? t('dashboard.unlimited') : user.subscription?.maxChatbots}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.totalConversations')}</CardTitle>
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalConversations}</div>
                        <p className="text-xs text-gray-600">
                            {t('dashboard.thisMonth')}: {user.subscription?.conversationsUsed || 0} / {user.subscription?.maxConversations === -1 ? '∞' : user.subscription?.maxConversations}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.uploadedDocuments')}</CardTitle>
                        <FileText className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDocuments}</div>
                        <p className="text-xs text-gray-600">
                            {t('dashboard.limit')}: {user.subscription?.maxDocuments === -1 ? t('dashboard.unlimited') : user.subscription?.maxDocuments}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Subscription Info */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>{t('dashboard.subscriptionInfo')}</CardTitle>
                    <CardDescription>{t('dashboard.subscriptionDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg font-semibold capitalize">
                                {user.subscription?.planType === 'free' ? t('pricing.free') : user.subscription?.planType} {t('dashboard.plan')}
                            </p>
                            <p className="text-sm text-gray-600">
                                {t('dashboard.status')}: <span className="font-medium text-green-600">{t('dashboard.active')}</span>
                            </p>
                        </div>
                        <Link href={`/${locale}/dashboard/pricing`}>
                            <Button>{t('dashboard.upgradePlan')}</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Chatbots Section */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{t('dashboard.myChatbots')}</h2>
                    <CreateChatbotDialog />
                </div>

                {user.chatbots.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Bot className="mb-4 h-16 w-16 text-gray-400" />
                            <h3 className="text-xl font-semibold">{t('dashboard.noChatbots')}</h3>
                            <p className="mt-2 text-gray-600">
                                {t('dashboard.noChatbotsDesc')}
                            </p>
                            <CreateChatbotDialog
                                trigger={
                                    <Button className="mt-4">
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('dashboard.createFirstChatbot')}
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {user.chatbots.map((chatbot) => (
                            <Card key={chatbot.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Bot className="mr-2 h-5 w-5" />
                                        {chatbot.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {chatbot.isActive ? (
                                            <span className="text-green-600">● {t('chatbots.active')}</span>
                                        ) : (
                                            <span className="text-gray-400">● {t('chatbots.inactive')}</span>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">{t('dashboard.conversation')}:</span>
                                            <span className="font-medium">{chatbot._count.conversations}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">{t('dashboard.document')}:</span>
                                            <span className="font-medium">{chatbot._count.documents}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="mt-4 w-full"
                                        size="sm"
                                        asChild
                                    >
                                        <Link href={`/${locale}/dashboard/chatbots/${chatbot.id}`}>
                                            {t('dashboard.manage')}
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}