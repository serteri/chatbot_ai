import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Clock, Phone, Mail, User, MapPin, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const translations = {
    tr: {
        title: 'Randevular',
        backToDashboard: 'Dashboard',
        noAppointments: 'Henuz randevu yok',
        noAppointmentsDesc: 'Randevular chatbot uzerinden alindiginda burada gorunecek',
        upcoming: 'Gelecek',
        past: 'Gecmis',
        cancelled: 'Iptal',
        viewInCalendar: 'Takvimde Gor',
        call: 'Ara',
        email: 'Email'
    },
    en: {
        title: 'Appointments',
        backToDashboard: 'Dashboard',
        noAppointments: 'No appointments yet',
        noAppointmentsDesc: 'Appointments will appear here when booked through the chatbot',
        upcoming: 'Upcoming',
        past: 'Past',
        cancelled: 'Cancelled',
        viewInCalendar: 'View in Calendar',
        call: 'Call',
        email: 'Email'
    }
}

export default async function AppointmentsPage({
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

    // Get user's chatbots
    const chatbots = await prisma.chatbot.findMany({
        where: {
            userId: session.user.id,
            industry: 'realestate'
        },
        select: { id: true, googleCalendarId: true }
    })

    const chatbotIds = chatbots.map(c => c.id)

    // Get all appointments (leads with appointmentDate)
    const appointments = await prisma.lead.findMany({
        where: {
            chatbotId: { in: chatbotIds },
            OR: [
                { appointmentDate: { not: null } },
                { status: 'appointment-cancelled' }
            ]
        },
        orderBy: { appointmentDate: 'desc' },
        include: {
            chatbot: {
                select: { name: true, googleCalendarId: true }
            }
        }
    })

    const now = new Date()
    const upcomingAppointments = appointments.filter(a =>
        a.appointmentDate && new Date(a.appointmentDate) >= now && a.status !== 'appointment-cancelled'
    )
    const pastAppointments = appointments.filter(a =>
        a.appointmentDate && new Date(a.appointmentDate) < now && a.status !== 'appointment-cancelled'
    )
    const cancelledAppointments = appointments.filter(a =>
        a.status === 'appointment-cancelled'
    )

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date)
    }

    const formatTime = (time: string | null, date: Date | null) => {
        if (time) return time
        if (date) {
            return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }).format(date)
        }
        return '--:--'
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b bg-white">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/${locale}/dashboard/realestate`}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t.backToDashboard}
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-green-600" />
                            <h1 className="text-xl font-semibold">{t.title}</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {appointments.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-700 mb-2">{t.noAppointments}</h3>
                            <p className="text-gray-500">{t.noAppointmentsDesc}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {/* Upcoming Appointments */}
                        {upcomingAppointments.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-800">{t.upcoming}</Badge>
                                    <span className="text-gray-500 text-sm">({upcomingAppointments.length})</span>
                                </h2>
                                <div className="grid gap-4">
                                    {upcomingAppointments.map(appt => (
                                        <Card key={appt.id} className="border-l-4 border-l-green-500">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-500" />
                                                            <span className="font-medium">{appt.name || 'Isimsiz'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {appt.appointmentDate ? formatDate(new Date(appt.appointmentDate)) : '-'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-4 w-4" />
                                                                {formatTime(appt.appointmentTime, appt.appointmentDate)}
                                                            </span>
                                                        </div>
                                                        {appt.phone && (
                                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                <Phone className="h-4 w-4" />
                                                                {appt.phone}
                                                            </div>
                                                        )}
                                                        {appt.email && (
                                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                <Mail className="h-4 w-4" />
                                                                {appt.email}
                                                            </div>
                                                        )}
                                                        {appt.appointmentNote && (
                                                            <p className="text-sm text-gray-500 mt-2">{appt.appointmentNote}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {appt.phone && (
                                                            <a href={`tel:${appt.phone}`}>
                                                                <Button variant="outline" size="sm">
                                                                    <Phone className="h-4 w-4 mr-1" />
                                                                    {t.call}
                                                                </Button>
                                                            </a>
                                                        )}
                                                        {appt.chatbot.googleCalendarId && (
                                                            <a
                                                                href={`https://calendar.google.com/calendar`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Button variant="outline" size="sm">
                                                                    <ExternalLink className="h-4 w-4 mr-1" />
                                                                    {t.viewInCalendar}
                                                                </Button>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Past Appointments */}
                        {pastAppointments.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Badge variant="secondary">{t.past}</Badge>
                                    <span className="text-gray-500 text-sm">({pastAppointments.length})</span>
                                </h2>
                                <div className="grid gap-4 opacity-75">
                                    {pastAppointments.slice(0, 10).map(appt => (
                                        <Card key={appt.id} className="border-l-4 border-l-gray-300">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-500" />
                                                            <span className="font-medium">{appt.name || 'Isimsiz'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {appt.appointmentDate ? formatDate(new Date(appt.appointmentDate)) : '-'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-4 w-4" />
                                                                {formatTime(appt.appointmentTime, appt.appointmentDate)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cancelled Appointments */}
                        {cancelledAppointments.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Badge variant="destructive">{t.cancelled}</Badge>
                                    <span className="text-gray-500 text-sm">({cancelledAppointments.length})</span>
                                </h2>
                                <div className="grid gap-4 opacity-60">
                                    {cancelledAppointments.slice(0, 5).map(appt => (
                                        <Card key={appt.id} className="border-l-4 border-l-red-300">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <span className="font-medium line-through">{appt.name || 'Isimsiz'}</span>
                                                    <span className="text-sm text-red-500">{appt.appointmentNote}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
