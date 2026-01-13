'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
    X,
    Send,
    MessageCircle,
    Building2,
    Home,
    MapPin,
    DollarSign,
    Calendar,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle,
    Phone,
    Mail,
    User,
    Wrench,
    TrendingUp,
    Star,
    AlertTriangle,
    Flame,
    Snowflake,
    ThermometerSun,
    Camera,
    Upload,
    Key,
    FileText,
    Banknote,
    Target,
    Briefcase,
    Heart
} from 'lucide-react'

// Types
interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    type?: 'text' | 'cards' | 'form' | 'appointment' | 'quick-replies' | 'lead-score' | 'tenant-options' | 'photo-upload'
    data?: any
}

interface Property {
    id: string
    title: string
    price: string
    location: string
    rooms: string
    area: string
    image: string
    badge?: string
    monthlyRent?: string
    roi?: string
}

interface LeadData {
    intent?: 'buy' | 'rent' | 'sell' | 'value' | 'tenant'
    propertyType?: string
    budget?: string
    budgetLevel?: 'low' | 'medium' | 'high' | 'premium'
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
    notes?: string[]
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
        budgetRanges: {
            low: ['1-2 Milyon TL', '2-3 Milyon TL'],
            medium: ['3-5 Milyon TL', '5-7 Milyon TL'],
            high: ['7-10 Milyon TL', '10-15 Milyon TL'],
            premium: ['15-25 Milyon TL', '25+ Milyon TL']
        },
        allBudgets: ['1-3 Milyon TL', '3-5 Milyon TL', '5-10 Milyon TL', '10-20 Milyon TL', '20+ Milyon TL'],
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
            lowBudgetResponse: 'Bu bütçe aralığında da güzel seçeneklerimiz var!\n\nSize özellikle şu bölgeleri önerebilirim:\n• Gelişmekte olan bölgeler\n• Yatırımlık 1+1 daireler\n• Taksitli satış projeleri\n\nBu seçenekleri incelemek ister misiniz?',
            investmentMatch: 'Yatırım için mükemmel seçim!\n\nYüksek kira getirisi olan, üniversite/metro yakını lokasyonları listeliyorum...',
            residenceMatch: 'Oturum için en iyi seçeneklerimizi getiriyorum!\n\nSosyal olanaklar, okul yakınlığı ve ulaşım kriterlerine göre filtreledim...',
            appointmentConfirmed: 'Randevunuz onaylandı!\n\nAdres ve hatırlatma SMS olarak gönderilecektir.\n\n📍 Konum bilgisi randevudan 1 saat önce iletilecek.',
            valuationResult: 'Yapay zeka değerleme sonucunuz hazır!'
        },
        thankYou: 'Teşekkür ederiz!',
        viewDetails: 'Detayları Gör',
        schedule: 'Randevu Al',
        investmentProperties: 'Yatırımlık İlanlar',
        residenceProperties: 'Oturum İçin İlanlar',
        showMore: 'Daha Fazla Göster'
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
        budgetRanges: {
            low: ['$50K-$150K', '$150K-$250K'],
            medium: ['$250K-$400K', '$400K-$600K'],
            high: ['$600K-$900K', '$900K-$1.2M'],
            premium: ['$1.2M-$2M', '$2M+']
        },
        allBudgets: ['$100K-$300K', '$300K-$500K', '$500K-$800K', '$800K-$1.5M', '$1.5M+'],
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
            lowBudgetResponse: 'We have great options in this budget range too!\n\nI can recommend these areas:\n• Emerging neighborhoods\n• Investment 1-bedroom units\n• Installment sale projects\n\nWould you like to explore these?',
            investmentMatch: 'Great choice for investment!\n\nListing high rental yield properties near universities/metro...',
            residenceMatch: 'Getting the best options for your new home!\n\nFiltered by amenities, schools, and transportation...',
            appointmentConfirmed: 'Your appointment is confirmed!\n\nAddress and reminder will be sent via SMS.\n\n📍 Location details will be shared 1 hour before.',
            valuationResult: 'Your AI valuation is ready!'
        },
        thankYou: 'Thank you!',
        viewDetails: 'View Details',
        schedule: 'Schedule Viewing',
        investmentProperties: 'Investment Properties',
        residenceProperties: 'Residence Properties',
        showMore: 'Show More'
    }
}

// Sample properties for demo - Investment focused
const investmentProperties: Property[] = [
    {
        id: 'inv1',
        title: 'Yatırımlık 1+1 Residence',
        price: '2.200.000 TL',
        location: 'Ataşehir, İstanbul',
        rooms: '1+1',
        area: '65 m²',
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
        badge: 'Yatırımlık',
        monthlyRent: '18.000 TL/ay',
        roi: '%9.8 Getiri'
    },
    {
        id: 'inv2',
        title: 'Üniversite Yanı Stüdyo',
        price: '1.800.000 TL',
        location: 'Avcılar, İstanbul',
        rooms: '1+0',
        area: '45 m²',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
        badge: 'Öğrenci Garantili',
        monthlyRent: '15.000 TL/ay',
        roi: '%10 Getiri'
    },
    {
        id: 'inv3',
        title: 'Metro Yanı 2+1',
        price: '3.500.000 TL',
        location: 'Kartal, İstanbul',
        rooms: '2+1',
        area: '95 m²',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
        badge: 'Yüksek Getiri',
        monthlyRent: '28.000 TL/ay',
        roi: '%9.6 Getiri'
    }
]

// Sample properties - Residence focused
const residenceProperties: Property[] = [
    {
        id: 'res1',
        title: 'Modern 3+1 Aile Dairesi',
        price: '4.500.000 TL',
        location: 'Kadıköy, İstanbul',
        rooms: '3+1',
        area: '145 m²',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
        badge: 'Aile İçin Ideal'
    },
    {
        id: 'res2',
        title: 'Bahçeli Müstakil Villa',
        price: '8.500.000 TL',
        location: 'Çekmeköy, İstanbul',
        rooms: '4+1',
        area: '220 m²',
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
        badge: 'Villa'
    },
    {
        id: 'res3',
        title: 'Okul Yakını 3+1',
        price: '5.200.000 TL',
        location: 'Ataşehir, İstanbul',
        rooms: '3+1',
        area: '130 m²',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
        badge: 'Okula 5 dk'
    }
]

// Appointment slots
const appointmentSlots = [
    { date: 'Bugün', time: '14:00', available: true },
    { date: 'Bugün', time: '16:00', available: true },
    { date: 'Yarın', time: '10:00', available: true },
    { date: 'Yarın', time: '14:00', available: false },
    { date: 'Yarın', time: '16:00', available: true },
    { date: 'Cumartesi', time: '11:00', available: true },
]

// Lead scoring function
function calculateLeadScore(lead: LeadData): { score: number; category: 'hot' | 'warm' | 'cold' } {
    let score = 0

    // Timeline scoring (most important)
    if (lead.timelineUrgency === 'immediate') score += 40
    else if (lead.timelineUrgency === 'soon') score += 25
    else if (lead.timelineUrgency === 'later') score += 10
    else if (lead.timelineUrgency === 'browsing') score += 0

    // Pre-approval scoring
    if (lead.hasPreApproval === true) score += 30
    else if (lead.hasPreApproval === false) score += 5

    // Budget level scoring
    if (lead.budgetLevel === 'premium') score += 20
    else if (lead.budgetLevel === 'high') score += 15
    else if (lead.budgetLevel === 'medium') score += 10
    else if (lead.budgetLevel === 'low') score += 5

    // Contact info provided
    if (lead.contactPhone) score += 10

    // Determine category
    let category: 'hot' | 'warm' | 'cold'
    if (score >= 70) category = 'hot'
    else if (score >= 40) category = 'warm'
    else category = 'cold'

    return { score, category }
}

export function RealEstateWidget({
    locale = 'tr',
    primaryColor = '#D97706',
    position = 'bottom-right',
    agentName = 'Emlak Danışmanı',
    agentPhoto,
    companyLogo,
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
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const t = translations[locale]
    const positionClass = position === 'bottom-left' ? 'left-4' : 'right-4'

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    // Initialize with welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            addBotMessage(t.welcome, 'quick-replies', {
                replies: Object.values(t.quickReplies)
            })
        }
    }, [isOpen])

    const addBotMessage = useCallback((content: string, type: Message['type'] = 'text', data?: any) => {
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
    }, [])

    const addUserMessage = useCallback((content: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
            type: 'text'
        }])
    }, [])

    const handleQuickReply = (reply: string) => {
        addUserMessage(reply)

        // Handle different flows
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
                addBotMessage(t.valuation.title, 'form', {
                    type: 'valuation'
                })
            }, 300)
        } else if (reply === t.quickReplies.tenant) {
            setLeadData(prev => ({ ...prev, intent: 'tenant' }))
            setCurrentStep('tenant')
            setTimeout(() => {
                addBotMessage(t.tenant.greeting, 'quick-replies', {
                    replies: t.tenant.options
                })
            }, 300)
        }
    }

    const handlePurposeSelect = (purpose: string) => {
        addUserMessage(purpose)
        const purposeValue = purpose === t.leadQualification.purposeOptions[0] ? 'investment' :
                           purpose === t.leadQualification.purposeOptions[1] ? 'residence' : 'investment'
        setLeadData(prev => ({ ...prev, purpose: purposeValue }))
        setCurrentStep('propertyType')
        setTimeout(() => {
            addBotMessage(t.leadQualification.propertyType, 'quick-replies', {
                replies: t.propertyTypes
            })
        }, 300)
    }

    const handlePropertyTypeSelect = (type: string) => {
        addUserMessage(type)
        setLeadData(prev => ({ ...prev, propertyType: type }))
        setCurrentStep('budget')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.budget}\n\n💡 ${t.leadQualification.budgetNote}`, 'quick-replies', {
                replies: t.allBudgets
            })
        }, 300)
    }

    const handleBudgetSelect = (budget: string) => {
        addUserMessage(budget)

        // Determine budget level
        let budgetLevel: 'low' | 'medium' | 'high' | 'premium' = 'medium'
        const budgetIndex = t.allBudgets.indexOf(budget)
        if (budgetIndex === 0) budgetLevel = 'low'
        else if (budgetIndex === 1) budgetLevel = 'medium'
        else if (budgetIndex === 2) budgetLevel = 'high'
        else budgetLevel = 'premium'

        setLeadData(prev => ({ ...prev, budget, budgetLevel }))
        setCurrentStep('timeline')

        setTimeout(() => {
            addBotMessage(`${t.leadQualification.timeline}\n\n⏰ ${t.leadQualification.timelineNote}`, 'quick-replies', {
                replies: t.timelines
            })
        }, 300)
    }

    const handleTimelineSelect = (timeline: string) => {
        addUserMessage(timeline)

        // Determine urgency
        let timelineUrgency: 'immediate' | 'soon' | 'later' | 'browsing' = 'later'
        const timelineIndex = t.timelines.indexOf(timeline)
        if (timelineIndex === 0) timelineUrgency = 'immediate'
        else if (timelineIndex === 1) timelineUrgency = 'soon'
        else if (timelineIndex === 2) timelineUrgency = 'later'
        else timelineUrgency = 'browsing'

        setLeadData(prev => ({ ...prev, timeline, timelineUrgency }))

        // If just browsing, handle differently
        if (timelineUrgency === 'browsing') {
            setCurrentStep('coldLead')
            setTimeout(() => {
                addBotMessage(t.messages.coldLeadResponse, 'form', {
                    type: 'email-only'
                })
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

    const handlePreApprovalSelect = (answer: string) => {
        addUserMessage(answer)
        const hasPreApproval = answer === t.yesNo[0]
        const updatedLead = { ...leadData, hasPreApproval }
        setLeadData(updatedLead)

        // Calculate lead score
        const { score, category } = calculateLeadScore(updatedLead)
        updatedLead.leadScore = score
        updatedLead.leadCategory = category

        // Show appropriate properties based on purpose
        const properties = updatedLead.purpose === 'investment' ? investmentProperties : residenceProperties
        const propertiesTitle = updatedLead.purpose === 'investment' ? t.investmentProperties : t.residenceProperties
        const matchMessage = updatedLead.purpose === 'investment' ? t.messages.investmentMatch : t.messages.residenceMatch

        setCurrentStep('showProperties')
        setTimeout(() => {
            addBotMessage(matchMessage)
        }, 300)

        setTimeout(() => {
            addBotMessage(propertiesTitle, 'cards', { properties })
        }, 1200)

        // Then ask for contact
        setTimeout(() => {
            setCurrentStep('contact')
            addBotMessage(t.leadQualification.contact, 'form', {
                type: 'contact',
                leadCategory: category
            })
        }, 2500)
    }

    const handleContactSubmit = (contactData: { name: string; phone: string; email: string }) => {
        const finalLeadData: LeadData = {
            ...leadData,
            contactName: contactData.name,
            contactPhone: contactData.phone,
            contactEmail: contactData.email
        }

        // Recalculate score with contact info
        const { score, category } = calculateLeadScore(finalLeadData)
        finalLeadData.leadScore = score
        finalLeadData.leadCategory = category

        setLeadData(finalLeadData)

        // Trigger callbacks
        onLeadCapture?.(finalLeadData)

        if (category === 'hot') {
            onHotLead?.(finalLeadData)
        }

        // Show appropriate response based on lead category
        let responseMessage = ''
        if (category === 'hot') {
            responseMessage = t.messages.hotLeadAlert
        } else if (category === 'warm') {
            responseMessage = t.messages.warmLeadAlert
        } else {
            responseMessage = t.thankYou
        }

        // Show lead score indicator
        addBotMessage(responseMessage, 'lead-score', {
            score,
            category,
            labels: t.leadScore
        })

        // Offer appointment
        setTimeout(() => {
            addBotMessage(t.appointmentSlots.title, 'appointment', { slots: appointmentSlots })
        }, 1500)

        setCurrentStep('complete')
    }

    const handleTenantOption = (option: string) => {
        addUserMessage(option)

        if (option === t.tenant.options[0]) { // Arıza Bildirimi
            setCurrentStep('tenantIssueType')
            setTimeout(() => {
                addBotMessage(
                    locale === 'tr' ? 'Arıza türünü seçin:' : 'Select issue type:',
                    'quick-replies',
                    { replies: Object.values(t.tenant.issueTypes) }
                )
            }, 300)
        } else if (option === t.tenant.options[1]) { // Kira Ödeme
            addBotMessage(t.tenant.rentInfo)
        } else if (option === t.tenant.options[2]) { // Sözleşme
            setCurrentStep('tenantContract')
            setTimeout(() => {
                addBotMessage(t.tenant.contractInfo, 'form', { type: 'contact' })
            }, 300)
        } else if (option === t.tenant.options[3]) { // Anahtar
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

        // For emergencies, show immediate action
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
        // In real implementation, this would trigger file upload
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

    const handleAppointmentSelect = (slot: any) => {
        addUserMessage(`${slot.date} ${slot.time}`)
        onAppointmentBooked?.(slot, leadData)
        addBotMessage(t.messages.appointmentConfirmed)
    }

    const handleSend = () => {
        if (!input.trim()) return
        addUserMessage(input.trim())

        const userInput = input.toLowerCase()
        setInput('')

        setTimeout(() => {
            if (userInput.includes('fiyat') || userInput.includes('price') || userInput.includes('bütçe') || userInput.includes('budget')) {
                addBotMessage(t.leadQualification.budget, 'quick-replies', {
                    replies: t.allBudgets
                })
                setCurrentStep('budget')
            } else if (userInput.includes('daire') || userInput.includes('ev') || userInput.includes('villa') || userInput.includes('apartment')) {
                addBotMessage(t.leadQualification.propertyType, 'quick-replies', {
                    replies: t.propertyTypes
                })
                setCurrentStep('propertyType')
            } else if (userInput.includes('randevu') || userInput.includes('appointment') || userInput.includes('görüşme')) {
                addBotMessage(t.appointmentSlots.title, 'appointment', {
                    slots: appointmentSlots
                })
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

    // Render message content based on type
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
                return (
                    <div className="space-y-2">
                        <p className="text-sm font-medium mb-3">{message.content}</p>
                        <div className="relative">
                            <div className="overflow-hidden">
                                <div
                                    className="flex transition-transform duration-300"
                                    style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                                >
                                    {message.data?.properties?.map((property: Property) => (
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
                                                        <span>{property.area}</span>
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
                            {message.data?.properties?.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white"
                                        disabled={carouselIndex === 0}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCarouselIndex(Math.min(message.data.properties.length - 1, carouselIndex + 1))}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white"
                                        disabled={carouselIndex === message.data.properties.length - 1}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                            <div className="flex justify-center gap-1 mt-2">
                                {message.data?.properties?.map((_: Property, i: number) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === carouselIndex ? 'bg-amber-600' : 'bg-gray-300'}`}
                                    />
                                ))}
                            </div>
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

            case 'appointment':
                return (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">{message.content}</p>
                        <div className="grid grid-cols-2 gap-2">
                            {message.data?.slots?.map((slot: any, i: number) => (
                                <button
                                    key={i}
                                    disabled={!slot.available}
                                    onClick={() => handleAppointmentSelect(slot)}
                                    className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg border transition-colors ${
                                        slot.available
                                            ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700'
                                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {slot.date}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {slot.time}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )

            default:
                return <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        }
    }

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <div className={`fixed bottom-4 ${positionClass} z-50`}>
                    {/* Notification Badge */}
                    {showNotification && (
                        <div className="absolute -top-2 -right-2 flex items-center justify-center">
                            <span className="relative flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-white text-[10px] font-bold">1</span>
                            </span>
                        </div>
                    )}

                    {/* WhatsApp-style bubble with message preview */}
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
                                    {locale === 'tr'
                                        ? 'Ön Büro Asistanınız'
                                        : 'Your Front Desk Assistant'}
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

            {/* Chat Window */}
            {isOpen && (
                <div className={`fixed bottom-4 ${positionClass} z-50 w-[360px] h-[540px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up`}>
                    {/* Header */}
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
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Messages */}
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
                                    className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${
                                        message.role === 'user'
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

                        {/* Typing indicator */}
                        {isTyping && (
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

                    {/* Input */}
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

            {/* Animations */}
            <style jsx global>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
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

// Email Only Form (for cold leads)
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