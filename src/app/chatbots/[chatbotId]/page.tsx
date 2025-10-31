import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, FileText, MessageSquare, Settings, Code, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { UploadDocumentDialog } from '@/components/document/UploadDocumentDialog'
import { DeleteDocumentButton } from '@/components/document/DeleteDocumentButton'
import { ToggleActiveButton } from '@/components/chatbot/ToggleActiveButton'
import AnalyticsPage from '@/components/analytics/AnalyticsPage'

export default async function ChatbotDetailPage({
                                                    params,
                                                }: {
    params: Promise<{ chatbotId: string }>
}) {
    const { chatbotId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const chatbot = await prisma.chatbot.findUnique({
        where: { id: chatbotId },
        include: {
            documents: {
                orderBy: { createdAt: 'desc' },
                take: 10
            },
            _count: {
                select: {
                    documents: true,
                    conversations: true,
                }
            }
        }
    })

    if (!chatbot) {
        redirect('/dashboard')
    }

    if (chatbot.userId !== session.user.id) {
        redirect('/dashboard')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3">
                            <Bot className="h-8 w-8 text-blue-600" />
                            <h1 className="text-3xl font-bold">{chatbot.name}</h1>
                            {chatbot.isActive ? (
                                <Badge className="bg-green-500">Aktif</Badge>
                            ) : (
                                <Badge variant="secondary">Pasif</Badge>
                            )}
                        </div>
                        <p className="mt-2 text-gray-600">
                            Chatbot ID: <code className="bg-gray-100 px-2 py-1 rounded">{chatbot.identifier}</code>
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <Settings className="mr-2 h-4 w-4" />
                            Ayarlar
                        </Button>
                        <ToggleActiveButton
                            chatbotId={chatbot.id}
                            initialIsActive={chatbot.isActive}
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dokümanlar</CardTitle>
                        <FileText className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{chatbot._count.documents}</div>
                        <p className="text-xs text-gray-600">Yüklenmiş doküman</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Konuşmalar</CardTitle>
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{chatbot._count.conversations}</div>
                        <p className="text-xs text-gray-600">Toplam konuşma</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Durum</CardTitle>
                        <Bot className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {chatbot.isPublished ? 'Yayında' : 'Taslak'}
                        </div>
                        <p className="text-xs text-gray-600">
                            {chatbot.isPublished ? 'Website\'de görünür' : 'Henüz yayınlanmadı'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="documents" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="documents">
                        <FileText className="w-4 h-4 mr-2" />
                        Dokümanlar
                    </TabsTrigger>
                    <TabsTrigger value="analytics">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="embed">
                        <Code className="w-4 h-4 mr-2" />
                        Embed
                    </TabsTrigger>
                </TabsList>

                {/* Documents Tab */}
                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Dokümanlar</CardTitle>
                                    <CardDescription>AI\'ın öğreneceği belgeler</CardDescription>
                                </div>
                                <UploadDocumentDialog chatbotId={chatbotId} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {chatbot.documents.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">
                                        Henüz doküman yüklenmedi
                                    </p>
                                    <UploadDocumentDialog
                                        chatbotId={chatbotId}
                                        trigger={
                                            <Button className="mt-4" size="sm">
                                                İlk Dokümanı Yükle
                                            </Button>
                                        }
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {chatbot.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between border rounded-lg p-3"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium text-sm">{doc.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {doc.status === 'ready' ? (
                                                            <span className="text-green-600">✓ Hazır</span>
                                                        ) : doc.status === 'processing' ? (
                                                            <span className="text-yellow-600">⏳ İşleniyor</span>
                                                        ) : (
                                                            <span className="text-red-600">✗ Hata</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <DeleteDocumentButton
                                                documentId={doc.id}
                                                documentName={doc.name}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
                    <AnalyticsPage chatbotId={chatbotId} />
                </TabsContent>

                {/* Embed Tab */}
                <TabsContent value="embed">
                    <Card>
                        <CardHeader>
                            <CardTitle>Embed Kodu</CardTitle>
                            <CardDescription>Bu kodu website\'nize ekleyin</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="rounded-lg bg-gray-900 p-4">
                                    <code className="text-sm text-green-400 break-all">
                                        {`<script src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/widget.js?id=${chatbot.identifier}"></script>`}
                                    </code>
                                </div>
                                <div className="flex space-x-2">
                                    <Button className="flex-1" variant="outline" asChild>
                                        <Link href="/widget-test" target="_blank">
                                            <Code className="mr-2 h-4 w-4" />
                                            Test Et
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}