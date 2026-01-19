'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Phone, Clock, User, Loader2 } from 'lucide-react'
import { AppointmentDetailModal } from '@/components/realestate/AppointmentDetailModal'

const translations = {
    tr: {
        title: 'Randevu Takvimi',
        backToDashboard: 'Dashboard',
        noAppointments: 'Bu ay randevu yok',
        today: 'Bugün',
        weekDays: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
        months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
        appointments: 'randevu bu ay',
        loading: 'Yükleniyor...'
    },
    en: {
        title: 'Appointment Calendar',
        backToDashboard: 'Dashboard',
        noAppointments: 'No appointments this month',
        today: 'Today',
        weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        appointments: 'appointments this month',
        loading: 'Loading...'
    }
}

interface Appointment {
    id: string
    name: string | null
    phone: string
    email: string | null
    appointmentDate: string | null
    appointmentTime: string | null
    appointmentNote: string | null
    status: string
}

export default function AppointmentsCalendarPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const locale = (params.locale as string) || 'en'
    const t = translations[locale as keyof typeof translations] || translations.en

    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

    const now = new Date()
    const currentYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : now.getFullYear()
    const currentMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!) : now.getMonth()

    // Navigation
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear

    useEffect(() => {
        fetchAppointments()
    }, [currentMonth, currentYear])

    const fetchAppointments = async () => {
        try {
            const response = await fetch(`/api/appointments?month=${currentMonth}&year=${currentYear}`)
            if (response.ok) {
                const data = await response.json()
                setAppointments(data.appointments || [])
            }
        } catch (error) {
            console.error('Error fetching appointments:', error)
        } finally {
            setLoading(false)
        }
    }

    // Build calendar grid
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()

    let startDay = firstDayOfMonth.getDay() - 1
    if (startDay < 0) startDay = 6

    const calendarDays: (number | null)[] = []
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(null)
    }
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
                                <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {t.backToDashboard}
                                </button>
                            </Link>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-green-600" />
                                <h1 className="text-xl font-semibold">{t.title}</h1>
                            </div>
                        </div>
                        <Link href={`/${locale}/dashboard/realestate/appointments?month=${now.getMonth()}&year=${now.getFullYear()}`}>
                            <button className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                {t.today}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <Link href={`/${locale}/dashboard/realestate/appointments?month=${prevMonth}&year=${prevYear}`}>
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {t.months[currentMonth]} {currentYear}
                    </h2>
                    <Link href={`/${locale}/dashboard/realestate/appointments?month=${nextMonth}&year=${nextYear}`}>
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </Link>
                </div>

                {/* Calendar Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        <span className="ml-2 text-gray-500">{t.loading}</span>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
                                                        onClick={() => setSelectedLeadId(appt.id)}
                                                        className="text-xs p-1.5 bg-amber-100 border-l-2 border-amber-500 rounded-r cursor-pointer hover:bg-amber-200 hover:shadow-md transition-all transform hover:scale-[1.02]"
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
                                                            <div className="flex items-center gap-1 text-amber-700 truncate">
                                                                <Phone className="h-3 w-3 flex-shrink-0" />
                                                                {appt.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Summary */}
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                            {appointments.length} {t.appointments}
                        </span>
                    </div>
                    <a
                        href="https://calendar.google.com/calendar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Google Calendar
                    </a>
                </div>
            </div>

            {/* Appointment Detail Modal */}
            {selectedLeadId && (
                <AppointmentDetailModal
                    leadId={selectedLeadId}
                    onClose={() => setSelectedLeadId(null)}
                    locale={locale}
                />
            )}
        </div>
    )
}
