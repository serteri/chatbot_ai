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
    Star
} from 'lucide-react'

// Types
interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    type?: 'text' | 'cards' | 'form' | 'appointment' | 'quick-replies'
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
}

interface LeadData {
    propertyType?: string
    budget?: string
    location?: string
    timeline?: string
    hasPreApproval?: boolean
    contactName?: string
    contactPhone?: string
    contactEmail?: string
}

interface RealEstateWidgetProps {
    locale?: 'tr' | 'en'
    primaryColor?: string
    position?: 'bottom-right' | 'bottom-left'
    agentName?: string
    agentPhoto?: string
    companyLogo?: string
    onLeadCapture?: (lead: LeadData) => void
}

// Translations
const translations = {
    tr: {
        title: 'Emlak Asistanı',
        online: 'Çevrimiçi',
        placeholder: 'Mesajınızı yazın...',
        welcome: `Merhaba! Ben dijital emlak asistanınız. Size nasıl yardımcı olabilirim?`,
        quickReplies: {
            buy: 'Ev almak istiyorum',
            rent: 'Kiralık arıyorum',
            sell: 'Evimi satmak istiyorum',
            value: 'Evimin değerini öğrenmek istiyorum',
            tenant: 'Kiracı desteği'
        },
        leadQualification: {
            propertyType: 'Ne tür bir gayrimenkul arıyorsunuz?',
            budget: 'Bütçe aralığınız nedir?',
            location: 'Hangi bölgeleri tercih edersiniz?',
            timeline: 'Ne zaman taşınmayı planlıyorsunuz?',
            preApproval: 'Kredi ön onayınız var mı?',
            contact: 'Sizinle iletişime geçebilmemiz için bilgilerinizi paylaşır mısınız?'
        },
        propertyTypes: ['Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'Ticari'],
        budgetRanges: ['1-2 Milyon TL', '2-4 Milyon TL', '4-7 Milyon TL', '7-10 Milyon TL', '10+ Milyon TL'],
        timelines: ['Hemen', '1-3 ay içinde', '3-6 ay içinde', 'Sadece araştırıyorum'],
        yesNo: ['Evet', 'Hayır', 'Başvuracağım'],
        appointmentSlots: {
            title: 'Uygun randevu saatleri:',
            select: 'Randevu Seç'
        },
        valuation: {
            title: 'Ücretsiz Değerleme',
            address: 'Adres',
            area: 'Metrekare',
            rooms: 'Oda Sayısı',
            submit: 'Değerleme Al'
        },
        tenant: {
            title: 'Kiracı Destek',
            options: ['Arıza Bildirimi', 'Kira Ödeme', 'Sözleşme Sorusu', 'Diğer']
        },
        hotLead: 'Sıcak Lead - Hemen İletişime Geç!',
        thankYou: 'Teşekkür ederiz! Danışmanımız en kısa sürede sizinle iletişime geçecek.',
        viewDetails: 'Detayları Gör',
        schedule: 'Randevu Al'
    },
    en: {
        title: 'Real Estate Assistant',
        online: 'Online',
        placeholder: 'Type your message...',
        welcome: `Hello! I'm your digital real estate assistant. How can I help you today?`,
        quickReplies: {
            buy: 'I want to buy',
            rent: 'Looking to rent',
            sell: 'I want to sell my property',
            value: 'Get property valuation',
            tenant: 'Tenant support'
        },
        leadQualification: {
            propertyType: 'What type of property are you looking for?',
            budget: 'What is your budget range?',
            location: 'Which areas do you prefer?',
            timeline: 'When are you planning to move?',
            preApproval: 'Do you have mortgage pre-approval?',
            contact: 'Please share your contact info so we can reach you.'
        },
        propertyTypes: ['Apartment', 'Villa', 'House', 'Land', 'Commercial'],
        budgetRanges: ['$100K-$250K', '$250K-$500K', '$500K-$750K', '$750K-$1M', '$1M+'],
        timelines: ['Immediately', 'Within 1-3 months', 'Within 3-6 months', 'Just browsing'],
        yesNo: ['Yes', 'No', 'Will apply'],
        appointmentSlots: {
            title: 'Available appointment slots:',
            select: 'Select Slot'
        },
        valuation: {
            title: 'Free Valuation',
            address: 'Address',
            area: 'Square footage',
            rooms: 'Bedrooms',
            submit: 'Get Valuation'
        },
        tenant: {
            title: 'Tenant Support',
            options: ['Report Issue', 'Rent Payment', 'Contract Question', 'Other']
        },
        hotLead: 'Hot Lead - Contact Immediately!',
        thankYou: 'Thank you! Our agent will contact you shortly.',
        viewDetails: 'View Details',
        schedule: 'Schedule Viewing'
    }
}

// Sample properties for demo
const sampleProperties: Property[] = [
    {
        id: '1',
        title: 'Modern 3+1 Daire',
        price: '4.500.000 TL',
        location: 'Kadıköy, İstanbul',
        rooms: '3+1',
        area: '145 m²',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
        badge: 'Yeni'
    },
    {
        id: '2',
        title: 'Deniz Manzaralı Villa',
        price: '12.000.000 TL',
        location: 'Bodrum, Muğla',
        rooms: '5+2',
        area: '350 m²',
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
        badge: 'Premium'
    },
    {
        id: '3',
        title: 'Yatırımlık 1+1 Residence',
        price: '2.200.000 TL',
        location: 'Ataşehir, İstanbul',
        rooms: '1+1',
        area: '65 m²',
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
        badge: 'Yatırımlık'
    }
]

// Appointment slots
const appointmentSlots = [
    { date: 'Bugün', time: '14:00', available: true },
    { date: 'Bugün', time: '16:00', available: true },
    { date: 'Yarın', time: '10:00', available: true },
    { date: 'Yarın', time: '14:00', available: false },
    { date: 'Yarın', time: '16:00', available: true },
]

export function RealEstateWidget({
    locale = 'tr',
    primaryColor = '#D97706', // Amber-600
    position = 'bottom-right',
    agentName = 'Emlak Danışmanı',
    agentPhoto,
    companyLogo,
    onLeadCapture
}: RealEstateWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [leadData, setLeadData] = useState<LeadData>({})
    const [currentStep, setCurrentStep] = useState<string>('initial')
    const [carouselIndex, setCarouselIndex] = useState(0)
    const [showNotification, setShowNotification] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

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
        }, 800 + Math.random() * 400)
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
        if (reply === t.quickReplies.buy || reply === t.quickReplies.rent) {
            setCurrentStep('propertyType')
            setTimeout(() => {
                addBotMessage(t.leadQualification.propertyType, 'quick-replies', {
                    replies: t.propertyTypes
                })
            }, 300)
        } else if (reply === t.quickReplies.sell || reply === t.quickReplies.value) {
            setCurrentStep('valuation')
            setTimeout(() => {
                addBotMessage(t.valuation.title, 'form', {
                    type: 'valuation'
                })
            }, 300)
        } else if (reply === t.quickReplies.tenant) {
            setCurrentStep('tenant')
            setTimeout(() => {
                addBotMessage(t.tenant.title, 'quick-replies', {
                    replies: t.tenant.options
                })
            }, 300)
        }
    }

    const handlePropertyTypeSelect = (type: string) => {
        addUserMessage(type)
        setLeadData(prev => ({ ...prev, propertyType: type }))
        setCurrentStep('budget')
        setTimeout(() => {
            addBotMessage(t.leadQualification.budget, 'quick-replies', {
                replies: t.budgetRanges
            })
        }, 300)
    }

    const handleBudgetSelect = (budget: string) => {
        addUserMessage(budget)
        setLeadData(prev => ({ ...prev, budget }))
        setCurrentStep('timeline')
        setTimeout(() => {
            addBotMessage(t.leadQualification.timeline, 'quick-replies', {
                replies: t.timelines
            })
        }, 300)
    }

    const handleTimelineSelect = (timeline: string) => {
        addUserMessage(timeline)
        setLeadData(prev => ({ ...prev, timeline }))

        // Check if hot lead (wants to buy immediately)
        const isHotLead = timeline === t.timelines[0] || timeline === t.timelines[1]

        setCurrentStep('preApproval')
        setTimeout(() => {
            addBotMessage(t.leadQualification.preApproval, 'quick-replies', {
                replies: t.yesNo,
                isHotLead
            })
        }, 300)
    }

    const handlePreApprovalSelect = (answer: string) => {
        addUserMessage(answer)
        const hasPreApproval = answer === t.yesNo[0]
        setLeadData(prev => ({ ...prev, hasPreApproval }))

        // Show property cards
        setCurrentStep('showProperties')
        setTimeout(() => {
            addBotMessage(
                locale === 'tr'
                    ? 'İşte size uygun olabilecek bazı ilanlar:'
                    : 'Here are some properties that might interest you:',
                'cards',
                { properties: sampleProperties }
            )
        }, 300)

        // Then ask for contact
        setTimeout(() => {
            setCurrentStep('contact')
            addBotMessage(t.leadQualification.contact, 'form', {
                type: 'contact'
            })
        }, 2000)
    }

    const handleContactSubmit = (contactData: { name: string; phone: string; email: string }) => {
        const finalLeadData = {
            ...leadData,
            contactName: contactData.name,
            contactPhone: contactData.phone,
            contactEmail: contactData.email
        }
        setLeadData(finalLeadData)

        // Trigger lead capture callback
        onLeadCapture?.(finalLeadData)

        // Check if hot lead
        const isHotLead = leadData.timeline === t.timelines[0] && leadData.hasPreApproval

        if (isHotLead) {
            addBotMessage(
                `🔥 ${t.hotLead}\n\n${t.thankYou}`,
                'text'
            )
        } else {
            addBotMessage(t.thankYou, 'text')
        }

        // Offer appointment
        setTimeout(() => {
            addBotMessage(
                locale === 'tr'
                    ? 'Ev görmek için randevu almak ister misiniz?'
                    : 'Would you like to schedule a viewing?',
                'appointment',
                { slots: appointmentSlots }
            )
        }, 1500)

        setCurrentStep('complete')
    }

    const handleSend = () => {
        if (!input.trim()) return
        addUserMessage(input.trim())

        // Simple response for free-form messages
        const userInput = input.toLowerCase()
        setInput('')

        setTimeout(() => {
            if (userInput.includes('fiyat') || userInput.includes('price') || userInput.includes('bütçe') || userInput.includes('budget')) {
                addBotMessage(t.leadQualification.budget, 'quick-replies', {
                    replies: t.budgetRanges
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
                        ? 'Size yardımcı olmak için daha fazla bilgiye ihtiyacım var. Lütfen aşağıdaki seçeneklerden birini seçin:'
                        : 'I need more information to help you. Please select one of the options below:',
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
                        <p className="text-sm">{message.content}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {message.data?.replies?.map((reply: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (currentStep === 'initial') handleQuickReply(reply)
                                        else if (currentStep === 'propertyType') handlePropertyTypeSelect(reply)
                                        else if (currentStep === 'budget') handleBudgetSelect(reply)
                                        else if (currentStep === 'timeline') handleTimelineSelect(reply)
                                        else if (currentStep === 'preApproval') handlePreApprovalSelect(reply)
                                        else if (currentStep === 'tenant') {
                                            addUserMessage(reply)
                                            addBotMessage(
                                                locale === 'tr'
                                                    ? 'Talebiniz alınmıştır. Müşteri temsilcimiz en kısa sürede sizinle iletişime geçecektir.'
                                                    : 'Your request has been received. Our representative will contact you shortly.'
                                            )
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
                return (
                    <div className="space-y-2">
                        <p className="text-sm mb-3">{message.content}</p>
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
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-semibold text-gray-900 text-sm">{property.title}</h4>
                                                    <p className="text-amber-600 font-bold mt-1">{property.price}</p>
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

            case 'form':
                if (message.data?.type === 'contact') {
                    return <ContactForm onSubmit={handleContactSubmit} locale={locale} />
                }
                if (message.data?.type === 'valuation') {
                    return <ValuationForm locale={locale} onSubmit={(data) => {
                        addUserMessage(`${data.address} - ${data.area}m² - ${data.rooms} oda`)
                        addBotMessage(
                            locale === 'tr'
                                ? `Tahmini değerleme: ${(parseInt(data.area) * 45000).toLocaleString()} TL - ${(parseInt(data.area) * 55000).toLocaleString()} TL\n\nDaha detaylı bir değerleme için lütfen iletişim bilgilerinizi paylaşın.`
                                : `Estimated value: $${(parseInt(data.area) * 350).toLocaleString()} - $${(parseInt(data.area) * 450).toLocaleString()}\n\nFor a detailed valuation, please share your contact info.`
                        )
                        setTimeout(() => {
                            addBotMessage(t.leadQualification.contact, 'form', { type: 'contact' })
                        }, 1500)
                    }} />
                }
                return <p className="text-sm">{message.content}</p>

            case 'appointment':
                return (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">{t.appointmentSlots.title}</p>
                        <div className="grid grid-cols-2 gap-2">
                            {message.data?.slots?.map((slot: any, i: number) => (
                                <button
                                    key={i}
                                    disabled={!slot.available}
                                    onClick={() => {
                                        addUserMessage(`${slot.date} ${slot.time}`)
                                        addBotMessage(
                                            locale === 'tr'
                                                ? `Randevunuz ${slot.date} saat ${slot.time} için oluşturuldu. Adres ve hatırlatma SMS olarak gönderilecektir.`
                                                : `Your appointment is confirmed for ${slot.date} at ${slot.time}. Address and reminder will be sent via SMS.`
                                        )
                                    }}
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
                                className="bg-white rounded-2xl rounded-br-sm shadow-lg p-3 max-w-[200px] animate-fade-in cursor-pointer"
                                onClick={() => {
                                    setIsOpen(true)
                                    setShowNotification(false)
                                }}
                            >
                                <p className="text-xs text-gray-600">
                                    {locale === 'tr'
                                        ? 'Merhaba! Size yardımcı olabilir miyim?'
                                        : 'Hello! Can I help you?'}
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
                <div className={`fixed bottom-4 ${positionClass} z-50 w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up`}>
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
                                    {t.online}
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
function ContactForm({ onSubmit, locale }: { onSubmit: (data: { name: string; phone: string; email: string }) => void; locale: 'tr' | 'en' }) {
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

// Valuation Form Component
function ValuationForm({ locale, onSubmit }: { locale: 'tr' | 'en'; onSubmit: (data: { address: string; area: string; rooms: string }) => void }) {
    const [address, setAddress] = useState('')
    const [area, setArea] = useState('')
    const [rooms, setRooms] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (address && area && rooms) {
            onSubmit({ address, area, rooms })
        }
    }

    const t = translations[locale]

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                {t.valuation.title}
            </p>
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