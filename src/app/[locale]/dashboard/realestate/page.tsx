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
    BarChart3,
    ArrowLeft,
    Building2,
    Home,
    MapPin,
    Calendar,
    Users,
    TrendingUp,
    Star,
    Plus,
    Settings,
    MessageCircle,
    ChevronRight,
    Flame,
    ThermometerSun,
    Snowflake,
    Phone,
    Clock,
    FileSpreadsheet,
    Upload,
    Link2,
    Filter,
    DollarSign,
    Key,
    Wrench
} from 'lucide-react'
import Link from 'next/link'
import { CreateChatbotDialog } from '@/components/chatbot/CreateChatbotDialog'
import { PropertyImportSection } from '@/components/realestate/PropertyImportSection'

// Translations
const realEstateTranslations = {
    tr: {
        platformTitle: 'Emlak Asistanları',
        platformSubtitle: 'Lead Eleme & Randevu Yönetimi',
        backToMain: 'Ana Panel',
        welcomeTitle: 'Dijital Ön Büro Asistanınız',
        welcomeDescription: '7/24 çalışan, hiç uyumayan, maaş ve sigorta istemeyen, sadece ciddi alıcıları size getiren asistanınız.',
        stats: {
            activeBots: 'Aktif Asistan',
            totalLeads: 'Toplam Lead',
            hotLeads: 'Sıcak Lead',
            appointments: 'Randevu'
        },
        features: {
            leadQualification: 'Lead Eleme',
            propertyManagement: 'İlan Yönetimi',
            appointmentScheduling: 'Randevu Sistemi',
            tenantSupport: 'Kiracı Desteği'
        },
        leadQualificationDesc: 'Bütçe, zamanlama, kredi ön onayı sorularıyla ciddi alıcıları eleyin',
        propertyManagementDesc: 'İlanlarınızı yükleyin, chatbot otomatik eşleştirsin',
        appointmentSchedulingDesc: 'Takvim entegrasyonu ile otomatik randevu',
        tenantSupportDesc: 'Arıza bildirimi, kira ödeme, sözleşme soruları',
        sections: {
            leadAnalytics: 'Lead Analizi',
            properties: 'İlan Portföyü',
            chatbots: 'Emlak Asistanları'
        },
        leadCategories: {
            hot: 'Sıcak',
            warm: 'Ilık',
            cold: 'Soğuk'
        },
        importOptions: {
            title: 'İlan Yükleme Seçenekleri',
            manual: 'Manuel Ekleme',
            manualDesc: 'İlanları tek tek ekleyin',
            xml: 'XML/Feed İçe Aktarma',
            xmlDesc: 'Sahibinden, Hepsiemlak XML',
            api: 'API Entegrasyonu',
            apiDesc: 'CRM sisteminizle bağlayın'
        },
        manageChatbot: 'Yönet',
        testWidget: 'Widget Test',
        viewAnalytics: 'Analiz',
        addProperty: 'İlan Ekle',
        importProperties: 'İlanları İçe Aktar',
        noProperties: 'Henüz ilan yüklenmemiş',
        noPropertiesDesc: 'İlanlarınızı yükleyin, chatbot müşterilere otomatik öneriler sunsun',
        learnMore: 'Nasıl Çalışır?',
        leadQualifyPerformance: 'Lead eleme performansı ve dönüşüm oranları',
        leadDataEmpty: 'Lead verileri konuşmalar başladığında burada görünecek.',
        appointmentConversion: 'Randevuya Dönüşüm',
        newAssistant: 'Yeni Asistan',
        chatbotsDesc: 'Emlak web sitenize entegre edilecek chatbot asistanları',
        widgetDemo: 'Widget Demo',
        tryLiveDemo: 'Canlı demo\'yu deneyin',
        conversations: 'Konuşmalar',
        total: 'toplam',
        support: 'Destek',
        needHelp: 'Yardıma mı ihtiyacınız var?'
    },
    en: {
        platformTitle: 'Real Estate Assistants',
        platformSubtitle: 'Lead Qualification & Appointment Management',
        backToMain: 'Main Dashboard',
        welcomeTitle: 'Your Digital Front Desk Assistant',
        welcomeDescription: 'Works 24/7, never sleeps, needs no salary, only brings you serious buyers.',
        stats: {
            activeBots: 'Active Assistants',
            totalLeads: 'Total Leads',
            hotLeads: 'Hot Leads',
            appointments: 'Appointments'
        },
        features: {
            leadQualification: 'Lead Qualification',
            propertyManagement: 'Property Management',
            appointmentScheduling: 'Appointment System',
            tenantSupport: 'Tenant Support'
        },
        leadQualificationDesc: 'Filter serious buyers with budget, timing, pre-approval questions',
        propertyManagementDesc: 'Upload listings, chatbot matches automatically',
        appointmentSchedulingDesc: 'Calendar integration for automatic scheduling',
        tenantSupportDesc: 'Issue reporting, rent payment, contract questions',
        sections: {
            leadAnalytics: 'Lead Analytics',
            properties: 'Property Portfolio',
            chatbots: 'Real Estate Assistants'
        },
        leadCategories: {
            hot: 'Hot',
            warm: 'Warm',
            cold: 'Cold'
        },
        importOptions: {
            title: 'Property Import Options',
            manual: 'Manual Entry',
            manualDesc: 'Add listings one by one',
            xml: 'XML/Feed Import',
            xmlDesc: 'Import from listing portals',
            api: 'API Integration',
            apiDesc: 'Connect your CRM system'
        },
        manageChatbot: 'Manage',
        testWidget: 'Test Widget',
        viewAnalytics: 'Analytics',
        addProperty: 'Add Property',
        importProperties: 'Import Properties',
        noProperties: 'No properties uploaded yet',
        noPropertiesDesc: 'Upload your listings, chatbot will suggest them to customers automatically',
        learnMore: 'How It Works?',
        leadQualifyPerformance: 'Lead qualification performance and conversion rates',
        leadDataEmpty: 'Lead data will appear here once conversations start.',
        appointmentConversion: 'Appointment Conversion',
        newAssistant: 'New Assistant',
        chatbotsDesc: 'Chatbot assistants to integrate with your real estate website',
        widgetDemo: 'Widget Demo',
        tryLiveDemo: 'Try the live demo',
        conversations: 'Conversations',
        total: 'total',
        support: 'Support',
        needHelp: 'Need help?'
    },
    de: {
        platformTitle: 'Immobilien-Assistenten',
        platformSubtitle: 'Lead-Qualifizierung & Terminverwaltung',
        backToMain: 'Haupt-Dashboard',
        welcomeTitle: 'Ihr digitaler Empfangs-Assistent',
        welcomeDescription: 'Arbeitet 24/7, schläft nie, braucht kein Gehalt, bringt Ihnen nur seriöse Käufer.',
        stats: {
            activeBots: 'Aktive Assistenten',
            totalLeads: 'Gesamt-Leads',
            hotLeads: 'Heiße Leads',
            appointments: 'Termine'
        },
        features: {
            leadQualification: 'Lead-Qualifizierung',
            propertyManagement: 'Immobilienverwaltung',
            appointmentScheduling: 'Terminsystem',
            tenantSupport: 'Mieterbetreuung'
        },
        leadQualificationDesc: 'Filtern Sie seriöse Käufer mit Budget-, Timing- und Vorabgenehmigungsfragen',
        propertyManagementDesc: 'Laden Sie Angebote hoch, Chatbot gleicht automatisch ab',
        appointmentSchedulingDesc: 'Kalenderintegration für automatische Terminplanung',
        tenantSupportDesc: 'Problemmeldung, Mietzahlung, Vertragsfragen',
        sections: {
            leadAnalytics: 'Lead-Analytik',
            properties: 'Immobilienportfolio',
            chatbots: 'Immobilien-Assistenten'
        },
        leadCategories: {
            hot: 'Heiß',
            warm: 'Warm',
            cold: 'Kalt'
        },
        importOptions: {
            title: 'Immobilien-Importoptionen',
            manual: 'Manuelle Eingabe',
            manualDesc: 'Angebote einzeln hinzufügen',
            xml: 'XML/Feed-Import',
            xmlDesc: 'Import von Immobilienportalen',
            api: 'API-Integration',
            apiDesc: 'CRM-System verbinden'
        },
        manageChatbot: 'Verwalten',
        testWidget: 'Widget testen',
        viewAnalytics: 'Analytik',
        addProperty: 'Immobilie hinzufügen',
        importProperties: 'Immobilien importieren',
        noProperties: 'Noch keine Immobilien hochgeladen',
        noPropertiesDesc: 'Laden Sie Angebote hoch, Chatbot schlägt sie Kunden automatisch vor',
        learnMore: 'Wie funktioniert es?',
        leadQualifyPerformance: 'Lead-Qualifizierungsleistung und Konversionsraten',
        leadDataEmpty: 'Lead-Daten werden hier erscheinen, sobald Gespräche beginnen.',
        appointmentConversion: 'Terminkonversion',
        newAssistant: 'Neuer Assistent',
        chatbotsDesc: 'Chatbot-Assistenten zur Integration in Ihre Immobilien-Website',
        widgetDemo: 'Widget Demo',
        tryLiveDemo: 'Live-Demo ausprobieren',
        conversations: 'Gespräche',
        total: 'gesamt',
        support: 'Support',
        needHelp: 'Brauchen Sie Hilfe?'
    },
    fr: {
        platformTitle: 'Assistants Immobiliers',
        platformSubtitle: 'Qualification de leads & Gestion des rendez-vous',
        backToMain: 'Tableau de bord principal',
        welcomeTitle: 'Votre assistant de réception numérique',
        welcomeDescription: 'Travaille 24/7, ne dort jamais, ne demande pas de salaire, ne vous amène que des acheteurs sérieux.',
        stats: {
            activeBots: 'Assistants actifs',
            totalLeads: 'Total des leads',
            hotLeads: 'Leads chauds',
            appointments: 'Rendez-vous'
        },
        features: {
            leadQualification: 'Qualification de leads',
            propertyManagement: 'Gestion immobilière',
            appointmentScheduling: 'Système de rendez-vous',
            tenantSupport: 'Support locataire'
        },
        leadQualificationDesc: 'Filtrez les acheteurs sérieux avec des questions sur le budget, le timing, la pré-approbation',
        propertyManagementDesc: 'Téléchargez vos annonces, le chatbot fait la correspondance automatiquement',
        appointmentSchedulingDesc: 'Intégration calendrier pour planification automatique',
        tenantSupportDesc: 'Signalement de problèmes, paiement du loyer, questions contractuelles',
        sections: {
            leadAnalytics: 'Analytique des leads',
            properties: 'Portefeuille immobilier',
            chatbots: 'Assistants immobiliers'
        },
        leadCategories: {
            hot: 'Chaud',
            warm: 'Tiède',
            cold: 'Froid'
        },
        importOptions: {
            title: 'Options d\'import immobilier',
            manual: 'Entrée manuelle',
            manualDesc: 'Ajouter les annonces une par une',
            xml: 'Import XML/Feed',
            xmlDesc: 'Import depuis les portails immobiliers',
            api: 'Intégration API',
            apiDesc: 'Connecter votre système CRM'
        },
        manageChatbot: 'Gérer',
        testWidget: 'Tester Widget',
        viewAnalytics: 'Analytique',
        addProperty: 'Ajouter propriété',
        importProperties: 'Importer propriétés',
        noProperties: 'Aucune propriété téléchargée',
        noPropertiesDesc: 'Téléchargez vos annonces, le chatbot les suggérera automatiquement aux clients',
        learnMore: 'Comment ça marche?',
        leadQualifyPerformance: 'Performance de qualification des leads et taux de conversion',
        leadDataEmpty: 'Les données de leads apparaîtront ici une fois les conversations commencées.',
        appointmentConversion: 'Conversion en rendez-vous',
        newAssistant: 'Nouvel Assistant',
        chatbotsDesc: 'Assistants chatbot à intégrer à votre site immobilier',
        widgetDemo: 'Démo Widget',
        tryLiveDemo: 'Essayer la démo en direct',
        conversations: 'Conversations',
        total: 'total',
        support: 'Support',
        needHelp: 'Besoin d\'aide?'
    },
    es: {
        platformTitle: 'Asistentes Inmobiliarios',
        platformSubtitle: 'Calificación de leads y Gestión de citas',
        backToMain: 'Panel principal',
        welcomeTitle: 'Su asistente de recepción digital',
        welcomeDescription: 'Trabaja 24/7, nunca duerme, no necesita salario, solo le trae compradores serios.',
        stats: {
            activeBots: 'Asistentes activos',
            totalLeads: 'Total de leads',
            hotLeads: 'Leads calientes',
            appointments: 'Citas'
        },
        features: {
            leadQualification: 'Calificación de leads',
            propertyManagement: 'Gestión de propiedades',
            appointmentScheduling: 'Sistema de citas',
            tenantSupport: 'Soporte al inquilino'
        },
        leadQualificationDesc: 'Filtre compradores serios con preguntas de presupuesto, tiempo, pre-aprobación',
        propertyManagementDesc: 'Suba listados, el chatbot hace coincidencias automáticamente',
        appointmentSchedulingDesc: 'Integración de calendario para programación automática',
        tenantSupportDesc: 'Reporte de problemas, pago de alquiler, preguntas contractuales',
        sections: {
            leadAnalytics: 'Analítica de leads',
            properties: 'Portafolio inmobiliario',
            chatbots: 'Asistentes inmobiliarios'
        },
        leadCategories: {
            hot: 'Caliente',
            warm: 'Tibio',
            cold: 'Frío'
        },
        importOptions: {
            title: 'Opciones de importación',
            manual: 'Entrada manual',
            manualDesc: 'Agregar listados uno por uno',
            xml: 'Importar XML/Feed',
            xmlDesc: 'Importar desde portales inmobiliarios',
            api: 'Integración API',
            apiDesc: 'Conectar su sistema CRM'
        },
        manageChatbot: 'Gestionar',
        testWidget: 'Probar Widget',
        viewAnalytics: 'Analítica',
        addProperty: 'Agregar propiedad',
        importProperties: 'Importar propiedades',
        noProperties: 'Sin propiedades cargadas aún',
        noPropertiesDesc: 'Suba sus listados, el chatbot los sugerirá automáticamente a los clientes',
        learnMore: '¿Cómo funciona?',
        leadQualifyPerformance: 'Rendimiento de calificación de leads y tasas de conversión',
        leadDataEmpty: 'Los datos de leads aparecerán aquí cuando comiencen las conversaciones.',
        appointmentConversion: 'Conversión a cita',
        newAssistant: 'Nuevo Asistente',
        chatbotsDesc: 'Asistentes chatbot para integrar con su sitio web inmobiliario',
        widgetDemo: 'Demo de Widget',
        tryLiveDemo: 'Probar la demo en vivo',
        conversations: 'Conversaciones',
        total: 'total',
        support: 'Soporte',
        needHelp: '¿Necesita ayuda?'
    }
}

export default async function RealEstateDashboard({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const t = await getTranslations({ locale })
    const rt = realEstateTranslations[locale as keyof typeof realEstateTranslations] || realEstateTranslations.en
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // Fetch real estate chatbots
    const realestateChatbots = await prisma.chatbot.findMany({
        where: {
            userId: session.user.id,
            industry: 'realestate'
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

    // Calculate statistics
    const totalConversations = realestateChatbots.reduce((sum, bot) => sum + bot._count.conversations, 0)
    const totalDocuments = realestateChatbots.reduce((sum, bot) => sum + bot._count.documents, 0)
    const activeBots = realestateChatbots.filter(bot => bot.isActive).length

    // Simulated lead data (in production, this would come from a leads table)
    const userIdSeed = session.user.id.charCodeAt(0) + session.user.id.charCodeAt(session.user.id.length - 1)
    const hasData = totalConversations > 0

    // Lead statistics (simulated - would be real data in production)
    const hotLeads = hasData ? Math.floor(totalConversations * 0.15) : 0
    const warmLeads = hasData ? Math.floor(totalConversations * 0.35) : 0
    const coldLeads = hasData ? Math.floor(totalConversations * 0.50) : 0
    const totalLeads = hotLeads + warmLeads + coldLeads

    // Appointments (simulated)
    const scheduledAppointments = hasData ? Math.floor(hotLeads * 0.7 + warmLeads * 0.2) : 0

    // Property count (simulated based on documents)
    const estimatedProperties = totalDocuments * 15

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link href={`/${locale}/dashboard`} className="flex items-center text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {rt.backToMain}
                            </Link>
                            <div className="h-6 border-l border-gray-300" />
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-white">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold">{rt.platformTitle}</h1>
                                    <p className="text-sm text-muted-foreground">
                                        {rt.platformSubtitle}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Link href={`/${locale}/dashboard/analytics`}>
                                <Button variant="outline">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    {rt.viewAnalytics}
                                </Button>
                            </Link>
                            <Link href={`/${locale}/demo/realestate`}>
                                <Button className="bg-amber-600 hover:bg-amber-700">
                                    <Building2 className="mr-2 h-4 w-4" />
                                    {rt.testWidget}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-4">{rt.welcomeTitle} 🏠</h2>
                        <p className="text-xl text-amber-50 max-w-3xl mx-auto opacity-90">
                            {rt.welcomeDescription}
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur text-center border border-white/20">
                            <div className="text-3xl font-bold">{activeBots}</div>
                            <div className="text-sm text-amber-50 font-medium">{rt.stats.activeBots}</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur text-center border border-white/20">
                            <div className="text-3xl font-bold">{totalLeads}</div>
                            <div className="text-sm text-amber-50 font-medium">{rt.stats.totalLeads}</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur text-center border border-white/20">
                            <div className="text-3xl font-bold flex items-center justify-center gap-1">
                                {hotLeads}
                                {hotLeads > 0 && <Flame className="h-5 w-5 text-red-300" />}
                            </div>
                            <div className="text-sm text-amber-50 font-medium">{rt.stats.hotLeads}</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur text-center border border-white/20">
                            <div className="text-3xl font-bold flex items-center justify-center gap-1">
                                {scheduledAppointments}
                                {scheduledAppointments > 0 && <Calendar className="h-5 w-5" />}
                            </div>
                            <div className="text-sm text-amber-50 font-medium">{rt.stats.appointments}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Lead Qualification */}
                    <Card className="border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Filter className="h-4 w-4 text-amber-600" />
                                </div>
                                <CardTitle className="text-amber-900 text-base">{rt.features.leadQualification}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1">
                                    <Flame className="h-4 w-4 text-red-500" />
                                    <span className="text-sm font-bold">{hotLeads}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ThermometerSun className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm font-bold">{warmLeads}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Snowflake className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-bold">{coldLeads}</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{rt.leadQualificationDesc}</p>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                {hasData ? 'Aktif' : 'Beklemede'}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Property Management */}
                    <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Home className="h-4 w-4 text-blue-600" />
                                </div>
                                <CardTitle className="text-blue-900 text-base">{rt.features.propertyManagement}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800 mb-1">{estimatedProperties}</div>
                            <p className="text-xs text-muted-foreground mb-3">{rt.propertyManagementDesc}</p>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {estimatedProperties > 0 ? 'Aktif' : 'Boş'}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Appointment Scheduling */}
                    <Card className="border-green-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-green-600" />
                                </div>
                                <CardTitle className="text-green-900 text-base">{rt.features.appointmentScheduling}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800 mb-1">{scheduledAppointments}</div>
                            <p className="text-xs text-muted-foreground mb-3">{rt.appointmentSchedulingDesc}</p>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Google Calendar
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Tenant Support */}
                    <Card className="border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Wrench className="h-4 w-4 text-purple-600" />
                                </div>
                                <CardTitle className="text-purple-900 text-base">{rt.features.tenantSupport}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800 mb-1">7/24</div>
                            <p className="text-xs text-muted-foreground mb-3">{rt.tenantSupportDesc}</p>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                Otomatik
                            </Badge>
                        </CardContent>
                    </Card>
                </div>


                {/* Property Import Section - Client Component */}
                <PropertyImportSection
                    locale={locale}
                    chatbots={realestateChatbots.map(bot => ({ id: bot.id, name: bot.name }))}
                    translations={{
                        importOptions: rt.importOptions,
                        addProperty: rt.addProperty,
                        importProperties: rt.importProperties
                    }}
                />

                {/* Lead Analytics & Chatbots */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Lead Analytics */}
                    <Card className="flex flex-col h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-5 w-5 text-amber-600" />
                                    <CardTitle>{rt.sections.leadAnalytics}</CardTitle>
                                </div>
                                {hasData && <Badge variant="secondary" className="bg-amber-100 text-amber-800">Canlı</Badge>}
                            </div>
                            <CardDescription>
                                {rt.leadQualifyPerformance}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            {!hasData ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <BarChart3 className="h-12 w-12 mb-3 text-slate-200" />
                                    <p className="text-sm">
                                        {rt.leadDataEmpty}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Lead Distribution */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600 flex items-center gap-2">
                                                <Flame className="h-4 w-4 text-red-500" />
                                                {rt.leadCategories.hot}
                                            </span>
                                            <span className="font-bold text-red-600">{hotLeads} ({Math.round((hotLeads / totalLeads) * 100)}%)</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${(hotLeads / totalLeads) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600 flex items-center gap-2">
                                                <ThermometerSun className="h-4 w-4 text-orange-500" />
                                                {rt.leadCategories.warm}
                                            </span>
                                            <span className="font-bold text-orange-600">{warmLeads} ({Math.round((warmLeads / totalLeads) * 100)}%)</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(warmLeads / totalLeads) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600 flex items-center gap-2">
                                                <Snowflake className="h-4 w-4 text-blue-500" />
                                                {rt.leadCategories.cold}
                                            </span>
                                            <span className="font-bold text-blue-600">{coldLeads} ({Math.round((coldLeads / totalLeads) * 100)}%)</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(coldLeads / totalLeads) * 100}%` }} />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                            <span className="text-sm text-green-800">
                                                {rt.appointmentConversion}
                                            </span>
                                            <span className="font-bold text-green-700">
                                                {totalLeads > 0 ? Math.round((scheduledAppointments / totalLeads) * 100) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Chatbots Section */}
                    <Card className="flex flex-col h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Bot className="h-5 w-5 text-amber-600" />
                                    <CardTitle>{rt.sections.chatbots}</CardTitle>
                                </div>
                                <CreateChatbotDialog industry="realestate">
                                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                                        <Plus className="mr-1 h-4 w-4" />
                                        {rt.newAssistant}
                                    </Button>
                                </CreateChatbotDialog>
                            </div>
                            <CardDescription>
                                {rt.chatbotsDesc}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {realestateChatbots.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                                    <Bot className="h-12 w-12 mb-3 text-slate-200" />
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {locale === 'tr'
                                            ? 'Henüz emlak asistanı oluşturmadınız'
                                            : 'You haven\'t created a real estate assistant yet'}
                                    </p>
                                    <CreateChatbotDialog industry="realestate">
                                        <Button className="bg-amber-600 hover:bg-amber-700">
                                            <Plus className="mr-2 h-4 w-4" />
                                            {locale === 'tr' ? 'İlk Asistanı Oluştur' : 'Create First Assistant'}
                                        </Button>
                                    </CreateChatbotDialog>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {realestateChatbots.slice(0, 3).map(bot => (
                                        <div key={bot.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-2 h-2 rounded-full ${bot.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                <div>
                                                    <div className="font-medium text-sm">{bot.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {bot._count.conversations} {locale === 'tr' ? 'konuşma' : 'conversations'}
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={`/${locale}/dashboard/chatbots/${bot.id}`}>
                                                <Button size="sm" variant="outline">
                                                    {rt.manageChatbot}
                                                    <ChevronRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}

                                    {realestateChatbots.length > 3 && (
                                        <Link href={`/${locale}/dashboard/realestate/chatbots`}>
                                            <Button variant="ghost" className="w-full text-amber-700 hover:text-amber-800 hover:bg-amber-50">
                                                {locale === 'tr' ? 'Tümünü Gör' : 'View All'} ({realestateChatbots.length})
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href={`/${locale}/demo/realestate`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white">
                                    <MessageCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{rt.widgetDemo}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {rt.tryLiveDemo}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={`/${locale}/dashboard/conversations`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{rt.conversations}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {totalConversations} {rt.total}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{rt.support}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {rt.needHelp}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
