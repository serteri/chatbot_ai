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
    ArrowLeft,
    GraduationCap,
    Globe,
    MapPin,
    BookOpen,
    Award,
    Plane,
    Languages,
    TrendingUp,
    Plus,
    MessageCircle // Konuşmalar butonu için
} from 'lucide-react'
import Link from 'next/link'
import { CreateChatbotDialog } from '@/components/chatbot/CreateChatbotDialog'

export default async function EducationDashboard({
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

    // Fetch education-specific chatbots and their documents - FIXED: use 'industry' not 'type'
    const educationChatbots = await prisma.chatbot.findMany({
        where: {
            userId: session.user.id,
            industry: 'education'  // ✅ FIXED
        },
        include: {
            documents: {
                where: { status: 'ready' },
                orderBy: { createdAt: 'desc' }
            },
            _count: {
                select: {
                    documents: true,
                    conversations: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    // Get REAL data from database
    const [
        universitiesCount,
        universitiesCountries,
        scholarshipsCount,
        scholarshipsCountries,
        languageSchoolsCount,
        languageSchoolsCountries,
        visaInfoCount,
        visaCountries
    ] = await Promise.all([
        // Universities count
        prisma.university.count(),
        // Universities unique countries
        prisma.university.groupBy({
            by: ['country'],
            _count: { country: true }
        }),
        // Scholarships count (active only)
        prisma.scholarship.count({
            where: { isActive: true }
        }),
        // Scholarships unique countries
        prisma.scholarship.groupBy({
            by: ['country'],
            where: { isActive: true },
            _count: { country: true }
        }),
        // Language Schools count
        prisma.languageSchool.count(),
        // Language Schools unique countries
        prisma.languageSchool.groupBy({
            by: ['country'],
            _count: { country: true }
        }),
        // Visa Info count
        prisma.visaInfo.count(),
        // Visa Info unique countries
        prisma.visaInfo.groupBy({
            by: ['country'],
            _count: { country: true }
        })
    ])


    // Calculate totals from REAL data
    const totalEducationConversations = educationChatbots.reduce((sum, bot) => sum + bot._count.conversations, 0)
    const totalEducationDocuments = educationChatbots.reduce((sum, bot) => sum + bot._count.documents, 0)
    const activeEducationChatbots = educationChatbots.filter(bot => bot.isActive).length
    const totalCountries = universitiesCountries.length + scholarshipsCountries.length + languageSchoolsCountries.length + visaCountries.length

    // Get all documents from education chatbots for categorization
    const allEducationDocuments = educationChatbots.flatMap(bot => bot.documents)

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link href={`/${locale}/dashboard`} className="flex items-center text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('dashboard.backToMain')}
                            </Link>
                            <div className="h-6 border-l border-gray-300" />
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold">{t('education.platformTitle')}</h1>
                                    <p className="text-sm text-muted-foreground">
                                        {t('education.platformSubtitle')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* ✅ FIXED: Added Link wrapper */}
                            <Link href={`/${locale}/demo/education`}>
                                <Button variant="outline">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    {t('education.testChatbot')}
                                </Button>
                            </Link>
                            {/* ✅ FIXED: Added Link wrapper */}
                            <Link href={`/${locale}/dashboard/visa-info`}>
                                <Button>
                                    <Globe className="mr-2 h-4 w-4" />
                                    {t('education.studentInfo')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-4">{t('education.welcomeTitle')} 👋</h2>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            {t('education.welcomeDescription')}
                        </p>
                    </div>

                    {/* Quick Stats - DYNAMIC DATA */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur text-center">
                            <div className="text-2xl font-bold">{activeEducationChatbots}</div>
                            <div className="text-sm text-blue-100">{t('education.stats.activeBots')}</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur text-center">
                            <div className="text-2xl font-bold">{totalEducationConversations}</div>
                            <div className="text-sm text-blue-100">{t('education.stats.studentQueries')}</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur text-center">
                            <div className="text-2xl font-bold">{totalCountries}+</div>
                            <div className="text-sm text-blue-100">{t('education.stats.countries')}</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur text-center">
                            <div className="text-2xl font-bold">{universitiesCount + scholarshipsCount + languageSchoolsCount}+</div>
                            <div className="text-sm text-blue-100">{t('education.stats.globalCoverage')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Platform Features Grid - ALL DYNAMIC */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    {/* Universities */}
                    <Card className="border-blue-200">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <GraduationCap className="h-4 w-4 text-blue-600" />
                                </div>
                                <CardTitle className="text-blue-900">{t('education.features.universities')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{universitiesCount}</div>
                            <p className="text-sm text-muted-foreground mb-4">{t('education.universitiesDesc')}</p>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">{t('education.database')}</Badge>
                        </CardContent>
                    </Card>

                    {/* Scholarships - ADDED */}
                    <Card className="border-yellow-200">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Award className="h-4 w-4 text-yellow-600" />
                                </div>
                                <CardTitle className="text-yellow-900">{t('education.features.scholarships')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{scholarshipsCount}</div>
                            <p className="text-sm text-muted-foreground mb-4">{t('education.scholarshipsDesc')}</p>
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('education.financialAid')}</Badge>
                        </CardContent>
                    </Card>

                    {/* Student Visa Information */}
                    <Card className="border-green-200">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Globe className="h-4 w-4 text-green-600" />
                                </div>
                                <CardTitle className="text-green-900">{t('education.features.visaInfo')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{visaInfoCount}</div>
                            <p className="text-sm text-muted-foreground mb-4">{t('education.visaDesc')}</p>
                            <Badge className="bg-green-100 text-green-800 border-green-200">{t('education.updated')}</Badge>
                        </CardContent>
                    </Card>

                    {/* Language Schools */}
                    <Card className="border-purple-200">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Languages className="h-4 w-4 text-purple-600" />
                                </div>
                                <CardTitle className="text-purple-900">{t('education.features.languageSchools')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{languageSchoolsCount}</div>
                            <p className="text-sm text-muted-foreground mb-4">{t('education.languageSchoolsDesc')}</p>
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">{t('education.updated')}</Badge>
                        </CardContent>
                    </Card>

                    {/* Platform Coverage */}
                    <Card className="border-orange-200">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-orange-600" />
                                </div>
                                <CardTitle className="text-orange-900">{t('education.features.platformCoverage')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{totalCountries}+</div>
                            <p className="text-sm text-muted-foreground mb-4">{t('education.coverageDesc')}</p>
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">{t('education.globalCoverage')}</Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Platform Features Detail - ALL BUTTONS FIXED WITH LINKS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Universities Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <GraduationCap className="h-5 w-5 text-blue-600" />
                                    <CardTitle>{t('education.sections.universities')}</CardTitle>
                                </div>
                                <Badge variant="secondary">{t('education.database')}</Badge>
                            </div>
                            <CardDescription>
                                {t('education.universitiesDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm">{t('education.recordCount')}</span>
                                    <span className="font-medium">{universitiesCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">{t('education.countryCount')}</span>
                                    <span className="font-medium">{universitiesCountries.length}</span>
                                </div>
                                <Link href={`/${locale}/dashboard/universities`}>
                                    <Button variant="outline" className="w-full mt-4">
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        {t('education.exploreUniversities')}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Scholarships Section - ADDED */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Award className="h-5 w-5 text-yellow-600" />
                                    <CardTitle>{t('education.sections.scholarships')}</CardTitle>
                                </div>
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{t('education.financialAid')}</Badge>
                            </div>
                            <CardDescription>
                                {t('education.scholarshipsDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm">{t('education.recordCount')}</span>
                                    <span className="font-medium">{scholarshipsCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">{t('education.countryCount')}</span>
                                    <span className="font-medium">{scholarshipsCountries.length}</span>
                                </div>
                                <Link href={`/${locale}/dashboard/student/scholarships`}>
                                    <Button variant="outline" className="w-full mt-4 border-yellow-200 hover:bg-yellow-50 text-yellow-800">
                                        <Award className="mr-2 h-4 w-4" />
                                        {t('education.exploreScholarships')}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visa Information Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Globe className="h-5 w-5 text-green-600" />
                                    <CardTitle>{t('education.sections.visaInfo')}</CardTitle>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">{t('education.updated')}</Badge>
                            </div>
                            <CardDescription>
                                {t('education.visaDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm">{t('education.recordCount')}</span>
                                    <span className="font-medium">{visaInfoCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">{t('education.countryCount')}</span>
                                    <span className="font-medium">{visaCountries.length}</span>
                                </div>
                                <Link href={`/${locale}/dashboard/visa-info`}>
                                    <Button variant="outline" className="w-full mt-4">
                                        <Plane className="mr-2 h-4 w-4" />
                                        {t('education.exploreVisas')}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Language Schools Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Languages className="h-5 w-5 text-purple-600" />
                                    <CardTitle>{t('education.sections.languageSchools')}</CardTitle>
                                </div>
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800">{t('education.updated')}</Badge>
                            </div>
                            <CardDescription>
                                {t('education.languageSchoolsDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm">{t('education.recordCount')}</span>
                                    <span className="font-medium">{languageSchoolsCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">{t('education.countryCount')}</span>
                                    <span className="font-medium">{languageSchoolsCountries.length}</span>
                                </div>
                                <Link href={`/${locale}/dashboard/language-schools`}>
                                    <Button variant="outline" className="w-full mt-4">
                                        <Languages className="mr-2 h-4 w-4" />
                                        {t('education.exploreLanguageSchools')}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Chatbots Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Bot className="h-5 w-5 text-blue-600" />
                                    <CardTitle>{t('education.sections.chatbots')}</CardTitle>
                                </div>
                                <Badge variant="secondary">{t('education.choose')}</Badge>
                            </div>
                            <CardDescription>
                                {t('education.chatbotsDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm">{t('education.activeChatbots')}</span>
                                    <span className="font-medium">{activeEducationChatbots}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">{t('education.totalConversations')}</span>
                                    <span className="font-medium">{totalEducationConversations}</span>
                                </div>

                                {educationChatbots.length > 0 ? (
                                    <div className="space-y-2 mt-4">
                                        {/* 1. Tüm Chatbotları Yönet Linki (GÜÇLÜ BUTON) */}
                                        <Link href={`/${locale}/dashboard/education/chatbots`}>
                                            <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
                                                <Bot className="mr-2 h-4 w-4" />
                                                {t('education.manageChatbots')} ({educationChatbots.length})
                                            </Button>
                                        </Link>
                                        {/* 2. Konuşmaları Filtreleyen Link (İKİNCİL BUTON) */}
                                        <Link href={`/${locale}/dashboard/conversations?filter=education`}>
                                            <Button variant="outline" className="w-full text-sm bg-white hover:bg-blue-50 border-blue-200">
                                                <MessageCircle className="mr-2 h-4 w-4 text-blue-600" />
                                                {t('nav.conversations')} ({totalEducationConversations})
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <CreateChatbotDialog
                                        prefilledData={{
                                            name: t('education.defaultChatbotName'),
                                            type: 'education',
                                            botName: t('education.defaultBotName'),
                                            welcomeMessage: t('education.defaultWelcomeMessage')
                                        }}
                                        trigger={
                                            <Button className="w-full mt-4">
                                                <Plus className="mr-2 h-4 w-4" />
                                                {t('education.createEducationChatbot')}
                                            </Button>
                                        }
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* EKLENEN: Boşluk ve sayfa sonu düzeltmeleri */}
                <div className="h-8"></div>
            </div>
        </div>
    )
}