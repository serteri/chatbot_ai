import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    ArrowLeft,
    Users,
    Flame,
    ThermometerSun,
    Snowflake,
    Phone,
    Mail,
    Calendar,
    MapPin,
    Home,
    DollarSign,
    Clock
} from 'lucide-react'
import Link from 'next/link'

const translations = {
    tr: {
        title: 'Lead Listesi',
        subtitle: 'Tüm potansiyel müşterileriniz',
        backToMain: 'Dashboard\'a Dön',
        noLeads: 'Henüz lead yok',
        noLeadsDesc: 'Chatbot konuşmaları başladığında leadler burada görünecek.',
        hot: 'Sıcak',
        warm: 'Ilık',
        cold: 'Soğuk',
        contact: 'İletişim',
        budget: 'Bütçe',
        location: 'Konum',
        timeline: 'Zamanlama',
        preApproved: 'Ön Onaylı',
        notPreApproved: 'Ön Onay Yok',
        createdAt: 'Kayıt Tarihi',
        email: 'E-posta',
        phone: 'Telefon'
    },
    en: {
        title: 'Lead List',
        subtitle: 'All your potential customers',
        backToMain: 'Back to Dashboard',
        noLeads: 'No leads yet',
        noLeadsDesc: 'Leads will appear here when chatbot conversations start.',
        hot: 'Hot',
        warm: 'Warm',
        cold: 'Cold',
        contact: 'Contact',
        budget: 'Budget',
        location: 'Location',
        timeline: 'Timeline',
        preApproved: 'Pre-Approved',
        notPreApproved: 'Not Pre-Approved',
        createdAt: 'Created',
        email: 'Email',
        phone: 'Phone'
    }
}

export default async function LeadsPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const t = translations[locale as keyof typeof translations] || translations.en
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // Fetch leads for user's real estate chatbots
    const chatbots = await prisma.chatbot.findMany({
        where: {
            userId: session.user.id,
            industry: 'realestate'
        },
        select: { id: true }
    })

    const chatbotIds = chatbots.map(c => c.id)

    const leads = await prisma.lead.findMany({
        where: {
            chatbotId: { in: chatbotIds }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
    })

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'hot':
                return <Badge className="bg-red-500 text-white"><Flame className="h-3 w-3 mr-1" />{t.hot}</Badge>
            case 'warm':
                return <Badge className="bg-orange-500 text-white"><ThermometerSun className="h-3 w-3 mr-1" />{t.warm}</Badge>
            default:
                return <Badge className="bg-blue-500 text-white"><Snowflake className="h-3 w-3 mr-1" />{t.cold}</Badge>
        }
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-AU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date))
    }

    const formatCurrency = (amount: number | null) => {
        if (!amount) return '-'
        return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-AU', {
            style: 'currency',
            currency: locale === 'tr' ? 'TRY' : 'AUD',
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link href={`/${locale}/dashboard/realestate`} className="flex items-center text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t.backToMain}
                            </Link>
                            <div className="h-6 border-l border-gray-300" />
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-white">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold">{t.title}</h1>
                                    <p className="text-sm text-muted-foreground">{t.subtitle}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {leads.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <Users className="h-16 w-16 text-slate-200 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">{t.noLeads}</h3>
                            <p className="text-sm text-muted-foreground">{t.noLeadsDesc}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {leads.map((lead) => (
                            <Card key={lead.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="font-semibold text-lg">{lead.name || 'Anonim'}</h3>
                                                {getCategoryBadge(lead.category || 'cold')}
                                                {lead.score && (
                                                    <Badge variant="outline">{lead.score} puan</Badge>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                {/* Contact */}
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="h-4 w-4" />
                                                    <span>{lead.email || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="h-4 w-4" />
                                                    <span>{lead.phone || '-'}</span>
                                                </div>

                                                {/* Budget */}
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span>{formatCurrency(lead.budgetMax)}</span>
                                                </div>

                                                {/* Location */}
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{lead.location || '-'}</span>
                                                </div>

                                                {/* Property Type */}
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Home className="h-4 w-4" />
                                                    <span>{lead.propertyType || '-'}</span>
                                                </div>

                                                {/* Timeline */}
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{lead.timeline || '-'}</span>
                                                </div>

                                                {/* Pre-Approval */}
                                                <div className="flex items-center gap-2">
                                                    {lead.hasPreApproval ? (
                                                        <Badge className="bg-green-100 text-green-700">{t.preApproved}</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-slate-500">{t.notPreApproved}</Badge>
                                                    )}
                                                </div>

                                                {/* Created At */}
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(lead.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
