import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, User, Clock, ChevronRight } from 'lucide-react'

export default async function ConversationsPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // Konuşmaları getir
    const conversations = await prisma.conversation.findMany({
        where: {
            chatbot: {
                userId: session.user.id
            }
        },
        include: {
            chatbot: {
                select: {
                    name: true,
                    botName: true
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Konuşmalar</h1>
                <p className="text-gray-600 mt-2">Tüm chatbot konuşmalarınızı görüntüleyin</p>
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Konuşma</CardTitle>
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{conversations.length}</div>
                        <p className="text-xs text-gray-600">Son 50 konuşma</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aktif</CardTitle>
                        <MessageSquare className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {conversations.filter(c => c.status === 'active').length}
                        </div>
                        <p className="text-xs text-gray-600">Devam eden</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {conversations.filter(c => c.status === 'completed').length}
                        </div>
                        <p className="text-xs text-gray-600">Bitmiş</p>
                    </CardContent>
                </Card>
            </div>

            {/* Konuşmalar Listesi */}
            <Card>
                <CardHeader>
                    <CardTitle>Tüm Konuşmalar</CardTitle>
                    <CardDescription>Son konuşmalarınız</CardDescription>
                </CardHeader>
                <CardContent>
                    {conversations.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Henüz konuşma yok</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {conversations.map((conv) => (
                                <Link
                                    key={conv.id}
                                    href={`/conversations/${conv.id}`}
                                    className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <Badge variant="secondary">
                                                    {conv.chatbot.name}
                                                </Badge>
                                                <Badge
                                                    variant={conv.status === 'active' ? 'default' : 'outline'}
                                                    className={conv.status === 'active' ? 'bg-green-500' : ''}
                                                >
                                                    {conv.status === 'active' ? 'Aktif' : 'Tamamlandı'}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    {conv.visitorId.substring(0, 12)}...
                                                </div>
                                                <div className="flex items-center">
                                                    <MessageSquare className="h-4 w-4 mr-1" />
                                                    {conv._count.messages} mesaj
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {new Date(conv.createdAt).toLocaleString('tr-TR')}
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