'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
    X,
    Send,
    MessageCircle,
    GraduationCap,
    Globe,
    DollarSign,
    Calendar,
    CheckCircle,
    Phone,
    Mail,
    User,
    Loader2
} from 'lucide-react'
import Link from 'next/link'

// Demo chat limit constants
const DEMO_CHAT_STORAGE_KEY = 'pylonchat_education_widget'
const DEMO_CHAT_MAX_MESSAGES = 5
const DEMO_CHAT_EXPIRY_HOURS = 24

interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    type?: 'text' | 'quick-replies' | 'form'
    data?: any
}

interface LeadData {
    studyLevel?: 'bachelor' | 'master' | 'phd' | 'language'
    country?: string
    budget?: string
    timeline?: string
    contactName?: string
    contactPhone?: string
    contactEmail?: string
}

interface EducationWidgetProps {
    locale?: 'tr' | 'en'
    primaryColor?: string
    position?: 'bottom-right' | 'bottom-left'
    agentName?: string
    chatbotId?: string
}

const translations = {
    tr: {
        title: 'Eğitim Danışmanı',
        subtitle: 'Yurtdışı Eğitim Uzmanı',
        online: 'Çevrimiçi',
        placeholder: 'Mesajınızı yazın...',
        welcome: `Merhaba! 👋 Ben eğitim danışmanınızım. Yurtdışı eğitim konusunda size yardımcı olabilirim.`,
        quickReplies: {
            bachelor: 'Lisans okumak istiyorum',
            master: 'Yüksek lisans ilgileniyorum',
            language: 'Dil okulu arıyorum',
            scholarship: 'Burs fırsatları neler?'
        },
        countries: ['Almanya', 'ABD', 'İngiltere', 'Kanada', 'Avustralya'],
        budgets: ['Burs ile', '€500-1000/ay', '€1000-2000/ay', '€2000+/ay'],
        timelines: ['Bu yıl (2024)', '2025', '2026+', 'Sadece araştırıyorum'],
        messages: {
            countryQuestion: 'Hangi ülkede eğitim almayı düşünüyorsunuz?',
            budgetQuestion: 'Aylık bütçeniz ne olabilir?',
            timelineQuestion: 'Ne zaman başlamayı planlıyorsunuz?',
            contactRequest: 'Size özel danışmanlık için iletişim bilgilerinizi paylaşır mısınız?',
            thankYou: '🎓 Teşekkürler! Danışmanımız en kısa sürede sizinle iletişime geçecek.'
        }
    },
    en: {
        title: 'Education Advisor',
        subtitle: 'Study Abroad Expert',
        online: 'Online',
        placeholder: 'Type your message...',
        welcome: `Hello! 👋 I'm your education advisor. I can help you with studying abroad.`,
        quickReplies: {
            bachelor: "I want to study Bachelor's",
            master: "I'm interested in Master's",
            language: 'Looking for language school',
            scholarship: 'What scholarships are available?'
        },
        countries: ['Germany', 'USA', 'UK', 'Canada', 'Australia'],
        budgets: ['With scholarship', '$500-1000/mo', '$1000-2000/mo', '$2000+/mo'],
        timelines: ['This year (2024)', '2025', '2026+', 'Just researching'],
        messages: {
            countryQuestion: 'Which country are you considering for your studies?',
            budgetQuestion: 'What would be your monthly budget?',
            timelineQuestion: 'When are you planning to start?',
            contactRequest: 'Please share your contact info for personalized advice.',
            thankYou: '🎓 Thank you! Our advisor will contact you shortly.'
        }
    }
}

export function EducationWidget({
    locale = 'tr',
    primaryColor = '#2563EB',
    position = 'bottom-right',
    agentName = 'Eğitim Danışmanı',
    chatbotId
}: EducationWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [leadData, setLeadData] = useState<LeadData>({})
    const [currentStep, setCurrentStep] = useState<string>('initial')
    const [showNotification, setShowNotification] = useState(true)
    const [demoChatUsed, setDemoChatUsed] = useState(0)
    const [demoChatLimit, setDemoChatLimit] = useState(DEMO_CHAT_MAX_MESSAGES)
    const [limitReached, setLimitReached] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const t = translations[locale]
    const positionClass = position === 'bottom-left' ? 'left-4' : 'right-4'
    const remainingMessages = demoChatLimit === -1 ? -1 : Math.max(0, demoChatLimit - demoChatUsed)

    // Check demo chat usage on mount
    useEffect(() => {
        const checkUsage = async () => {
            try {
                const url = chatbotId
                    ? `/api/demo-chat?chatbotId=${chatbotId}`
                    : '/api/demo-chat'
                const response = await fetch(url)
                if (response.ok) {
                    const data = await response.json()
                    if (chatbotId || data.authenticated) {
                        setDemoChatUsed(data.used)
                        setDemoChatLimit(data.limit)
                        setLimitReached(data.limit !== -1 && data.used >= data.limit)
                    } else {
                        const stored = localStorage.getItem(DEMO_CHAT_STORAGE_KEY)
                        if (stored) {
                            try {
                                const parsed = JSON.parse(stored)
                                if (parsed.expiry && Date.now() < parsed.expiry) {
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
            }
        }
        checkUsage()
    }, [chatbotId])

    const incrementUsage = async (): Promise<boolean> => {
        if (limitReached) return false
        try {
            const response = await fetch('/api/demo-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatbotId })
            })
            const data = await response.json()
            if (chatbotId || data.authenticated) {
                if (!data.success) {
                    setLimitReached(true)
                    return false
                }
                setDemoChatUsed(data.used)
                setLimitReached(data.remaining === 0)
                return true
            } else {
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
        } catch {
            const newCount = demoChatUsed + 1
            if (newCount > DEMO_CHAT_MAX_MESSAGES) {
                setLimitReached(true)
                return false
            }
            setDemoChatUsed(newCount)
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
        if (limitReached && currentStep !== 'limitReached') return

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
        const canSend = await incrementUsage()
        if (!canSend) {
            setCurrentStep('limitReached')
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: locale === 'tr'
                    ? '⚠️ Demo chat limitinize ulaştınız. Kayıt olun veya planınızı yükseltin.'
                    : '⚠️ Demo limit reached. Please register or upgrade.',
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
    }, [locale, demoChatUsed])

    const handleQuickReply = async (reply: string) => {
        await addUserMessage(reply)
        if (limitReached) return

        if (reply === t.quickReplies.bachelor || reply === t.quickReplies.master) {
            setLeadData(prev => ({ ...prev, studyLevel: reply === t.quickReplies.bachelor ? 'bachelor' : 'master' }))
            setCurrentStep('country')
            setTimeout(() => {
                addBotMessage(t.messages.countryQuestion, 'quick-replies', { replies: t.countries })
            }, 300)
        } else if (reply === t.quickReplies.language) {
            setLeadData(prev => ({ ...prev, studyLevel: 'language' }))
            setCurrentStep('country')
            setTimeout(() => {
                addBotMessage(t.messages.countryQuestion, 'quick-replies', { replies: t.countries })
            }, 300)
        } else if (reply === t.quickReplies.scholarship) {
            addBotMessage(locale === 'tr'
                ? '💰 **Popüler Burs Programları:**\n\n🇩🇪 DAAD (Almanya) - €934/ay\n🇬🇧 Chevening (İngiltere) - Tam burs\n🇺🇸 Fulbright (ABD) - Tam burs\n🇪🇺 Erasmus+ - €700-1400/ay\n\nHangi ülkeyi tercih edersiniz?'
                : '💰 **Popular Scholarships:**\n\n🇩🇪 DAAD (Germany) - €934/mo\n🇬🇧 Chevening (UK) - Full funding\n🇺🇸 Fulbright (USA) - Full funding\n🇪🇺 Erasmus+ - €700-1400/mo\n\nWhich country do you prefer?',
                'quick-replies', { replies: t.countries })
            setCurrentStep('country')
        }
    }

    const handleCountrySelect = async (country: string) => {
        await addUserMessage(country)
        if (limitReached) return

        setLeadData(prev => ({ ...prev, country }))
        setCurrentStep('budget')
        setTimeout(() => {
            addBotMessage(t.messages.budgetQuestion, 'quick-replies', { replies: t.budgets })
        }, 300)
    }

    const handleBudgetSelect = async (budget: string) => {
        await addUserMessage(budget)
        if (limitReached) return

        setLeadData(prev => ({ ...prev, budget }))
        setCurrentStep('timeline')
        setTimeout(() => {
            addBotMessage(t.messages.timelineQuestion, 'quick-replies', { replies: t.timelines })
        }, 300)
    }

    const handleTimelineSelect = async (timeline: string) => {
        await addUserMessage(timeline)
        if (limitReached) return

        setLeadData(prev => ({ ...prev, timeline }))
        setCurrentStep('contact')
        setTimeout(() => {
            addBotMessage(t.messages.contactRequest, 'form', { type: 'contact' })
        }, 300)
    }

    const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const formData = new FormData(form)
        const name = formData.get('name') as string
        const phone = formData.get('phone') as string
        const email = formData.get('email') as string

        setLeadData(prev => ({ ...prev, contactName: name, contactPhone: phone, contactEmail: email }))
        addBotMessage(t.messages.thankYou)
        setCurrentStep('complete')
    }

    const renderMessageContent = (message: Message) => {
        if (message.type === 'quick-replies' && message.data?.replies) {
            return (
                <div>
                    <p className="text-sm whitespace-pre-wrap mb-3">{message.content}</p>
                    <div className="flex flex-wrap gap-2">
                        {message.data.replies.map((reply: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (currentStep === 'initial') handleQuickReply(reply)
                                    else if (currentStep === 'country') handleCountrySelect(reply)
                                    else if (currentStep === 'budget') handleBudgetSelect(reply)
                                    else if (currentStep === 'timeline') handleTimelineSelect(reply)
                                }}
                                disabled={limitReached}
                                className="px-3 py-1.5 text-xs rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                </div>
            )
        }

        if (message.type === 'form' && message.data?.type === 'contact') {
            return (
                <div>
                    <p className="text-sm whitespace-pre-wrap mb-3">{message.content}</p>
                    <form onSubmit={handleContactSubmit} className="space-y-2">
                        <input name="name" placeholder={locale === 'tr' ? 'Ad Soyad' : 'Full Name'} required className="w-full px-3 py-2 text-sm border rounded-lg" />
                        <input name="phone" type="tel" placeholder={locale === 'tr' ? 'Telefon' : 'Phone'} required className="w-full px-3 py-2 text-sm border rounded-lg" />
                        <input name="email" type="email" placeholder="Email" className="w-full px-3 py-2 text-sm border rounded-lg" />
                        <button type="submit" className="w-full py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            {locale === 'tr' ? 'Gönder' : 'Submit'}
                        </button>
                    </form>
                </div>
            )
        }

        return <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                                onClick={() => { setIsOpen(true); setShowNotification(false) }}
                            >
                                <p className="text-xs text-gray-700 font-medium">
                                    {locale === 'tr' ? 'Yurtdışı eğitim için yardım alın!' : 'Get help for studying abroad!'}
                                </p>
                                <span className="text-[10px] text-gray-400 mt-1 block">
                                    {locale === 'tr' ? 'Az önce' : 'Just now'}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => { setIsOpen(true); setShowNotification(false) }}
                            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <GraduationCap className="w-7 h-7 text-white" />
                        </button>
                    </div>
                </div>
            )}

            {isOpen && (
                <div className={`fixed bottom-4 ${positionClass} z-50 w-[360px] h-[540px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-sm">{t.title}</h3>
                                <p className="text-white/80 text-xs flex items-center">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                                    {t.online}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {remainingMessages !== -1 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${remainingMessages > 2 ? 'bg-white/20' : remainingMessages > 0 ? 'bg-orange-500' : 'bg-red-500'} text-white`}>
                                    {remainingMessages}/{demoChatLimit}
                                </span>
                            )}
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-blue-50 to-white">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${message.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' :
                                    message.role === 'system' ? 'bg-orange-100 text-orange-800 rounded-bl-sm' :
                                        'bg-white text-gray-800 rounded-bl-sm'
                                    }`}>
                                    {renderMessageContent(message)}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t bg-white p-3">
                        {!limitReached ? (
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && input.trim() && addUserMessage(input.trim()).then(() => setInput(''))}
                                    placeholder={t.placeholder}
                                    className="flex-1 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => input.trim() && addUserMessage(input.trim()).then(() => setInput(''))}
                                    disabled={!input.trim()}
                                    className="px-4 py-2 rounded-xl text-white disabled:opacity-50"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-2">
                                <p className="text-sm text-gray-600 mb-2">{locale === 'tr' ? 'Demo süresi bitti' : 'Demo ended'}</p>
                                <Link href={`/${locale}/auth/register`} className="inline-block px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                                    {locale === 'tr' ? 'Ücretsiz Kayıt Ol' : 'Sign Up Free'}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
