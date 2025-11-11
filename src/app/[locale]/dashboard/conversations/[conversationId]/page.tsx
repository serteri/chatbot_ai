
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Bot } from 'lucide-react'

export default async function ConversationDetailPage({
                                                         params
                                                     }: {
    params: Promise<{ conversationId: string; locale: string }>
}) {
    const { conversationId, locale } = await params
    const t = await getTranslations({ locale })
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // Konuşmayı getir
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            chatbot: {
                select: {
                    id: true,
                    name: true,
                    botName: true,
                    userId: true
                }
            },
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        }
    })

    if (!conversation) {
        redirect(`/${locale}/conversations`)
    }

    // Sahiplik kontrolü
    if (conversation.chatbot.userId !== session.user.id) {
        redirect(`/${locale}/conversations`)
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <Link href={`/${locale}/conversations`}>
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('conversations.back')}
                    </Button>
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{t('conversations.detail')}</h1>
                        <p className="text-gray-600 mt-1">
                            {conversation.chatbot.name}
                        </p>
                    </div>
                    <Badge
                        variant={conversation.status === 'active' ? 'default' : 'outline'}
                        className={conversation.status === 'active' ? 'bg-green-500' : ''}
                    >
                        {conversation.status === 'active' ? t('conversations.active') : t('conversations.completed')}
                    </Badge>
                </div>
            </div>

            {/* Info Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">{t('conversations.info')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">{t('conversations.visitorId')}</p>
                            <p className="font-medium">{conversation.visitorId}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">{t('conversations.messageCount')}</p>
                            <p className="font-medium">{conversation.messages.length}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">{t('conversations.started')}</p>
                            <p className="font-medium">
                                {new Date(conversation.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">{t('conversations.lastUpdate')}</p>
                            <p className="font-medium">
                                {new Date(conversation.updatedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Messages */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('conversations.messagesTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {conversation.messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%]`}>
                                    <div className="flex items-center space-x-2 mb-1">
                                        {message.role === 'user' ? (
                                            <User className="h-4 w-4 text-gray-600" />
                                        ) : (
                                            <Bot className="h-4 w-4 text-blue-600" />
                                        )}
                                        <span className="text-xs font-medium text-gray-600">
                                            {message.role === 'user' ? t('conversations.visitor') : conversation.chatbot.botName}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(message.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div
                                        className={`rounded-lg px-4 py-3 ${
                                            message.role === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                        {message.confidence !== null && message.confidence > 0 && (
                                            <div className="mt-2 pt-2 border-t border-gray-300">
                                                <p className="text-xs opacity-75">
                                                    {t('conversations.confidence')}: %{Math.round(message.confidence * 100)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}