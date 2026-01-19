import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Phone, Clock, User } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const translations = {
    tr: {
        title: 'Randevu Takvimi',
        backToDashboard: 'Dashboard',
        noAppointments: 'Bu ay randevu yok',
        today: 'Bugun',
        weekDays: ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'],
        months: ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik']
    },
    en: {
        title: 'Appointment Calendar',
        backToDashboard: 'Dashboard',
        noAppointments: 'No appointments this month',
        today: 'Today',
        weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    }
}

interface Appointment {
    id: string
    name: string | null
    phone: string
    email: string | null
    appointmentDate: Date | null
    appointmentTime: string | null
    appointmentNote: string | null
    status: string
}

export default async function AppointmentsCalendarPage({
    params,
    searchParams
}: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ month?: string; year?: string }>
}) {
    const { locale } = await params
    const sp = await searchParams
    const t = translations[locale as keyof typeof translations] || translations.en
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // Get current month/year from searchParams or use current date
    const now = new Date()
    const currentYear = sp.year ? parseInt(sp.year) : now.getFullYear()
    const currentMonth = sp.month ? parseInt(sp.month) : now.getMonth()

    // Get user's chatbots
    const chatbots = await prisma.chatbot.findMany({
        where: {
            userId: session.user.id,
            industry: 'realestate'
        },
        select: { id: true }
    })

    const chatbotIds = chatbots.map(c => c.id)

    // Get appointments for the current month
    const startOfMonth = new Date(currentYear, currentMonth, 1)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)

    const appointments = await prisma.lead.findMany({
        where: {
            chatbotId: { in: chatbotIds },
            appointmentDate: {
                gte: startOfMonth,
                lte: endOfMonth
            },
            status: { not: 'appointment-cancelled' }
        },
        orderBy: { appointmentDate: 'asc' },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            appointmentDate: true,
            appointmentTime: true,
            appointmentNote: true,
            status: true
        }
    }) as Appointment[]

    // Build calendar grid
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()

    // Get the day of week for the first day (0 = Sunday, we want Monday = 0)
    let startDay = firstDayOfMonth.getDay() - 1
    if (startDay < 0) startDay = 6 // Sunday becomes 6

    // Create calendar days array
    const calendarDays: (number | null)[] = []

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day)
    }

    // Group appointments by day
    const appointmentsByDay: Record<number, Appointment[]> = {}
    appointments.forEach(appt => {
        if (appt.appointmentDate) {
            const day = new Date(appt.appointmentDate).getDate()
            if (!appointmentsByDay[day]) {
                appointmentsByDay[day] = []
            }
            appointmentsByDay[day].push(appt)
        }
    })

    // Navigation URLs
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear

    const isToday = (day: number) => {
        return day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b bg-white">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
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
                        <Link href={`/${locale}/dashboard/realestate/appointments?month=${now.getMonth()}&year=${now.getFullYear()}`}>
                            <Button variant="outline" size="sm">
                                {t.today}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <Link href={`/${locale}/dashboard/realestate/appointments?month=${prevMonth}&year=${prevYear}`}>
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {t.months[currentMonth]} {currentYear}
                    </h2>
                    <Link href={`/${locale}/dashboard/realestate/appointments?month=${nextMonth}&year=${nextYear}`}>
                        <Button variant="outline" size="icon">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {/* Calendar Grid */}
                <Card>
                    <CardContent className="p-0">
                        {/* Week day headers */}
                        <div className="grid grid-cols-7 border-b bg-gray-50">
                            {t.weekDays.map((day, i) => (
                                <div key={i} className="p-3 text-center text-sm font-medium text-gray-600 border-r last:border-r-0">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        <div className="grid grid-cols-7">
                            {calendarDays.map((day, i) => (
                                <div
                                    key={i}
                                    className={`min-h-[120px] border-r border-b last:border-r-0 p-2 ${day === null ? 'bg-gray-50' : 'bg-white'
                                        } ${isToday(day || 0) ? 'bg-green-50' : ''}`}
                                >
                                    {day !== null && (
                                        <>
                                            <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-green-600' : 'text-gray-700'
                                                }`}>
                                                {isToday(day) ? (
                                                    <span className="inline-flex items-center justify-center w-7 h-7 bg-green-600 text-white rounded-full">
                                                        {day}
                                                    </span>
                                                ) : day}
                                            </div>
                                            <div className="space-y-1">
                                                {appointmentsByDay[day]?.map(appt => (
                                                    <div
                                                        key={appt.id}
                                                        className="text-xs p-1.5 bg-amber-100 border-l-2 border-amber-500 rounded-r cursor-pointer hover:bg-amber-200 transition-colors"
                                                        title={`${appt.name} - ${appt.phone}`}
                                                    >
                                                        <div className="flex items-center gap-1 font-medium text-amber-900 truncate">
                                                            <Clock className="h-3 w-3 flex-shrink-0" />
                                                            {appt.appointmentTime || '--:--'}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-amber-800 truncate">
                                                            <User className="h-3 w-3 flex-shrink-0" />
                                                            {appt.name || 'Misafir'}
                                                        </div>
                                                        {appt.phone && (
                                                            <a
                                                                href={`tel:${appt.phone}`}
                                                                className="flex items-center gap-1 text-amber-700 hover:text-amber-900 truncate"
                                                            >
                                                                <Phone className="h-3 w-3 flex-shrink-0" />
                                                                {appt.phone}
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Summary */}
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {appointments.length} randevu bu ay
                        </Badge>
                    </div>
                    <a
                        href="https://calendar.google.com/calendar"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Google Calendar
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    )
}
