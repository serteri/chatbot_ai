import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    GraduationCap, // Eğitim için özel ikon
    MessageSquare,
    FileText,
    ArrowLeft,
    Plus,
    Play,
    Activity,
    MessageCircle,
    Settings
} from 'lucide-react'
import Link from 'next/link'
import { CreateChatbotDialog } from '@/components/chatbot/CreateChatbotDialog'
import { SearchInput } from '@/components/dashboard/SearchInput'
import { ChatbotFilter } from '@/components/dashboard/ChatbotFilter'
// Ortak kullanılan Client Component'i buraya da ekliyoruz
import { ChatbotCardActions } from '@/components/chatbot/ChatbotCardActions'

export const dynamic = 'force-dynamic'

export default async function EducationChatbotsPage(props: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ search?: string; status?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const { locale } = params
    const t = await getTranslations({ locale })
    const session = await auth()

    const query = searchParams?.search || ''
    const statusFilter = searchParams?.status || 'all'

    if (!session?.user?.id) {
        redirect('/login')
    }

    // Eğitim sektörü için filtreleme
    const whereCondition: any = {
        userId: session.user.id,
        industry: 'education', // Sadece eğitim chatbotları
        name: {
            contains: query,
            mode: 'insensitive'
        }
    }

    if (statusFilter === 'active') {
        whereCondition.isActive = true
    } else if (statusFilter === 'inactive') {
        whereCondition.isActive = false
    }

    const chatbots = await prisma.chatbot.findMany({
        where: whereCondition,
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

    const totalConversations = chatbots.reduce((sum, bot) => sum + bot._count.conversations, 0)
    const totalDocuments = chatbots.reduce((sum, bot) => sum + bot._count.documents, 0)
    const activeBots = chatbots.filter(bot => bot.isActive).length

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href={`/${locale}/dashboard`} className="group flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
                                <div className="p-1 rounded-md group-hover:bg-slate-100 mr-1">
                                    <ArrowLeft className="h-4 w-4" />
                                </div>
                                {t('dashboard.backToDashboard')}
                            </Link>
                            <div className="h-4 w-px bg-slate-200" />
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                                    <GraduationCap className="h-4 w-4" />
                                </div>
                                {/* Başlık Çevirisi: 'dashboard.educationChatbots' varsayılmıştır */}
                                <span className="font-semibold text-slate-900">{t('chatbots.educationAssistants')}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <CreateChatbotDialog
                                prefilledData={{ type: 'education', industry: 'education' }}
                                trigger={
                                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm text-white transition-all hover:scale-105">
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('chatbots.createNew')}
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* İstatistikler */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{t('chatbots.title')}</p>
                                <p className="text-2xl font-bold text-slate-900">{chatbots.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Diğer istatistik kartları genel sayfa ile aynı */}
                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{t('dashboard.activeChatbots')}</p>
                                <p className="text-2xl font-bold text-slate-900">{activeBots}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{t('chatbots.conversations')}</p>
                                <p className="text-2xl font-bold text-slate-900">{totalConversations}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{t('chatbots.documents')}</p>
                                <p className="text-2xl font-bold text-slate-900">{totalDocuments}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtre */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="w-full sm:w-96">
                        <SearchInput placeholder={t('chatbots.search')} />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <ChatbotFilter />
                    </div>
                </div>

                {/* Liste */}
                {chatbots.length === 0 ? (
                    <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="p-4 bg-white rounded-full shadow-sm mb-4 ring-1 ring-slate-100">
                                <GraduationCap className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('chatbots.noChatbots')}</h3>
                            <p className="text-slate-500 max-w-sm mb-6 text-sm">
                                {query || statusFilter !== 'all' ? t('chatbots.noFilterResults') : t('chatbots.noEducationChatbotsYet')}
                            </p>
                            {!query && statusFilter === 'all' && (
                                <CreateChatbotDialog
                                    prefilledData={{ type: 'education', industry: 'education' }}
                                    trigger={
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                            <Plus className="mr-2 h-4 w-4" />
                                            {t('chatbots.create')}
                                        </Button>
                                    }
                                />
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {chatbots.map((chatbot) => (
                            <Card key={chatbot.id} className="group hover:shadow-lg transition-all duration-200 border-slate-200 bg-white flex flex-col overflow-hidden">
                                <CardHeader className="pb-4 space-y-0 border-b border-slate-50 bg-slate-50/30">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 text-white bg-blue-600">
                                                <GraduationCap className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">
                                                    {chatbot.name}
                                                </CardTitle>
                                                <div className="mt-1.5 flex gap-2">
                                                    <Badge variant={chatbot.isActive ? "default" : "secondary"} className={`text-[10px] px-2 py-0.5 h-5 ${chatbot.isActive
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                                                        : "bg-slate-100 text-slate-500 border-slate-200"
                                                        }`}>
                                                        {chatbot.isActive ? t('chatbots.active') : t('chatbots.inactive')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* HATA ÇÖZÜMÜ: ChatbotCardActions Bileşeni */}
                                        <ChatbotCardActions
                                            chatbotId={chatbot.id}
                                            locale={locale}
                                            labels={{
                                                embed: t('chatbots.embedOnSite'),
                                                manage: t('chatbots.manage'),
                                                settings: t('chatbots.settings'),
                                                delete: t('chatbots.delete'),
                                                deleteTitle: t('chatbots.deleteTitle'),
                                                deleteDescription: t('chatbots.deleteDescription'),
                                                deleteCancel: t('chatbots.deleteCancel'),
                                                deleteConfirm: t('chatbots.deleteConfirm'),
                                                deleting: t('chatbots.deleting'),
                                                deleteSuccess: t('chatbots.deleteSuccess'),
                                                deleteError: t('chatbots.deleteError')
                                            }}
                                        />
                                    </div>
                                </CardHeader>
                                {/* Kartın geri kalan içeriği standart */}
                                <CardContent className="flex-1 flex flex-col pt-4">
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                            <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                {t('chatbots.conversations')}
                                            </div>
                                            <div className="font-bold text-slate-900 text-lg">{chatbot._count.conversations}</div>
                                        </div>
                                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                            <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                                <FileText className="w-3.5 h-3.5" />
                                                {t('chatbots.documents')}
                                            </div>
                                            <div className="font-bold text-slate-900 text-lg">{chatbot._count.documents}</div>
                                        </div>
                                    </div>
                                    <div className="mt-auto flex gap-2">
                                        <Link href={`/${locale}/dashboard/chatbots/${chatbot.id}`} className="flex-1">
                                            <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 text-slate-700 font-medium h-9">
                                                <Settings className="mr-2 h-4 w-4" />
                                                {t('manage')}
                                            </Button>
                                        </Link>
                                        <Link href={`/${locale}/widget-test?chatbotId=${chatbot.identifier}&mode=education`} target="_blank" className="flex-1">
                                            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm h-9">
                                                <Play className="mr-2 h-4 w-4" />
                                                {t('test')}
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                {/* Alt Link */}
                {chatbots.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <Link href={`/${locale}/dashboard/conversations?filter=education`}>
                            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                {t('nav.conversations')}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}