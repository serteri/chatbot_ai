'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, Clock, User, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const translations: Record<string, Record<string, string>> = {
    tr: {
        title: 'Randevu İptal',
        loading: 'Randevu bilgileri yükleniyor...',
        appointmentDetails: 'Randevu Detayları',
        date: 'Tarih',
        time: 'Saat',
        consultant: 'Danışman',
        confirmCancel: 'Randevuyu İptal Et',
        cancelling: 'İptal ediliyor...',
        cancelSuccess: 'Randevunuz başarıyla iptal edildi.',
        cancelSuccessDesc: 'Size yeni bir randevu ayarlamak isterseniz chatbot üzerinden bize ulaşabilirsiniz.',
        notFound: 'Randevu bulunamadı',
        notFoundDesc: 'Bu iptal linki geçersiz veya randevunuz zaten iptal edilmiş olabilir.',
        error: 'Bir hata oluştu',
        errorDesc: 'Randevunuz iptal edilemedi. Lütfen tekrar deneyin veya bizimle iletişime geçin.',
        areYouSure: 'Bu randevuyu iptal etmek istediğinizden emin misiniz?',
        goBack: 'Vazgeç',
    },
    en: {
        title: 'Cancel Appointment',
        loading: 'Loading appointment details...',
        appointmentDetails: 'Appointment Details',
        date: 'Date',
        time: 'Time',
        consultant: 'Consultant',
        confirmCancel: 'Cancel Appointment',
        cancelling: 'Cancelling...',
        cancelSuccess: 'Your appointment has been cancelled successfully.',
        cancelSuccessDesc: 'If you would like to schedule a new appointment, feel free to reach us via chatbot.',
        notFound: 'Appointment not found',
        notFoundDesc: 'This cancellation link is invalid or your appointment has already been cancelled.',
        error: 'An error occurred',
        errorDesc: 'Your appointment could not be cancelled. Please try again or contact us.',
        areYouSure: 'Are you sure you want to cancel this appointment?',
        goBack: 'Go Back',
    }
}

interface AppointmentData {
    name: string
    date: string
    time: string
    agentName: string
    chatbotName: string
}

type PageState = 'loading' | 'confirm' | 'success' | 'not-found' | 'error'

export default function CancelAppointmentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
                </div>
            </div>
        }>
            <CancelAppointmentContent />
        </Suspense>
    )
}

function CancelAppointmentContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [state, setState] = useState<PageState>('loading')
    const [appointment, setAppointment] = useState<AppointmentData | null>(null)
    const [locale, setLocale] = useState('en')
    const [cancelling, setCancelling] = useState(false)

    const t = (key: string) => translations[locale]?.[key] || translations['en'][key] || key

    useEffect(() => {
        if (token) {
            fetchAppointment()
        } else {
            setState('not-found')
        }
    }, [token])

    const fetchAppointment = async () => {
        try {
            const response = await fetch(`/api/calendar/cancel?token=${token}`)
            if (response.ok) {
                const data = await response.json()
                setAppointment(data.appointment)
                setLocale(data.locale || 'en')
                setState('confirm')
            } else {
                setState('not-found')
            }
        } catch {
            setState('error')
        }
    }

    const handleCancel = async () => {
        setCancelling(true)
        try {
            const response = await fetch('/api/calendar/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            })

            if (response.ok) {
                setState('success')
            } else {
                setState('error')
            }
        } catch {
            setState('error')
        } finally {
            setCancelling(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Loading */}
                {state === 'loading' && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">{t('loading')}</p>
                    </div>
                )}

                {/* Confirm Cancellation */}
                {state === 'confirm' && appointment && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-center text-white">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-90" />
                            <h1 className="text-xl font-bold">{t('title')}</h1>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                                <h2 className="font-semibold text-gray-800 text-sm">{t('appointmentDetails')}</h2>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="w-4 h-4 text-amber-600" />
                                        <span className="text-gray-600">{t('date')}:</span>
                                        <span className="font-semibold text-gray-800">{appointment.date}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="w-4 h-4 text-amber-600" />
                                        <span className="text-gray-600">{t('time')}:</span>
                                        <span className="font-semibold text-gray-800">{appointment.time}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <User className="w-4 h-4 text-amber-600" />
                                        <span className="text-gray-600">{t('consultant')}:</span>
                                        <span className="font-semibold text-gray-800">{appointment.agentName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-700">{t('areYouSure')}</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => window.close()}
                                    className="flex-1 py-3 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    {t('goBack')}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="flex-1 py-3 px-4 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {cancelling ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {t('cancelling')}
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4" />
                                            {t('confirmCancel')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success */}
                {state === 'success' && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 mb-2">{t('cancelSuccess')}</h1>
                        <p className="text-gray-500 text-sm">{t('cancelSuccessDesc')}</p>
                    </div>
                )}

                {/* Not Found */}
                {state === 'not-found' && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-amber-500" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 mb-2">{t('notFound')}</h1>
                        <p className="text-gray-500 text-sm">{t('notFoundDesc')}</p>
                    </div>
                )}

                {/* Error */}
                {state === 'error' && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 mb-2">{t('error')}</h1>
                        <p className="text-gray-500 text-sm">{t('errorDesc')}</p>
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">© {new Date().getFullYear()} PylonChat</p>
            </div>
        </div>
    )
}
