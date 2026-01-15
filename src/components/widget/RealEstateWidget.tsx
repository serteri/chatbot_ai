'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
    X,
    Send,
    MessageCircle,
    Building2,
    Home,
    MapPin,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle,
    Phone,
    Mail,
    User,
    Wrench,
    TrendingUp,
    Flame,
    Snowflake,
    ThermometerSun,
    Camera,
    Loader2
} from 'lucide-react'
import { Lock } from 'lucide-react'
import Link from 'next/link'

// Demo chat limit constants
const DEMO_CHAT_STORAGE_KEY = 'pylonchat_widget_demo'
const DEMO_CHAT_MAX_MESSAGES = 5
const DEMO_CHAT_EXPIRY_HOURS = 24

// Types
interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    type?: 'text' | 'cards' | 'form' | 'appointment' | 'quick-replies' | 'lead-score' | 'photo-upload' | 'no-properties'
    data?: any
}

interface Property {
    id: string
    title: string
    price: string
    location: string
    rooms: string
    area: string | null
    image: string
    badge?: string | null
    monthlyRent?: string | null
    roi?: string | null
}

interface LeadData {
    intent?: 'buy' | 'rent' | 'sell' | 'value' | 'tenant'
    propertyType?: string
    budget?: string
    budgetLevel?: 'low' | 'medium' | 'high' | 'premium'
    budgetMin?: number
    budgetMax?: number
    location?: string
    timeline?: string
    timelineUrgency?: 'immediate' | 'soon' | 'later' | 'browsing'
    hasPreApproval?: boolean
    purpose?: 'investment' | 'residence'
    contactName?: string
    contactPhone?: string
    contactEmail?: string
    leadScore?: number
    leadCategory?: 'hot' | 'warm' | 'cold'
}

interface TenantIssue {
    type: string
    description?: string
    photos?: string[]
    urgency?: 'emergency' | 'normal' | 'low'
}

interface RealEstateWidgetProps {
    locale?: 'tr' | 'en'
    primaryColor?: string
    position?: 'bottom-right' | 'bottom-left'
    agentName?: string
    agentPhoto?: string
    companyLogo?: string
    chatbotIdentifier?: string // Required for API calls
    onLeadCapture?: (lead: LeadData) => void
    onHotLead?: (lead: LeadData) => void
    onTenantIssue?: (issue: TenantIssue) => void
    onAppointmentBooked?: (slot: any, lead: LeadData) => void
}

// Translations
const translations = {
    tr: {
        title: 'Emlak Asistanı',
        subtitle: 'Ön Büro Asistanınız',
        online: 'Çevrimiçi',
        placeholder: 'Mesajınızı yazın...',
        welcome: `Merhaba! Ben dijital ön büro asistanınız. Size en uygun portföyü sunmak için birkaç hızlı soru soracağım.`,
        quickReplies: {
            buy: 'Ev almak istiyorum',
            rent: 'Kiralık arıyorum',
            sell: 'Evimi satmak istiyorum',
            value: 'Evimin değerini öğreneyim',
            tenant: 'Kiracı desteği'
        },
        leadQualification: {
            propertyType: 'Ne tür bir gayrimenkul arıyorsunuz?',
            purpose: 'Yatırım için mi yoksa oturum için mi bakıyorsunuz?',
            purposeOptions: ['Yatırım', 'Oturum', 'Her ikisi de olabilir'],
            budget: 'Bütçe aralığınız nedir?',
            budgetNote: 'Size en uygun portföyü sunmak için bütçenizi bilmem gerekiyor.',
            location: 'Hangi bölgeleri tercih edersiniz?',
            timeline: 'Ne zaman taşınmayı planlıyorsunuz?',
            timelineNote: 'Bu bilgi, size öncelik vermemizi sağlar.',
            preApproval: 'Kredi ön onayınız var mı?',
            preApprovalNote: 'Ön onay, işlemleri çok hızlandırır.',
            contact: 'Sizinle iletişime geçebilmemiz için bilgilerinizi paylaşır mısınız?'
        },
        propertyTypes: ['Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'Ticari'],
        budgetRanges: [
            { label: '1-3 Milyon TL', min: 1000000, max: 3000000 },
            { label: '3-5 Milyon TL', min: 3000000, max: 5000000 },
            { label: '5-10 Milyon TL', min: 5000000, max: 10000000 },
            { label: '10-20 Milyon TL', min: 10000000, max: 20000000 },
            { label: '20+ Milyon TL', min: 20000000, max: 100000000 }
        ],
        timelines: ['Hemen (Bu ay)', '1-3 ay içinde', '3-6 ay içinde', 'Sadece piyasayı araştırıyorum'],
        yesNo: ['Evet, var', 'Hayır, yok', 'Başvuracağım'],
        appointmentSlots: {
            title: 'Danışmanımız bu saatlerde müsait:',
            select: 'Randevu Seç'
        },
        valuation: {
            title: 'Ücretsiz Değerleme',
            subtitle: 'Yapay zeka destekli tahmini değer',
            address: 'Adres (İlçe, Mahalle)',
            area: 'Metrekare (m²)',
            rooms: 'Oda Sayısı',
            buildingAge: 'Bina Yaşı',
            submit: 'Değerleme Al',
            result: 'Tahmini Değer Aralığı'
        },
        tenant: {
            title: 'Kiracı Destek',
            greeting: 'Size nasıl yardımcı olabilirim?',
            options: ['Arıza Bildirimi', 'Kira Ödeme Bilgisi', 'Sözleşme Sorusu', 'Anahtar Teslimi', 'Diğer'],
            issueTypes: {
                plumbing: 'Su Tesisatı',
                electrical: 'Elektrik',
                heating: 'Isıtma/Kombi',
                structural: 'Yapısal Sorun',
                other: 'Diğer'
            },
            urgency: {
                emergency: 'Acil (Su baskını, gaz kaçağı vb.)',
                normal: 'Normal',
                low: 'Acil değil'
            },
            photoPrompt: 'Sorunu daha iyi anlamamız için fotoğraf ekleyebilirsiniz:',
            photoButton: 'Fotoğraf Yükle',
            submitted: 'Talebiniz alındı! Anlaşmalı servisimiz en kısa sürede sizinle iletişime geçecek.',
            rentInfo: 'Kira Ödeme Bilgileri:\n\nIBAN: TR00 0000 0000 0000 0000 0000 00\nAlıcı: Emlak Yönetimi A.Ş.\n\nÖdeme açıklamasına daire numaranızı yazmayı unutmayın.',
            contractInfo: 'Sözleşme sorularınız için lütfen iletişim bilgilerinizi bırakın, müşteri temsilcimiz sizi arasın.'
        },
        leadScore: {
            hot: 'Sıcak Lead',
            warm: 'Ilık Lead',
            cold: 'Soğuk Lead',
            hotDesc: 'Hemen alıma hazır!',
            warmDesc: 'Potansiyel alıcı',
            coldDesc: 'Araştırma aşamasında'
        },
        messages: {
            hotLeadAlert: '🔥 Sıcak Lead Tespit Edildi!\n\nDanışmanımız en kısa sürede sizi arayacak. Ortalama yanıt süresi: 5 dakika.',
            warmLeadAlert: '👍 Bilgileriniz alındı!\n\nDanışmanımız 24 saat içinde sizinle iletişime geçecek.',
            coldLeadResponse: 'Anlıyorum, henüz araştırma aşamasındasınız.\n\nSize yardımcı olabilecek bazı kaynaklarımız var:\n• Bölge fiyat rehberi\n• Yatırım analiz raporu\n• Piyasa trend raporu\n\nE-posta adresinizi bırakırsanız bu raporları size gönderelim.',
            searchingProperties: 'Kriterlerinize uygun ilanları arıyorum...',
            propertiesFound: 'Size uygun ilanlarımız:',
            noPropertiesFound: 'Şu an kriterlerinize uygun aktif ilanımız bulunmuyor.\n\nAncak danışmanımız sizin için özel arama yapabilir. İletişim bilgilerinizi bırakır mısınız?',
            investmentMatch: 'Yatırım için mükemmel seçim!\n\nYüksek kira getirisi olan lokasyonları arıyorum...',
            residenceMatch: 'Oturum için en iyi seçeneklerimizi getiriyorum!\n\nSosyal olanaklar ve ulaşım kriterlerine göre arıyorum...',
            appointmentConfirmed: 'Randevunuz onaylandı!\n\nAdres ve hatırlatma SMS olarak gönderilecektir.\n\n📍 Konum bilgisi randevudan 1 saat önce iletilecek.',
            valuationResult: 'Yapay zeka değerleme sonucunuz hazır!',
            upsellHigherBudget: '💡 Bütçenizi biraz esnetirseniz şu harika seçeneklere bakabilirsiniz:',
            upsellDifferentType: '🏠 Farklı emlak türlerinde alternatiflerimiz var:',
            upsellNearby: '📍 Size yakın popüler ilanlarımız:',
            alternativeQuestion: 'Bu seçeneklerden biri ilginizi çekti mi?'
        },
        thankYou: 'Teşekkür ederiz!',
        viewDetails: 'Detayları Gör',
        schedule: 'Randevu Al',
        showMore: 'Daha Fazla Göster',
        loading: 'Yükleniyor...'
    },
    en: {
        title: 'Real Estate Assistant',
        subtitle: 'Your Front Desk Assistant',
        online: 'Online',
        placeholder: 'Type your message...',
        welcome: `Hello! I'm your digital front desk assistant. I'll ask you a few quick questions to find the best properties for you.`,
        quickReplies: {
            buy: 'I want to buy',
            rent: 'Looking to rent',
            sell: 'I want to sell my property',
            value: 'Get property valuation',
            tenant: 'Tenant support'
        },
        leadQualification: {
            propertyType: 'What type of property are you looking for?',
            purpose: 'Are you looking for investment or residence?',
            purposeOptions: ['Investment', 'Residence', 'Could be either'],
            budget: 'What is your budget range?',
            budgetNote: 'I need to know your budget to show you the best options.',
            location: 'Which areas do you prefer?',
            timeline: 'When are you planning to move?',
            timelineNote: 'This helps us prioritize your search.',
            preApproval: 'Do you have mortgage pre-approval?',
            preApprovalNote: 'Pre-approval speeds up the process significantly.',
            contact: 'Please share your contact info so we can reach you.'
        },
        propertyTypes: ['Apartment', 'Villa', 'House', 'Land', 'Commercial'],
        budgetRanges: [
            { label: '$100K-$300K', min: 100000, max: 300000 },
            { label: '$300K-$500K', min: 300000, max: 500000 },
            { label: '$500K-$800K', min: 500000, max: 800000 },
            { label: '$800K-$1.5M', min: 800000, max: 1500000 },
            { label: '$1.5M+', min: 1500000, max: 50000000 }
        ],
        timelines: ['Immediately (This month)', 'Within 1-3 months', 'Within 3-6 months', 'Just browsing the market'],
        yesNo: ['Yes, I have it', 'No, not yet', 'Will apply soon'],
        appointmentSlots: {
            title: 'Our advisor is available at these times:',
            select: 'Select Slot'
        },
        valuation: {
            title: 'Free Valuation',
            subtitle: 'AI-powered estimate',
            address: 'Address (District, Neighborhood)',
            area: 'Square footage',
            rooms: 'Bedrooms',
            buildingAge: 'Building Age',
            submit: 'Get Valuation',
            result: 'Estimated Value Range'
        },
        tenant: {
            title: 'Tenant Support',
            greeting: 'How can I help you?',
            options: ['Report Issue', 'Rent Payment Info', 'Contract Question', 'Key Handover', 'Other'],
            issueTypes: {
                plumbing: 'Plumbing',
                electrical: 'Electrical',
                heating: 'Heating/HVAC',
                structural: 'Structural Issue',
                other: 'Other'
            },
            urgency: {
                emergency: 'Emergency (Flooding, gas leak, etc.)',
                normal: 'Normal',
                low: 'Not urgent'
            },
            photoPrompt: 'You can add photos to help us understand the issue:',
            photoButton: 'Upload Photo',
            submitted: 'Your request has been received! Our service team will contact you shortly.',
            rentInfo: 'Rent Payment Information:\n\nBank: Example Bank\nAccount: 1234567890\nRouting: 123456789\n\nPlease include your unit number in the memo.',
            contractInfo: 'For contract questions, please leave your contact info and our representative will call you.'
        },
        leadScore: {
            hot: 'Hot Lead',
            warm: 'Warm Lead',
            cold: 'Cold Lead',
            hotDesc: 'Ready to buy now!',
            warmDesc: 'Potential buyer',
            coldDesc: 'Research phase'
        },
        messages: {
            hotLeadAlert: '🔥 Hot Lead Detected!\n\nOur advisor will call you shortly. Average response time: 5 minutes.',
            warmLeadAlert: '👍 Your information has been received!\n\nOur advisor will contact you within 24 hours.',
            coldLeadResponse: 'I understand you\'re still in the research phase.\n\nWe have some helpful resources:\n• Area price guide\n• Investment analysis report\n• Market trend report\n\nLeave your email and we\'ll send these to you.',
            searchingProperties: 'Searching for properties matching your criteria...',
            propertiesFound: 'Here are properties matching your criteria:',
            noPropertiesFound: 'We don\'t have active listings matching your criteria at the moment.\n\nHowever, our advisor can do a custom search for you. Would you like to leave your contact info?',
            investmentMatch: 'Great choice for investment!\n\nSearching for high rental yield locations...',
            residenceMatch: 'Getting the best options for your new home!\n\nSearching based on amenities and transportation...',
            appointmentConfirmed: 'Your appointment is confirmed!\n\nAddress and reminder will be sent via SMS.\n\n📍 Location details will be shared 1 hour before.',
            valuationResult: 'Your AI valuation is ready!',
            upsellHigherBudget: '💡 If you stretch your budget a bit, check out these great options:',
            upsellDifferentType: '🏠 We have alternatives in different property types:',
            upsellNearby: '📍 Popular listings near your preferred area:',
            alternativeQuestion: 'Interested in any of these options?'
        },
        thankYou: 'Thank you!',
        viewDetails: 'View Details',
        schedule: 'Schedule Viewing',
        showMore: 'Show More',
        loading: 'Loading...'
    }
}

// Lead scoring function
function calculateLeadScore(lead: LeadData): { score: number; category: 'hot' | 'warm' | 'cold' } {
    let score = 0

    if (lead.timelineUrgency === 'immediate') score += 40
    else if (lead.timelineUrgency === 'soon') score += 25
    else if (lead.timelineUrgency === 'later') score += 10

    if (lead.hasPreApproval === true) score += 30
    else if (lead.hasPreApproval === false) score += 5

    if (lead.budgetLevel === 'premium') score += 20
    else if (lead.budgetLevel === 'high') score += 15
    else if (lead.budgetLevel === 'medium') score += 10
    else if (lead.budgetLevel === 'low') score += 5

    if (lead.contactPhone) score += 10

    let category: 'hot' | 'warm' | 'cold'
    if (score >= 70) category = 'hot'
    else if (score >= 40) category = 'warm'
    else category = 'cold'

    return { score, category }
}

// Map property type to API value
function mapPropertyTypeToApi(type: string, locale: string): string {
    const trMap: Record<string, string> = {
        'Daire': 'apartment',
        'Villa': 'villa',
        'Müstakil Ev': 'house',
        'Arsa': 'land',
        'Ticari': 'commercial'
    }
    const enMap: Record<string, string> = {
        'Apartment': 'apartment',
        'Villa': 'villa',
        'House': 'house',
        'Land': 'land',
        'Commercial': 'commercial'
    }
    return locale === 'tr' ? trMap[type] || 'apartment' : enMap[type] || 'apartment'
}

export function RealEstateWidget({
    locale = 'tr',
    primaryColor = '#D97706',
    position = 'bottom-right',
    agentName = 'Emlak Danışmanı',
    agentPhoto,
    companyLogo,
    chatbotIdentifier,
    onLeadCapture,
    onHotLead,
    onTenantIssue,
    onAppointmentBooked
}: RealEstateWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [leadData, setLeadData] = useState<LeadData>({})
    const [currentStep, setCurrentStep] = useState<string>('initial')
    const [carouselIndex, setCarouselIndex] = useState(0)
    const [showNotification, setShowNotification] = useState(true)
    const [tenantIssue, setTenantIssue] = useState<TenantIssue>({ type: '' })
    const [loadingProperties, setLoadingProperties] = useState(false)
    const [demoChatUsed, setDemoChatUsed] = useState(0)
    const [demoChatLimit, setDemoChatLimit] = useState(DEMO_CHAT_MAX_MESSAGES)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [limitReached, setLimitReached] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const t = translations[locale]
    const positionClass = position === 'bottom-left' ? 'left-4' : 'right-4'
    const remainingMessages = demoChatLimit === -1 ? -1 : Math.max(0, demoChatLimit - demoChatUsed)

    // Check demo chat usage on mount
    useEffect(() => {
        const checkUsage = async () => {
            try {
                // If chatbotIdentifier provided, use chatbot owner's limits
                const url = chatbotIdentifier
                    ? `/api/demo-chat?chatbotId=${chatbotIdentifier}`
                    : '/api/demo-chat'
                const response = await fetch(url)
                if (response.ok) {
                    const data = await response.json()
                    setIsAuthenticated(data.authenticated)
                    // If chatbotId was provided, always use API data
                    if (chatbotIdentifier || data.authenticated) {
                        setDemoChatUsed(data.used)
                        setDemoChatLimit(data.limit)
                        setLimitReached(data.limit !== -1 && data.used >= data.limit)
                    } else {
                        // Use localStorage for non-authenticated users without chatbotId
                        const stored = localStorage.getItem(DEMO_CHAT_STORAGE_KEY)
                        if (stored) {
                            try {
                                const parsed = JSON.parse(stored)
                                const now = Date.now()
                                if (parsed.expiry && now < parsed.expiry) {
                                    setDemoChatUsed(parsed.count || 0)
                                    setLimitReached((parsed.count || 0) >= DEMO_CHAT_MAX_MESSAGES)
                                } else {
                                    localStorage.removeItem(DEMO_CHAT_STORAGE_KEY)
                                }
                            } catch {
                                localStorage.removeItem(DEMO_CHAT_STORAGE_KEY)
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking demo chat usage:', error)
                // Fallback to localStorage
                const stored = localStorage.getItem(DEMO_CHAT_STORAGE_KEY)
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored)
                        if (parsed.expiry && Date.now() < parsed.expiry) {
                            setDemoChatUsed(parsed.count || 0)
                            setLimitReached((parsed.count || 0) >= DEMO_CHAT_MAX_MESSAGES)
                        }
                    } catch { }
                }
            }
        }
        checkUsage()
    }, [chatbotIdentifier])

    // Increment demo chat usage
    const incrementUsage = async (): Promise<boolean> => {
        if (limitReached) return false

        try {
            const response = await fetch('/api/demo-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatbotId: chatbotIdentifier })
            })
            const data = await response.json()

            // If chatbotId was provided or user is authenticated, use API response
            if (chatbotIdentifier || data.authenticated) {
                if (!data.success) {
                    setLimitReached(true)
                    return false
                }
                setDemoChatUsed(data.used)
                setLimitReached(data.remaining === 0)
                return true
            } else {
                // Use localStorage for non-authenticated users without chatbotId
                const newCount = demoChatUsed + 1
                if (newCount > DEMO_CHAT_MAX_MESSAGES) {
                    setLimitReached(true)
                    return false
                }
                setDemoChatUsed(newCount)
                localStorage.setItem(DEMO_CHAT_STORAGE_KEY, JSON.stringify({
                    count: newCount,
                    expiry: Date.now() + (DEMO_CHAT_EXPIRY_HOURS * 60 * 60 * 1000)
                }))
                setLimitReached(newCount >= DEMO_CHAT_MAX_MESSAGES)
                return true
            }
        } catch (error) {
            console.error('Error incrementing demo chat usage:', error)
            // Fallback to localStorage
            const newCount = demoChatUsed + 1
            if (newCount > DEMO_CHAT_MAX_MESSAGES) {
                setLimitReached(true)
                return false
            }
            setDemoChatUsed(newCount)
            localStorage.setItem(DEMO_CHAT_STORAGE_KEY, JSON.stringify({
                count: newCount,
                expiry: Date.now() + (DEMO_CHAT_EXPIRY_HOURS * 60 * 60 * 1000)
            }))
            setLimitReached(newCount >= DEMO_CHAT_MAX_MESSAGES)
            return true
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            addBotMessage(t.welcome, 'quick-replies', {
                replies: Object.values(t.quickReplies)
            })
        }
    }, [isOpen])

    const addBotMessage = useCallback((content: string, type: Message['type'] = 'text', data?: any) => {
        // Don't add bot messages if limit is reached (except for system messages)
        if (limitReached && currentStep !== 'limitReached') {
            return
        }

        setIsTyping(true)
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content,
                timestamp: new Date(),
                type,
                data
            }])
            setIsTyping(false)
        }, 600 + Math.random() * 400)
    }, [limitReached, currentStep])

    const addUserMessage = useCallback(async (content: string) => {
        // Check and increment usage before allowing message
        const canSend = await incrementUsage()
        if (!canSend) {
            // Show limit reached message and block further interaction
            setCurrentStep('limitReached')
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: locale === 'tr'
                    ? '⚠️ Demo chat limitinize ulaştınız. Daha fazla mesaj göndermek için lütfen kayıt olun veya planınızı yükseltin.'
                    : '⚠️ You have reached your demo chat limit. Please register or upgrade your plan to send more messages.',
                timestamp: new Date(),
                type: 'text'
            }])
            return
        }

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
            type: 'text'
        }])
    }, [locale, incrementUsage])

    // Fetch properties from API
    const fetchProperties = async (purpose: string, budgetMax?: number, propertyType?: string): Promise<Property[]> => {
        if (!chatbotIdentifier) {
            console.warn('No chatbotIdentifier provided, cannot fetch properties')
            return []
        }

        try {
            const params = new URLSearchParams({
                identifier: chatbotIdentifier,
                purpose: purpose,
                listingType: leadData.intent === 'rent' ? 'rent' : 'sale'
            })

            if (budgetMax) params.append('maxPrice', budgetMax.toString())
            if (propertyType) params.append('propertyType', propertyType)

            const response = await fetch(`/api/properties/search?${params.toString()}`)
            if (!response.ok) return []

            const data = await response.json()
            return data.properties || []
        } catch (error) {
            console.error('Error fetching properties:', error)
            return []
        }
    }

    // Fetch alternative properties with expanded criteria (for upsell)
    const fetchAlternativeProperties = async (
        purpose: string,
        budgetMax?: number,
        propertyType?: string
    ): Promise<{ properties: Property[]; reason: 'higher-budget' | 'different-type' | 'nearby' }> => {
        if (!chatbotIdentifier) {
            return { properties: [], reason: 'higher-budget' }
        }

        try {
            // Try 1: Expand budget by 25%
            const expandedBudget = budgetMax ? Math.round(budgetMax * 1.25) : undefined
            const params1 = new URLSearchParams({
                identifier: chatbotIdentifier,
                purpose: purpose,
                listingType: leadData.intent === 'rent' ? 'rent' : 'sale',
                limit: '3'
            })
            if (expandedBudget) params1.append('maxPrice', expandedBudget.toString())
            if (propertyType) params1.append('propertyType', propertyType)

            const response1 = await fetch(`/api/properties/search?${params1.toString()}`)
            if (response1.ok) {
                const data1 = await response1.json()
                if (data1.properties?.length > 0) {
                    return { properties: data1.properties.slice(0, 3), reason: 'higher-budget' }
                }
            }

            // Try 2: Remove property type filter
            const params2 = new URLSearchParams({
                identifier: chatbotIdentifier,
                purpose: purpose,
                listingType: leadData.intent === 'rent' ? 'rent' : 'sale',
                limit: '3'
            })
            if (expandedBudget) params2.append('maxPrice', expandedBudget.toString())

            const response2 = await fetch(`/api/properties/search?${params2.toString()}`)
            if (response2.ok) {
                const data2 = await response2.json()
                if (data2.properties?.length > 0) {
                    return { properties: data2.properties.slice(0, 3), reason: 'different-type' }
                }
            }

            // Try 3: Get any available properties (featured/popular)
            const params3 = new URLSearchParams({
                identifier: chatbotIdentifier,
                featured: 'true',
                limit: '3'
            })

            const response3 = await fetch(`/api/properties/search?${params3.toString()}`)
            if (response3.ok) {
                const data3 = await response3.json()
                if (data3.properties?.length > 0) {
                    return { properties: data3.properties.slice(0, 3), reason: 'nearby' }
                }
            }

            return { properties: [], reason: 'higher-budget' }
        } catch (error) {
            console.error('Error fetching alternative properties:', error)
            return { properties: [], reason: 'higher-budget' }
        }
    }

    // Save lead to API
    const saveLead = async (leadInfo: LeadData) => {
        if (!chatbotIdentifier) return

        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: chatbotIdentifier,
                    name: leadInfo.contactName || '',
                    phone: leadInfo.contactPhone || '',
                    email: leadInfo.contactEmail || '',
                    intent: leadInfo.intent,
                    propertyType: leadInfo.propertyType,
                    purpose: leadInfo.purpose,
                    budget: leadInfo.budget,
                    budgetMin: leadInfo.budgetMin,
                    budgetMax: leadInfo.budgetMax,
                    timeline: leadInfo.timeline,
                    hasPreApproval: leadInfo.hasPreApproval,
                    score: leadInfo.leadScore,
                    category: leadInfo.leadCategory
                })
            })
        } catch (error) {
            console.error('Error saving lead:', error)
        }
    }

    const handleQuickReply = async (reply: string) => {
        await addUserMessage(reply)

        // If limit reached, don't continue the flow
        if (limitReached) return

        if (reply === t.quickReplies.buy) {
            setLeadData(prev => ({ ...prev, intent: 'buy' }))
            setCurrentStep('purpose')
            setTimeout(() => {
                addBotMessage(t.leadQualification.purpose, 'quick-replies', {
                    replies: t.leadQualification.purposeOptions
                })
            }, 300)
        } else if (reply === t.quickReplies.rent) {
            setLeadData(prev => ({ ...prev, intent: 'rent' }))
            setCurrentStep('propertyType')
            setTimeout(() => {
                addBotMessage(t.leadQualification.propertyType, 'quick-replies', {
                    replies: t.propertyTypes
                })
            }, 300)
        } else if (reply === t.quickReplies.sell || reply === t.quickReplies.value) {
            setLeadData(prev => ({ ...prev, intent: reply === t.quickReplies.sell ? 'sell' : 'value' }))
            setCurrentStep('valuation')
            setTimeout(() => {
                addBotMessage(t.valuation.title, 'form', { type: 'valuation' })
            }, 300)
        } else if (reply === t.quickReplies.tenant) {
            setLeadData(prev => ({ ...prev, intent: 'tenant' }))
            setCurrentStep('tenant')
            setTimeout(() => {
                addBotMessage(t.tenant.greeting, 'quick-replies', { replies: t.tenant.options })
            }, 300)
        }
    }

    const handlePurposeSelect = async (purpose: string) => {
        await addUserMessage(purpose)
        if (limitReached) return

        const purposeValue = purpose === t.leadQualification.purposeOptions[0] ? 'investment' :
            purpose === t.leadQualification.purposeOptions[1] ? 'residence' : 'investment'
        setLeadData(prev => ({ ...prev, purpose: purposeValue }))
        setCurrentStep('propertyType')
        setTimeout(() => {
            addBotMessage(t.leadQualification.propertyType, 'quick-replies', { replies: t.propertyTypes })
        }, 300)
    }

    const handlePropertyTypeSelect = async (type: string) => {
        await addUserMessage(type)
        if (limitReached) return

        const apiType = mapPropertyTypeToApi(type, locale)
        setLeadData(prev => ({ ...prev, propertyType: apiType }))
        setCurrentStep('budget')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.budget}\n\n💡 ${t.leadQualification.budgetNote}`, 'quick-replies', {
                replies: t.budgetRanges.map(b => b.label)
            })
        }, 300)
    }

    const handleBudgetSelect = async (budget: string) => {
        await addUserMessage(budget)
        if (limitReached) return

        const budgetRange = t.budgetRanges.find(b => b.label === budget)
        let budgetLevel: 'low' | 'medium' | 'high' | 'premium' = 'medium'
        const budgetIndex = t.budgetRanges.findIndex(b => b.label === budget)
        if (budgetIndex === 0) budgetLevel = 'low'
        else if (budgetIndex === 1) budgetLevel = 'medium'
        else if (budgetIndex === 2) budgetLevel = 'high'
        else budgetLevel = 'premium'

        setLeadData(prev => ({
            ...prev,
            budget,
            budgetLevel,
            budgetMin: budgetRange?.min,
            budgetMax: budgetRange?.max
        }))
        setCurrentStep('timeline')

        setTimeout(() => {
            addBotMessage(`${t.leadQualification.timeline}\n\n⏰ ${t.leadQualification.timelineNote}`, 'quick-replies', {
                replies: t.timelines
            })
        }, 300)
    }

    const handleTimelineSelect = async (timeline: string) => {
        await addUserMessage(timeline)
        if (limitReached) return

        let timelineUrgency: 'immediate' | 'soon' | 'later' | 'browsing' = 'later'
        const timelineIndex = t.timelines.indexOf(timeline)
        if (timelineIndex === 0) timelineUrgency = 'immediate'
        else if (timelineIndex === 1) timelineUrgency = 'soon'
        else if (timelineIndex === 2) timelineUrgency = 'later'
        else timelineUrgency = 'browsing'

        setLeadData(prev => ({ ...prev, timeline, timelineUrgency }))

        if (timelineUrgency === 'browsing') {
            setCurrentStep('coldLead')
            setTimeout(() => {
                addBotMessage(t.messages.coldLeadResponse, 'form', { type: 'email-only' })
            }, 300)
            return
        }

        setCurrentStep('preApproval')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.preApproval}\n\n🏦 ${t.leadQualification.preApprovalNote}`, 'quick-replies', {
                replies: t.yesNo
            })
        }, 300)
    }

    const handlePreApprovalSelect = async (answer: string) => {
        await addUserMessage(answer)
        if (limitReached) return

        const hasPreApproval = answer === t.yesNo[0]
        const updatedLead = { ...leadData, hasPreApproval }
        setLeadData(updatedLead)

        const { score, category } = calculateLeadScore(updatedLead)
        updatedLead.leadScore = score
        updatedLead.leadCategory = category

        const matchMessage = updatedLead.purpose === 'investment'
            ? t.messages.investmentMatch
            : t.messages.residenceMatch

        setCurrentStep('searchingProperties')
        addBotMessage(matchMessage)

        // Fetch real properties from API
        setLoadingProperties(true)
        setTimeout(async () => {
            const properties = await fetchProperties(
                updatedLead.purpose || 'residence',
                updatedLead.budgetMax,
                updatedLead.propertyType
            )
            setLoadingProperties(false)

            if (properties.length > 0) {
                addBotMessage(t.messages.propertiesFound, 'cards', { properties })

                setTimeout(() => {
                    setCurrentStep('contact')
                    addBotMessage(t.leadQualification.contact, 'form', {
                        type: 'contact',
                        leadCategory: category
                    })
                }, 2000)
            } else {
                // No exact matches - try to find alternatives (upsell)
                const alternatives = await fetchAlternativeProperties(
                    updatedLead.purpose || 'residence',
                    updatedLead.budgetMax,
                    updatedLead.propertyType
                )

                if (alternatives.properties.length > 0) {
                    // Show upsell message based on reason
                    const upsellMessage = alternatives.reason === 'higher-budget'
                        ? t.messages.upsellHigherBudget
                        : alternatives.reason === 'different-type'
                            ? t.messages.upsellDifferentType
                            : t.messages.upsellNearby

                    addBotMessage(upsellMessage, 'cards', { properties: alternatives.properties })

                    setTimeout(() => {
                        addBotMessage(t.messages.alternativeQuestion, 'quick-replies', {
                            replies: locale === 'tr'
                                ? ['Evet, ilgileniyorum', 'Hayır, başka arayın']
                                : ['Yes, interested', 'No, keep searching']
                        })
                        setCurrentStep('upsellResponse')
                    }, 2500)
                } else {
                    // No alternatives found either
                    addBotMessage(t.messages.noPropertiesFound, 'form', {
                        type: 'contact',
                        leadCategory: category
                    })
                    setCurrentStep('contact')
                }
            }
        }, 1000)
    }

    const handleContactSubmit = async (contactData: { name: string; phone: string; email: string }) => {
        const finalLeadData: LeadData = {
            ...leadData,
            contactName: contactData.name,
            contactPhone: contactData.phone,
            contactEmail: contactData.email
        }

        const { score, category } = calculateLeadScore(finalLeadData)
        finalLeadData.leadScore = score
        finalLeadData.leadCategory = category

        setLeadData(finalLeadData)

        // Save to API
        await saveLead(finalLeadData)

        // Trigger callbacks
        onLeadCapture?.(finalLeadData)
        if (category === 'hot') {
            onHotLead?.(finalLeadData)
        }

        let responseMessage = ''
        if (category === 'hot') {
            responseMessage = t.messages.hotLeadAlert
        } else if (category === 'warm') {
            responseMessage = t.messages.warmLeadAlert
        } else {
            responseMessage = t.thankYou
        }

        addBotMessage(responseMessage, 'lead-score', {
            score,
            category,
            labels: t.leadScore
        })

        setCurrentStep('complete')
    }

    const handleTenantOption = (option: string) => {
        addUserMessage(option)

        if (option === t.tenant.options[0]) {
            setCurrentStep('tenantIssueType')
            setTimeout(() => {
                addBotMessage(
                    locale === 'tr' ? 'Arıza türünü seçin:' : 'Select issue type:',
                    'quick-replies',
                    { replies: Object.values(t.tenant.issueTypes) }
                )
            }, 300)
        } else if (option === t.tenant.options[1]) {
            addBotMessage(t.tenant.rentInfo)
        } else if (option === t.tenant.options[2]) {
            setCurrentStep('tenantContract')
            setTimeout(() => {
                addBotMessage(t.tenant.contractInfo, 'form', { type: 'contact' })
            }, 300)
        } else if (option === t.tenant.options[3]) {
            addBotMessage(
                locale === 'tr'
                    ? 'Anahtar teslimi için ofisimize hafta içi 09:00-18:00 arası gelebilirsiniz.\n\nAdres: [Ofis Adresi]\n\nYanınızda kimlik ve kira sözleşmesi getirmeyi unutmayın.'
                    : 'For key handover, please visit our office Monday-Friday 9AM-6PM.\n\nAddress: [Office Address]\n\nPlease bring your ID and lease agreement.'
            )
        } else {
            setCurrentStep('tenantOther')
            setTimeout(() => {
                addBotMessage(t.tenant.contractInfo, 'form', { type: 'contact' })
            }, 300)
        }
    }

    const handleTenantIssueType = (issueType: string) => {
        addUserMessage(issueType)
        setTenantIssue(prev => ({ ...prev, type: issueType }))
        setCurrentStep('tenantUrgency')
        setTimeout(() => {
            addBotMessage(
                locale === 'tr' ? 'Aciliyet durumu:' : 'Urgency level:',
                'quick-replies',
                { replies: Object.values(t.tenant.urgency) }
            )
        }, 300)
    }

    const handleTenantUrgency = (urgency: string) => {
        addUserMessage(urgency)
        let urgencyLevel: 'emergency' | 'normal' | 'low' = 'normal'
        if (urgency === t.tenant.urgency.emergency) urgencyLevel = 'emergency'
        else if (urgency === t.tenant.urgency.low) urgencyLevel = 'low'

        const updatedIssue = { ...tenantIssue, urgency: urgencyLevel }
        setTenantIssue(updatedIssue)

        if (urgencyLevel === 'emergency') {
            addBotMessage(
                locale === 'tr'
                    ? '🚨 ACİL DURUM!\n\nAcil servis hattımız: 0850 XXX XX XX\n\nEkibimiz en kısa sürede size ulaşacak. Lütfen iletişim bilgilerinizi bırakın.'
                    : '🚨 EMERGENCY!\n\nEmergency hotline: 1-800-XXX-XXXX\n\nOur team will reach you shortly. Please leave your contact info.',
                'form',
                { type: 'contact' }
            )
        } else {
            setCurrentStep('tenantPhoto')
            setTimeout(() => {
                addBotMessage(t.tenant.photoPrompt, 'photo-upload', {})
            }, 300)
        }
    }

    const handlePhotoUpload = () => {
        addBotMessage(
            locale === 'tr' ? 'Fotoğraf alındı. Şimdi iletişim bilgilerinizi paylaşır mısınız?' : 'Photo received. Please share your contact info.',
            'form',
            { type: 'contact' }
        )
        setCurrentStep('tenantContact')
    }

    const handleTenantContactSubmit = (contactData: { name: string; phone: string; email: string }) => {
        const finalIssue: TenantIssue = {
            ...tenantIssue,
            description: `${contactData.name} - ${contactData.phone}`
        }

        onTenantIssue?.(finalIssue)
        addBotMessage(t.tenant.submitted)
        setCurrentStep('complete')
    }

    const handleSend = () => {
        if (!input.trim()) return
        addUserMessage(input.trim())

        const userInput = input.toLowerCase()
        setInput('')

        setTimeout(() => {
            if (userInput.includes('fiyat') || userInput.includes('price') || userInput.includes('bütçe') || userInput.includes('budget')) {
                addBotMessage(t.leadQualification.budget, 'quick-replies', {
                    replies: t.budgetRanges.map(b => b.label)
                })
                setCurrentStep('budget')
            } else if (userInput.includes('daire') || userInput.includes('ev') || userInput.includes('villa') || userInput.includes('apartment')) {
                addBotMessage(t.leadQualification.propertyType, 'quick-replies', {
                    replies: t.propertyTypes
                })
                setCurrentStep('propertyType')
            } else {
                addBotMessage(
                    locale === 'tr'
                        ? 'Size yardımcı olmak için aşağıdaki seçeneklerden birini seçin:'
                        : 'Please select one of the options below:',
                    'quick-replies',
                    { replies: Object.values(t.quickReplies) }
                )
            }
        }, 300)
    }

    const renderMessageContent = (message: Message) => {
        switch (message.type) {
            case 'quick-replies':
                return (
                    <div className="space-y-2">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {message.data?.replies?.map((reply: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (currentStep === 'initial') handleQuickReply(reply)
                                        else if (currentStep === 'purpose') handlePurposeSelect(reply)
                                        else if (currentStep === 'propertyType') handlePropertyTypeSelect(reply)
                                        else if (currentStep === 'budget') handleBudgetSelect(reply)
                                        else if (currentStep === 'timeline') handleTimelineSelect(reply)
                                        else if (currentStep === 'preApproval') handlePreApprovalSelect(reply)
                                        else if (currentStep === 'tenant') handleTenantOption(reply)
                                        else if (currentStep === 'tenantIssueType') handleTenantIssueType(reply)
                                        else if (currentStep === 'tenantUrgency') handleTenantUrgency(reply)
                                        else if (currentStep === 'upsellResponse') {
                                            addUserMessage(reply)
                                            const isInterested = reply.includes('Evet') || reply.includes('Yes')
                                            if (isInterested) {
                                                addBotMessage(
                                                    locale === 'tr'
                                                        ? 'Harika! Bu seçeneklerden biriyle ilgileniyorsunuz. Detaylar için bilgilerinizi bırakın, danışmanımız sizi arasın:'
                                                        : 'Great! You\'re interested in one of these options. Leave your details and our advisor will call you:',
                                                    'form',
                                                    { type: 'contact', leadCategory: leadData.leadCategory }
                                                )
                                            } else {
                                                addBotMessage(
                                                    locale === 'tr'
                                                        ? 'Anlıyorum. Danışmanımız sizin için özel arama yapabilir. İletişim bilgilerinizi bırakır mısınız?'
                                                        : 'I understand. Our advisor can do a custom search for you. Would you leave your contact info?',
                                                    'form',
                                                    { type: 'contact', leadCategory: leadData.leadCategory }
                                                )
                                            }
                                            setCurrentStep('contact')
                                        }
                                    }}
                                    className="px-3 py-1.5 text-sm rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    </div>
                )

            case 'cards':
                const properties = message.data?.properties || []
                if (properties.length === 0) {
                    return <p className="text-sm">{message.content}</p>
                }
                return (
                    <div className="space-y-2">
                        <p className="text-sm font-medium mb-3">{message.content}</p>
                        <div className="relative">
                            <div className="overflow-hidden">
                                <div
                                    className="flex transition-transform duration-300"
                                    style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                                >
                                    {properties.map((property: Property) => (
                                        <div key={property.id} className="min-w-full px-1">
                                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                                <div className="relative h-32">
                                                    <img
                                                        src={property.image}
                                                        alt={property.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {property.badge && (
                                                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                                                            {property.badge}
                                                        </span>
                                                    )}
                                                    {property.roi && (
                                                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                                            {property.roi}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-semibold text-gray-900 text-sm">{property.title}</h4>
                                                    <p className="text-amber-600 font-bold mt-1">{property.price}</p>
                                                    {property.monthlyRent && (
                                                        <p className="text-green-600 text-xs">{property.monthlyRent}</p>
                                                    )}
                                                    <div className="flex items-center text-gray-500 text-xs mt-1">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {property.location}
                                                    </div>
                                                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                                        <span>{property.rooms}</span>
                                                        {property.area && <span>{property.area}</span>}
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        <button className="flex-1 px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors">
                                                            {t.viewDetails}
                                                        </button>
                                                        <button className="flex-1 px-2 py-1 text-xs border border-amber-600 text-amber-600 rounded hover:bg-amber-50 transition-colors">
                                                            {t.schedule}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {properties.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white"
                                        disabled={carouselIndex === 0}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCarouselIndex(Math.min(properties.length - 1, carouselIndex + 1))}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white"
                                        disabled={carouselIndex === properties.length - 1}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                            {properties.length > 1 && (
                                <div className="flex justify-center gap-1 mt-2">
                                    {properties.map((_: Property, i: number) => (
                                        <div
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === carouselIndex ? 'bg-amber-600' : 'bg-gray-300'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )

            case 'lead-score':
                const scoreData = message.data
                const ScoreIcon = scoreData.category === 'hot' ? Flame :
                    scoreData.category === 'warm' ? ThermometerSun : Snowflake
                const scoreColor = scoreData.category === 'hot' ? 'text-red-500' :
                    scoreData.category === 'warm' ? 'text-orange-500' : 'text-blue-500'
                const scoreBg = scoreData.category === 'hot' ? 'bg-red-50 border-red-200' :
                    scoreData.category === 'warm' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'

                return (
                    <div className="space-y-2">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${scoreBg}`}>
                            <ScoreIcon className={`w-5 h-5 ${scoreColor}`} />
                            <div>
                                <p className={`font-semibold text-sm ${scoreColor}`}>
                                    {scoreData.labels[scoreData.category]}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {scoreData.labels[`${scoreData.category}Desc`]}
                                </p>
                            </div>
                        </div>
                    </div>
                )

            case 'form':
                if (message.data?.type === 'contact') {
                    return <ContactForm
                        onSubmit={currentStep.includes('tenant') ? handleTenantContactSubmit : handleContactSubmit}
                        locale={locale}
                        leadCategory={message.data?.leadCategory}
                    />
                }
                if (message.data?.type === 'valuation') {
                    return <ValuationForm locale={locale} onSubmit={(data) => {
                        addUserMessage(`${data.address} - ${data.area}m² - ${data.rooms}`)
                        const minValue = parseInt(data.area) * 40000
                        const maxValue = parseInt(data.area) * 55000
                        addBotMessage(
                            `${t.messages.valuationResult}\n\n${t.valuation.result}:\n💰 ${minValue.toLocaleString()} TL - ${maxValue.toLocaleString()} TL\n\n📊 Bu değerleme yapay zeka tahminidir. Kesin değer için uzman değerleme gerekir.\n\nDetaylı değerleme raporu için iletişim bilgilerinizi paylaşın:`
                        )
                        setTimeout(() => {
                            addBotMessage(t.leadQualification.contact, 'form', { type: 'contact' })
                        }, 1500)
                    }} />
                }
                if (message.data?.type === 'email-only') {
                    return <EmailOnlyForm locale={locale} onSubmit={(email) => {
                        addUserMessage(email)
                        addBotMessage(
                            locale === 'tr'
                                ? `Teşekkürler! Piyasa raporlarını ${email} adresine göndereceğiz.\n\nAraştırma sürecinizde sorularınız olursa bize yazın!`
                                : `Thanks! We'll send market reports to ${email}.\n\nFeel free to reach out if you have questions during your research!`
                        )
                    }} />
                }
                return <p className="text-sm">{message.content}</p>

            case 'appointment':
                return <AppointmentSlotPicker
                    locale={locale}
                    identifier={chatbotIdentifier || ''}
                    leadData={leadData}
                    onSlotSelected={(slot) => {
                        addUserMessage(`${slot.date} - ${slot.time}`)
                        addBotMessage(
                            locale === 'tr'
                                ? `Harika seçim! ${slot.date} tarihinde saat ${slot.time} için randevunuz alındı.\n\n${t.messages.appointmentConfirmed}`
                                : `Great choice! Your appointment is booked for ${slot.date} at ${slot.time}.\n\n${t.messages.appointmentConfirmed}`
                        )
                        onAppointmentBooked?.(slot, leadData)
                        setCurrentStep('complete')
                    }}
                />

            case 'photo-upload':
                return (
                    <div className="space-y-2">
                        <p className="text-sm">{message.content}</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                                {t.tenant.photoButton}
                            </button>
                            <button
                                onClick={() => {
                                    addBotMessage(
                                        locale === 'tr' ? 'Fotoğraf olmadan devam ediyoruz. İletişim bilgilerinizi paylaşır mısınız?' : 'Continuing without photo. Please share your contact info.',
                                        'form',
                                        { type: 'contact' }
                                    )
                                    setCurrentStep('tenantContact')
                                }}
                                className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                            >
                                {locale === 'tr' ? 'Atla' : 'Skip'}
                            </button>
                        </div>
                    </div>
                )

            default:
                return <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        }
    }

    return (
        <>
            {!isOpen && (
                <div className={`fixed bottom-4 ${positionClass} z-50`}>
                    {showNotification && (
                        <div className="absolute -top-2 -right-2 flex items-center justify-center">
                            <span className="relative flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-white text-[10px] font-bold">1</span>
                            </span>
                        </div>
                    )}

                    <div className="flex items-end gap-2">
                        {showNotification && (
                            <div
                                className="bg-white rounded-2xl rounded-br-sm shadow-lg p-3 max-w-[220px] animate-fade-in cursor-pointer border border-gray-100"
                                onClick={() => {
                                    setIsOpen(true)
                                    setShowNotification(false)
                                }}
                            >
                                <p className="text-xs text-gray-700 font-medium">
                                    {locale === 'tr'
                                        ? 'Merhaba! Size yardımcı olabilir miyim?'
                                        : 'Hello! Can I help you?'}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    {locale === 'tr' ? 'Ön Büro Asistanınız' : 'Your Front Desk Assistant'}
                                </p>
                                <span className="text-[10px] text-gray-400 mt-1 block">
                                    {locale === 'tr' ? 'Az önce' : 'Just now'}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setIsOpen(true)
                                setShowNotification(false)
                            }}
                            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {companyLogo ? (
                                <img src={companyLogo} alt="Logo" className="w-8 h-8 object-contain" />
                            ) : (
                                <MessageCircle className="w-7 h-7 text-white" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {isOpen && (
                <div className={`fixed bottom-4 ${positionClass} z-50 w-[360px] h-[540px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up`}>
                    <div
                        className="px-4 py-3 flex items-center justify-between"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {agentPhoto ? (
                                    <img src={agentPhoto} alt={agentName} className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-white" />
                                    </div>
                                )}
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-sm">{t.title}</h3>
                                <p className="text-white/80 text-xs flex items-center">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                                    {t.online} • {t.subtitle}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Demo usage badge */}
                            {remainingMessages !== -1 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${remainingMessages > 2 ? 'bg-white/20' : remainingMessages > 0 ? 'bg-orange-500' : 'bg-red-500'} text-white`}>
                                    {remainingMessages}/{demoChatLimit}
                                </span>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    <div
                        className="flex-1 overflow-y-auto p-4 space-y-3"
                        style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f59e0b\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                            backgroundColor: '#fefce8'
                        }}
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${message.role === 'user'
                                        ? 'bg-amber-600 text-white rounded-br-sm'
                                        : 'bg-white text-gray-800 rounded-bl-sm'
                                        }`}
                                >
                                    {renderMessageContent(message)}
                                    <div className={`text-[10px] mt-1 flex items-center ${message.role === 'user' ? 'text-amber-200 justify-end' : 'text-gray-400'}`}>
                                        {message.timestamp.toLocaleTimeString(locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                        {message.role === 'user' && <CheckCircle className="w-3 h-3 ml-1" />}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(isTyping || loadingProperties) && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t bg-white p-3">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={t.placeholder}
                                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <Send className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-gray-400 mt-2">
                            Powered by <span className="font-semibold text-amber-600">PylonChat</span>
                        </p>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out; }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
        </>
    )
}

// Contact Form Component
function ContactForm({
    onSubmit,
    locale,
    leadCategory
}: {
    onSubmit: (data: { name: string; phone: string; email: string }) => void
    locale: 'tr' | 'en'
    leadCategory?: string
}) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name && phone) {
            onSubmit({ name, phone, email })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            {leadCategory === 'hot' && (
                <div className="flex items-center gap-2 px-2 py-1 bg-red-50 rounded-lg mb-2">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">
                        {locale === 'tr' ? 'Öncelikli işlem yapılacak' : 'Priority processing'}
                    </span>
                </div>
            )}
            <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={locale === 'tr' ? 'Ad Soyad *' : 'Full Name *'}
                    className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                    required
                />
            </div>
            <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={locale === 'tr' ? 'Telefon *' : 'Phone *'}
                    className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                    required
                />
            </div>
            <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={locale === 'tr' ? 'E-posta' : 'Email'}
                    className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                />
            </div>
            <button
                type="submit"
                className="w-full py-2 text-sm text-white rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: '#D97706' }}
            >
                {locale === 'tr' ? 'Gönder' : 'Submit'}
            </button>
        </form>
    )
}

// Email Only Form
function EmailOnlyForm({
    locale,
    onSubmit
}: {
    locale: 'tr' | 'en'
    onSubmit: (email: string) => void
}) {
    const [email, setEmail] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (email) {
            onSubmit(email)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={locale === 'tr' ? 'E-posta adresiniz' : 'Your email address'}
                    className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full py-2 text-sm text-white rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: '#D97706' }}
            >
                {locale === 'tr' ? 'Raporları Gönder' : 'Send Reports'}
            </button>
        </form>
    )
}

// Valuation Form Component
function ValuationForm({ locale, onSubmit }: { locale: 'tr' | 'en'; onSubmit: (data: { address: string; area: string; rooms: string; buildingAge: string }) => void }) {
    const [address, setAddress] = useState('')
    const [area, setArea] = useState('')
    const [rooms, setRooms] = useState('')
    const [buildingAge, setBuildingAge] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (address && area && rooms) {
            onSubmit({ address, area, rooms, buildingAge })
        }
    }

    const t = translations[locale]

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                {t.valuation.title}
            </p>
            <p className="text-xs text-gray-500">{t.valuation.subtitle}</p>
            <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t.valuation.address}
                    className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                    required
                />
            </div>
            <div className="flex gap-2">
                <div className="flex items-center gap-2 flex-1">
                    <Home className="w-4 h-4 text-gray-400" />
                    <input
                        type="number"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder={t.valuation.area}
                        className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                        required
                    />
                </div>
                <select
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                    required
                >
                    <option value="">{t.valuation.rooms}</option>
                    <option value="1+1">1+1</option>
                    <option value="2+1">2+1</option>
                    <option value="3+1">3+1</option>
                    <option value="4+1">4+1</option>
                    <option value="5+">5+</option>
                </select>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                    value={buildingAge}
                    onChange={(e) => setBuildingAge(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                >
                    <option value="">{t.valuation.buildingAge}</option>
                    <option value="0-5">{locale === 'tr' ? '0-5 yıl' : '0-5 years'}</option>
                    <option value="5-10">{locale === 'tr' ? '5-10 yıl' : '5-10 years'}</option>
                    <option value="10-20">{locale === 'tr' ? '10-20 yıl' : '10-20 years'}</option>
                    <option value="20+">{locale === 'tr' ? '20+ yıl' : '20+ years'}</option>
                </select>
            </div>
            <button
                type="submit"
                className="w-full py-2 text-sm text-white rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: '#D97706' }}
            >
                {t.valuation.submit}
            </button>
        </form>
    )
}

// Appointment Slot Picker Component
function AppointmentSlotPicker({
    locale,
    identifier,
    leadData,
    onSlotSelected
}: {
    locale: 'tr' | 'en'
    identifier: string
    leadData: any
    onSlotSelected: (slot: { date: string; time: string; type: string }) => void
}) {
    const [slots, setSlots] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSlot, setSelectedSlot] = useState<any>(null)
    const [bookingName, setBookingName] = useState(leadData.contactName || '')
    const [bookingPhone, setBookingPhone] = useState(leadData.contactPhone || '')
    const [booking, setBooking] = useState(false)

    useEffect(() => {
        if (identifier) {
            fetchSlots()
        }
    }, [identifier])

    const fetchSlots = async () => {
        try {
            const response = await fetch(`/api/appointments?identifier=${identifier}`)
            const data = await response.json()
            setSlots(data.slots?.filter((s: any) => s.available) || generateLocalSlots())
        } catch (error) {
            console.error('Error fetching slots:', error)
            setSlots(generateLocalSlots())
        } finally {
            setLoading(false)
        }
    }

    const generateLocalSlots = () => {
        const slots = []
        const today = new Date()

        for (let i = 1; i <= 5; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() + i)
            const dateStr = date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            })

            if (date.getDay() !== 0) { // Skip Sunday
                slots.push(
                    { date: dateStr, time: '10:00', label: locale === 'tr' ? 'Sabah' : 'Morning', type: 'viewing', available: true },
                    { date: dateStr, time: '14:00', label: locale === 'tr' ? 'Öğleden Sonra' : 'Afternoon', type: 'viewing', available: true }
                )
            }
        }
        return slots.slice(0, 6) // Limit to 6 slots
    }

    const handleBookSlot = async () => {
        if (!selectedSlot || !bookingName || !bookingPhone) return

        setBooking(true)
        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier,
                    date: selectedSlot.date,
                    time: selectedSlot.time,
                    name: bookingName,
                    phone: bookingPhone,
                    type: selectedSlot.type || 'viewing'
                })
            })

            if (response.ok) {
                onSlotSelected(selectedSlot)
            }
        } catch (error) {
            console.error('Error booking appointment:', error)
        } finally {
            setBooking(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                {locale === 'tr' ? 'Müsait zamanlar yükleniyor...' : 'Loading available times...'}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4 text-amber-500" />
                {locale === 'tr' ? 'Randevu Seçin' : 'Select Appointment'}
            </p>

            <div className="grid grid-cols-2 gap-2">
                {slots.map((slot, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 text-left rounded-lg border text-xs transition-all ${selectedSlot === slot
                            ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                            : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                            }`}
                    >
                        <p className="font-medium text-gray-900">{slot.date}</p>
                        <p className="text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {slot.time} - {slot.label}
                        </p>
                    </button>
                ))}
            </div>

            {selectedSlot && (
                <div className="space-y-2 pt-2 border-t">
                    {!leadData.contactName && (
                        <input
                            type="text"
                            value={bookingName}
                            onChange={(e) => setBookingName(e.target.value)}
                            placeholder={locale === 'tr' ? 'Ad Soyad *' : 'Full Name *'}
                            className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                        />
                    )}
                    {!leadData.contactPhone && (
                        <input
                            type="tel"
                            value={bookingPhone}
                            onChange={(e) => setBookingPhone(e.target.value)}
                            placeholder={locale === 'tr' ? 'Telefon *' : 'Phone *'}
                            className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                        />
                    )}
                    <button
                        onClick={handleBookSlot}
                        disabled={booking || !bookingName || !bookingPhone}
                        className="w-full py-2 text-sm text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#D97706' }}
                    >
                        {booking ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {locale === 'tr' ? 'Randevu alınıyor...' : 'Booking...'}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                {locale === 'tr' ? 'Randevuyu Onayla' : 'Confirm Appointment'}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}
