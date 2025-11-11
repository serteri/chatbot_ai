import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, MessageSquare, FileText } from 'lucide-react'
import Link from 'next/link'
import { CreateChatbotDialog } from '@/components/chatbot/CreateChatbotDialog'

export default async function ChatbotsPage({
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

    const chatbots = await prisma.chatbot.findMany({
        where: { userId: session.user.id },
        include: {
            _count: {
                select: {
                    conversations: true,
                    documents: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('chatbots.title')}</h1>
                    <p className="mt-2 text-gray-600">{t('chatbots.subtitle')}</p>
                </div>
                <CreateChatbotDialog />
            </div>

            {chatbots.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Bot className="mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="text-xl font-semibold">{t('dashboard.noChatbots')}</h3>
                        <p className="mt-2 text-gray-600 text-center max-w-md">
                            {t('dashboard.noChatbotsDesc')}
                        </p>
                        <CreateChatbotDialog
                            trigger={
                                <Button className="mt-6" size="lg">
                                    {t('dashboard.createChatbot')}
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {chatbots.map((chatbot) => (
                        <Card key={chatbot.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center">
                                        <Bot className="mr-2 h-5 w-5 text-blue-600" />
                                        {chatbot.name}
                                    </CardTitle>
                                    {chatbot.isActive ? (
                                        <Badge className="bg-green-500">{t('chatbots.active')}</Badge>
                                    ) : (
                                        <Badge variant="secondary">{t('chatbots.inactive')}</Badge>
                                    )}
                                </div>
                                <CardDescription>
                                    {t('chatbots.chatbotId')}: {chatbot.identifier}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            {t('chatbots.conversations')}
                                        </div>
                                        <span className="font-semibold">{chatbot._count.conversations}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <FileText className="mr-2 h-4 w-4" />
                                            {t('chatbots.documents')}
                                        </div>
                                        <span className="font-semibold">{chatbot._count.documents}</span>
                                    </div>
                                </div>
                                <Button
                                    className="mt-4 w-full"
                                    variant="outline"
                                    asChild
                                >
                                    <Link href={`/${locale}/chatbots/${chatbot.id}`}>
                                        {t('dashboard.manage')}
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}