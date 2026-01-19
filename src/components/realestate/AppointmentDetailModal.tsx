'use client'

import { useState, useEffect } from 'react'
import { X, Phone, Mail, User, MessageCircle, Home, DollarSign, Clock, Calendar, MapPin, Loader2, Flame, ThermometerSun, Snowflake } from 'lucide-react'

interface Message {
    id: string
    role: string
    content: string
    createdAt: string
}

interface LeadDetails {
    id: string
    name: string
    phone: string
    email: string | null
    intent: string | null
    propertyType: string | null
    purpose: string | null
    budget: string | null
    budgetMin: number | null
    budgetMax: number | null
    location: string | null
    timeline: string | null
    hasPreApproval: boolean | null
    score: number
    category: string
    notes: string | null
    requirements: any
    status: string
    appointmentDate: string | null
    appointmentTime: string | null
    appointmentNote: string | null
    createdAt: string
    conversation: {
        messages: Message[]
    } | null
}

interface Props {
    leadId: string
    onClose: () => void
    locale: string
}

const translations = {
    tr: {
        title: 'Randevu Detayı',
        contact: 'İletişim Bilgileri',
        search: 'Arama Kriterleri',
        chat: 'Konuşma Geçmişi',
        noChat: 'Kayıtlı konuşma bulunamadı',
        loading: 'Yükleniyor...',
        call: 'Ara',
        intent: { buy: 'Satın Alma', rent: 'Kiralama', sell: 'Satış', value: 'Değerleme' },
        timeline: { immediate: 'Hemen', soon: '1-3 Ay', later: '3-6 Ay', browsing: 'Araştırma' },
        preApproval: 'Ön Onay',
        yes: 'Var',
        no: 'Yok',
        score: 'Lead Skoru',
        hot: 'Sıcak Lead 🔥',
        warm: 'Ilık Lead',
        cold: 'Soğuk Lead'
    },
    en: {
        title: 'Appointment Details',
        contact: 'Contact Information',
        search: 'Search Criteria',
        chat: 'Chat History',
        noChat: 'No conversation found',
        loading: 'Loading...',
        call: 'Call',
        intent: { buy: 'Buy', rent: 'Rent', sell: 'Sell', value: 'Valuation' },
        timeline: { immediate: 'Immediately', soon: '1-3 Months', later: '3-6 Months', browsing: 'Browsing' },
        preApproval: 'Pre-Approval',
        yes: 'Yes',
        no: 'No',
        score: 'Lead Score',
        hot: 'Hot Lead 🔥',
        warm: 'Warm Lead',
        cold: 'Cold Lead'
    }
}

export function AppointmentDetailModal({ leadId, onClose, locale }: Props) {
    const [lead, setLead] = useState<LeadDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const t = translations[locale as keyof typeof translations] || translations.en

    useEffect(() => {
        fetchLead()
    }, [leadId])

    const fetchLead = async () => {
        try {
            const response = await fetch(`/api/leads/${leadId}`)
            if (!response.ok) throw new Error('Failed to fetch')
            const data = await response.json()
            setLead(data.lead)
        } catch (err) {
            setError('Could not load lead details')
        } finally {
            setLoading(false)
        }
    }

    const getCategoryStyle = (category: string) => {
        switch (category) {
            case 'hot': return { bg: 'bg-red-100', text: 'text-red-700', icon: Flame }
            case 'warm': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: ThermometerSun }
            default: return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Snowflake }
        }
    }

    const categoryStyle = lead ? getCategoryStyle(lead.category) : getCategoryStyle('cold')
    const CategoryIcon = categoryStyle.icon

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{t.title}</h2>
                            {lead && (
                                <p className="text-white/80 text-sm">
                                    {new Date(lead.appointmentDate || lead.createdAt).toLocaleDateString()} {lead.appointmentTime || ''}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                            <span className="ml-2 text-gray-500">{t.loading}</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 text-red-500">{error}</div>
                    ) : lead ? (
                        <div className="p-6 space-y-6">
                            {/* Contact Info */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4 text-amber-600" />
                                    {t.contact}
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-medium text-gray-900">{lead.name}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
                                            <CategoryIcon className="w-3 h-3 inline mr-1" />
                                            {t[lead.category as keyof typeof t] || lead.category}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-amber-600 hover:text-amber-700">
                                            <Phone className="w-4 h-4" />
                                            {lead.phone}
                                        </a>
                                        {lead.email && (
                                            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-700">
                                                <Mail className="w-4 h-4" />
                                                {lead.email}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Search Criteria */}
                            <div className="bg-amber-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Home className="w-4 h-4 text-amber-600" />
                                    {t.search}
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {lead.intent && (
                                        <div>
                                            <span className="text-gray-500">Amaç:</span>
                                            <span className="ml-2 font-medium">{t.intent[lead.intent as keyof typeof t.intent] || lead.intent}</span>
                                        </div>
                                    )}
                                    {lead.propertyType && (
                                        <div>
                                            <span className="text-gray-500">Tip:</span>
                                            <span className="ml-2 font-medium capitalize">{lead.propertyType}</span>
                                        </div>
                                    )}
                                    {(lead.budget || lead.budgetMax) && (
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="w-3 h-3 text-gray-400" />
                                            <span className="text-gray-500">Bütçe:</span>
                                            <span className="ml-1 font-medium">{lead.budget || `${lead.budgetMax?.toLocaleString()} TL`}</span>
                                        </div>
                                    )}
                                    {lead.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-gray-400" />
                                            <span className="text-gray-500">Konum:</span>
                                            <span className="ml-1 font-medium">{lead.location}</span>
                                        </div>
                                    )}
                                    {lead.timeline && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            <span className="text-gray-500">Zaman:</span>
                                            <span className="ml-1 font-medium">{t.timeline[lead.timeline as keyof typeof t.timeline] || lead.timeline}</span>
                                        </div>
                                    )}
                                    {lead.hasPreApproval !== null && (
                                        <div>
                                            <span className="text-gray-500">{t.preApproval}:</span>
                                            <span className={`ml-2 font-medium ${lead.hasPreApproval ? 'text-green-600' : 'text-gray-500'}`}>
                                                {lead.hasPreApproval ? t.yes : t.no}
                                            </span>
                                        </div>
                                    )}
                                    {lead.requirements?.bedrooms && (
                                        <div>
                                            <span className="text-gray-500">Oda:</span>
                                            <span className="ml-2 font-medium">{lead.requirements.bedrooms}</span>
                                        </div>
                                    )}
                                    {lead.requirements?.bathrooms && (
                                        <div>
                                            <span className="text-gray-500">Banyo:</span>
                                            <span className="ml-2 font-medium">{lead.requirements.bathrooms}</span>
                                        </div>
                                    )}
                                </div>
                                {lead.score > 0 && (
                                    <div className="mt-3 pt-3 border-t border-amber-200">
                                        <span className="text-gray-500 text-sm">{t.score}:</span>
                                        <span className="ml-2 font-bold text-amber-600">{lead.score}/100</span>
                                    </div>
                                )}
                            </div>

                            {/* Chat History */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4 text-amber-600" />
                                    {t.chat}
                                </h3>
                                {lead.conversation?.messages && lead.conversation.messages.length > 0 ? (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {lead.conversation.messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`p-2 rounded-lg text-sm ${msg.role === 'user'
                                                        ? 'bg-amber-100 text-amber-900 ml-8'
                                                        : 'bg-white border text-gray-700 mr-8'
                                                    }`}
                                            >
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                                <span className="text-xs text-gray-400 mt-1 block">
                                                    {new Date(msg.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm italic">{t.noChat}</p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <a
                                    href={`tel:${lead.phone}`}
                                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                                >
                                    <Phone className="w-5 h-5" />
                                    {t.call}
                                </a>
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
