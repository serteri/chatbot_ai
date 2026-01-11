import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// ✅ Düzeltme: TestTube ikonu eklendi
// ✅ Key ve TestTube ikonları eklendi
import { Bot, FileText, MessageSquare, Settings, Code, BarChart3, Shield, Palette, TestTube, Key } from 'lucide-react'
import Link from 'next/link'
import { UploadDocumentDialog } from '@/components/document/UploadDocumentDialog'
import { DeleteDocumentButton } from '@/components/document/DeleteDocumentButton'
import { ToggleActiveButton } from '@/components/chatbot/ToggleActiveButton'
import AnalyticsPage from '@/components/analytics/AnalyticsPage'
import { DomainManager } from '@/components/chatbot/DomainManager'
import { WidgetCustomizer } from '@/components/chatbot/WidgetCustomizer'
import { ChatbotSettings } from '@/components/chatbot/ChatbotSettings'
import ApiAccessPage from '@/app/[locale]/dashboard/chatbots/[chatbotId]/api-access/page'

export default async function ChatbotDetailPage({
    params,
}: {
    params: Promise<{ chatbotId: string; locale: string }>
}) {
    const { chatbotId, locale } = await params
    const t = await getTranslations({ locale })
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

    // Kullanıcının subscription bilgisini al (feature gating için)
    const subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id }
    })

    const planType = subscription?.planType || 'free'

    // Feature erişim kontrolü - flags veya plan bazlı fallback
    // Production'da feature flags kolonları henüz olmayabilir
    const hasAnalytics = (subscription as Record<string, unknown>)?.hasAnalytics === true || planType.toLowerCase().includes('enterprise') || planType !== 'free'
    const hasAdvancedAnalytics = (subscription as Record<string, unknown>)?.hasAdvancedAnalytics === true || planType.toLowerCase().includes('enterprise')
    const hasCustomBranding = (subscription as Record<string, unknown>)?.hasCustomBranding === true || planType !== 'free'
    const hasPremiumFeatures = planType !== 'free' // Pro, Business, Enterprise

    // Chatbot türünü (industry) etikete dönüştüren yardımcı fonksiyon
    const getIndustryBadge = (industry: string | null) => {
        const typeKey = industry === 'education' ? 'education' :
            industry === 'ecommerce' ? 'ecommerce' :
                'general';

        const text = t(`chatbots.type.${typeKey}`);
        let colorClass = 'bg-gray-500 hover:bg-gray-600';

        if (industry === 'education') {
            colorClass = 'bg-blue-600 hover:bg-blue-700';
        } else if (industry === 'ecommerce') {
            colorClass = 'bg-green-600 hover:bg-green-700';
        }

        return <Badge className={`text-white ${colorClass}`}>{text}</Badge>;
    }

    // Botun industry değerini URL'de kullanmak için ayarla
    const botIndustry = chatbot.industry || 'general';

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t('chatbots.backToDashboard')}
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3">
                            <Bot className="h-8 w-8 text-blue-600" />
                            <h1 className="text-3xl font-bold">{chatbot.name}</h1>
                            {getIndustryBadge(chatbot.industry)}
                            {chatbot.isActive ? (
                                <Badge className="bg-green-500">{t('chatbots.active')}</Badge>
                            ) : (
                                <Badge variant="secondary">{t('chatbots.inactive')}</Badge>
                            )}
                        </div>
                        <p className="mt-2 text-gray-600">
                            {t('chatbots.chatbotId')}: <code className="bg-gray-100 px-2 py-1 rounded">{chatbot.identifier}</code>
                        </p>
                    </div>

                    {/* ✅ Düzeltme: Sohbeti Başlat/Test Et butonu eklendi */}
                    <div className="flex space-x-2">
                        <Link
                            href={`/${locale}/widget-test?chatbotId=${chatbot.identifier}&mode=${botIndustry}`}
                            target="_blank"
                        >
                            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                                <TestTube className="mr-2 h-4 w-4" />
                                {t('chatbots.startChat')}
                            </Button>
                        </Link>

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
                        <CardTitle className="text-sm font-medium">{t('chatbots.documents')}</CardTitle>
                        <FileText className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{chatbot._count.documents}</div>
                        <p className="text-xs text-gray-600">{t('chatbots.uploadedDocuments')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('chatbots.conversations')}</CardTitle>
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{chatbot._count.conversations}</div>
                        <p className="text-xs text-gray-600">{t('chatbots.totalConversations')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('chatbots.status')}</CardTitle>
                        <Bot className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {chatbot.isPublished ? t('chatbots.published') : t('chatbots.draft')}
                        </div>
                        <p className="text-xs text-gray-600">
                            {chatbot.isPublished ? t('chatbots.visibleOnWebsite') : t('chatbots.notPublished')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="documents" className="w-full">
                <TabsList className={`grid w-full mb-8 ${hasPremiumFeatures ? 'grid-cols-6' : 'grid-cols-3'}`}>
                    <TabsTrigger value="documents">
                        <FileText className="w-4 h-4 mr-2" />
                        {t('chatbots.documents')}
                    </TabsTrigger>
                    {hasPremiumFeatures && (
                        <TabsTrigger value="analytics">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            {t('chatbots.analytics')}
                        </TabsTrigger>
                    )}
                    {hasPremiumFeatures && (
                        <TabsTrigger value="customize">
                            <Palette className="w-4 h-4 mr-2" />
                            {t('chatbots.customize')}
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="security">
                        <Shield className="w-4 h-4 mr-2" />
                        {t('chatbots.security')}
                    </TabsTrigger>
                    )}
                    {hasPremiumFeatures && (
                        <TabsTrigger value="api-access">
                            <Key className="w-4 h-4 mr-2" />
                            API Access
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="embed">
                        <Code className="w-4 h-4 mr-2" />
                        {t('chatbots.embed')}
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Settings className="w-4 h-4 mr-2" />
                        {t('settings.title')}
                    </TabsTrigger>
                </TabsList>

                {/* Documents Tab */}
                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{t('chatbots.documents')}</CardTitle>
                                    <CardDescription>{t('chatbots.documentsDesc')}</CardDescription>
                                </div>
                                <UploadDocumentDialog chatbotId={chatbotId} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {chatbot.documents.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">
                                        {t('chatbots.noDocuments')}
                                    </p>
                                    <UploadDocumentDialog
                                        chatbotId={chatbotId}
                                        trigger={
                                            <Button className="mt-4" size="sm">
                                                {t('chatbots.uploadFirstDocument')}
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
                                                            <span className="text-green-600">✓ {t('chatbots.docReady')}</span>
                                                        ) : doc.status === 'processing' ? (
                                                            <span className="text-yellow-600">⏳ {t('chatbots.docProcessing')}</span>
                                                        ) : (
                                                            <span className="text-red-600">✗ {t('chatbots.docError')}</span>
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

                {/* Analytics Tab - Pro+ only */}
                {hasPremiumFeatures && (
                    <TabsContent value="analytics">
                        <AnalyticsPage
                            chatbotId={chatbotId}
                            hasAdvancedAnalytics={hasAdvancedAnalytics}
                        />
                    </TabsContent>
                )}

                {/* Customize Tab - Pro+ only */}
                {hasPremiumFeatures && (
                    <TabsContent value="customize">
                        <WidgetCustomizer
                            chatbotId={chatbotId}
                            initialSettings={{
                                widgetPrimaryColor: chatbot.widgetPrimaryColor,
                                widgetButtonColor: chatbot.widgetButtonColor,
                                widgetTextColor: chatbot.widgetTextColor,
                                widgetPosition: chatbot.widgetPosition,
                                widgetSize: chatbot.widgetSize,
                                widgetLogoUrl: chatbot.widgetLogoUrl,
                                welcomeMessage: chatbot.welcomeMessage,
                                botName: chatbot.botName
                            }}
                        />
                    </TabsContent>
                )}

                {/* Security Tab - Pro+ only */}
                {hasPremiumFeatures && (
                    <DomainManager
                        chatbotId={chatbotId}
                        initialDomains={chatbot.allowedDomains}
                    />
                    </TabsContent>
                )}

            {/* API Access Tab */}
            {hasPremiumFeatures && (
                <TabsContent value="api-access">
                    <ApiAccessPage params={{ chatbotId, locale }} />
                </TabsContent>
            )}

            {/* Embed Tab */}
            <TabsContent value="embed">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('chatbots.embedCode')}</CardTitle>
                        <CardDescription>{t('chatbots.embedDesc')}</CardDescription>
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
                                        {t('chatbots.testWidget')}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="settings">
                <ChatbotSettings
                    chatbotId={chatbotId}
                    initialSettings={{
                        name: chatbot.name,
                        botName: chatbot.botName,
                        welcomeMessage: chatbot.welcomeMessage,
                        fallbackMessage: chatbot.fallbackMessage,
                        aiModel: chatbot.aiModel,
                        temperature: chatbot.temperature,
                        language: chatbot.language
                    }}
                />
            </TabsContent>
        </Tabs>
        </div >
    )
}