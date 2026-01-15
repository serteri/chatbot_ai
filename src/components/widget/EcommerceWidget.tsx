'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
    X,
    Send,
    ShoppingCart,
    Package,
    CreditCard,
    Truck,
    RefreshCw,
    CheckCircle,
    Loader2
} from 'lucide-react'
import Link from 'next/link'

// Demo chat limit constants
const DEMO_CHAT_STORAGE_KEY = 'pylonchat_ecommerce_widget'
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

interface EcommerceWidgetProps {
    locale?: 'tr' | 'en'
    primaryColor?: string
    position?: 'bottom-right' | 'bottom-left'
    chatbotId?: string
}

const translations = {
    tr: {
        title: 'Müşteri Desteği',
        subtitle: 'E-Ticaret Asistanı',
        online: 'Çevrimiçi',
        placeholder: 'Mesajınızı yazın...',
        welcome: `Merhaba! 👋 Size nasıl yardımcı olabilirim?`,
        quickReplies: {
            order: '📦 Sipariş takibi',
            return: '🔄 İade/Değişim',
            payment: '💳 Ödeme sorunları',
            shipping: '🚚 Kargo bilgisi',
            product: '🏷️ Ürün sorgusu'
        },
        responses: {
            order: `📦 **Sipariş Takibi**

Sipariş numaranızı paylaşın, hemen kontrol edeyim!

**Sipariş Durumları:**
• ⏳ Hazırlanıyor - 1-2 saat
• 📦 Kargoya verildi - Takip kodu SMS ile gelir
• 🚚 Yolda - 1-3 gün içinde teslim
• ✅ Teslim edildi

Sipariş numaranız hangi format? (Örn: SPR-12345)`,
            return: `🔄 **İade & Değişim**

**İade Koşulları:**
• ✅ 14 gün içinde iade hakkı
• ✅ Orijinal ambalaj + fatura gerekli
• ❌ Kullanılmış ürün iade edilemez

**Adımlar:**
1. Talep oluşturun
2. Onay bekleyin (1-2 gün)
3. Kargo gönderin (ücretsiz)
4. Para iadesi (3-7 gün)

Hangi ürünü iade etmek istiyorsunuz?`,
            payment: `💳 **Ödeme Yardımı**

**Sorun Çözümleri:**
• "Kart reddedildi" → Limit/3D Secure kontrol edin
• "İşlem tamamlanmadı" → Tarayıcı önbelleğini temizleyin
• "CVV hatası" → 3 haneyi kontrol edin

**Taksit Seçenekleri:**
• 500₺+ → 3 taksit
• 1000₺+ → 6 taksit
• 2000₺+ → 12 taksit

Hangi sorunu yaşıyorsunuz?`,
            shipping: `🚚 **Kargo Bilgileri**

**Teslimat Süreleri:**
• Büyükşehir: 1-2 gün
• Diğer: 2-4 gün
• Büyük ürün: 5-7 gün

**Seçenekler:**
• 🚀 Aynı gün (+50₺)
• ⚡ Ertesi gün (+30₺)
• 🆓 Standart (200₺ üzeri ücretsiz)

Siparişinizle ilgili soru var mı?`,
            product: `🏷️ **Ürün Bilgisi**

Size nasıl yardımcı olabilirim?

**Sık Sorulanlar:**
• Stok durumu
• Fiyat bilgisi
• Ürün özellikleri
• Kampanyalar

Ürün adı veya kodunu yazın!`
        }
    },
    en: {
        title: 'Customer Support',
        subtitle: 'E-Commerce Assistant',
        online: 'Online',
        placeholder: 'Type your message...',
        welcome: `Hello! 👋 How can I help you?`,
        quickReplies: {
            order: '📦 Order tracking',
            return: '🔄 Returns/Exchange',
            payment: '💳 Payment issues',
            shipping: '🚚 Shipping info',
            product: '🏷️ Product inquiry'
        },
        responses: {
            order: `📦 **Order Tracking**

Share your order number, I'll check it right away!

**Order Statuses:**
• ⏳ Processing - 1-2 hours
• 📦 Shipped - Tracking code via SMS
• 🚚 In transit - Delivery in 1-3 days
• ✅ Delivered

What's your order number? (e.g., ORD-12345)`,
            return: `🔄 **Returns & Exchange**

**Return Policy:**
• ✅ 14-day return window
• ✅ Original packaging + receipt required
• ❌ Used items cannot be returned

**Steps:**
1. Create request
2. Wait for approval (1-2 days)
3. Ship it (free return shipping)
4. Refund (3-7 days)

Which item would you like to return?`,
            payment: `💳 **Payment Help**

**Troubleshooting:**
• "Card declined" → Check limit/3D Secure
• "Transaction failed" → Clear browser cache
• "CVV error" → Verify 3 digits

**Installment Options:**
• $100+ → 3 installments
• $250+ → 6 installments
• $500+ → 12 installments

What issue are you experiencing?`,
            shipping: `🚚 **Shipping Information**

**Delivery Times:**
• Major cities: 1-2 days
• Other areas: 2-4 days
• Large items: 5-7 days

**Options:**
• 🚀 Same day (+$10)
• ⚡ Next day (+$6)
• 🆓 Standard (free over $50)

Any questions about your order?`,
            product: `🏷️ **Product Information**

How can I help you?

**Common Questions:**
• Stock availability
• Pricing info
• Product features
• Current promotions

Type the product name or code!`
        }
    }
}

export function EcommerceWidget({
    locale = 'tr',
    primaryColor = '#F97316',
    position = 'bottom-right',
    chatbotId
}: EcommerceWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
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
            // For public demos (no chatbotId), use localStorage exclusively
            if (!chatbotId) {
                const stored = localStorage.getItem(DEMO_CHAT_STORAGE_KEY)
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored)
                        if (parsed.expiry && Date.now() < parsed.expiry) {
                            setDemoChatUsed(parsed.count || 0)
                            setLimitReached((parsed.count || 0) >= DEMO_CHAT_MAX_MESSAGES)
                        } else {
                            localStorage.removeItem(DEMO_CHAT_STORAGE_KEY)
                            setDemoChatUsed(0)
                        }
                    } catch {
                        localStorage.removeItem(DEMO_CHAT_STORAGE_KEY)
                        setDemoChatUsed(0)
                    }
                }
                return
            }

            try {
                const url = `/api/demo-chat?chatbotId=${chatbotId}`
                const response = await fetch(url)
                if (response.ok) {
                    const data = await response.json()
                    if (chatbotId || data.authenticated) {
                        setDemoChatUsed(data.used)
                        setDemoChatLimit(data.limit)
                        setLimitReached(data.limit !== -1 && data.used >= data.limit)
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

        // Public demo: LocalStorage only
        if (!chatbotId) {
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
            }
            return false
        } catch {
            return false
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

        const responses = t.responses as Record<string, string>
        if (reply === t.quickReplies.order) {
            addBotMessage(responses.order)
        } else if (reply === t.quickReplies.return) {
            addBotMessage(responses.return)
        } else if (reply === t.quickReplies.payment) {
            addBotMessage(responses.payment)
        } else if (reply === t.quickReplies.shipping) {
            addBotMessage(responses.shipping)
        } else if (reply === t.quickReplies.product) {
            addBotMessage(responses.product)
        }
        setCurrentStep('followup')
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
                                onClick={() => handleQuickReply(reply)}
                                disabled={limitReached}
                                className="px-3 py-1.5 text-xs rounded-full border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors disabled:opacity-50"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
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
                                    {locale === 'tr' ? 'Yardıma mı ihtiyacınız var?' : 'Need help with your order?'}
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
                            <ShoppingCart className="w-7 h-7 text-white" />
                        </button>
                    </div>
                </div>
            )}

            {isOpen && (
                <div className={`fixed bottom-4 ${positionClass} z-50 w-[360px] h-[540px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-white" />
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
                                <span className={`text-xs px-2 py-0.5 rounded-full ${remainingMessages > 2 ? 'bg-white/20' : remainingMessages > 0 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                                    {remainingMessages}/{demoChatLimit}
                                </span>
                            )}
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-orange-50 to-white">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${message.role === 'user' ? 'bg-orange-500 text-white rounded-br-sm' :
                                    message.role === 'system' ? 'bg-red-100 text-red-800 rounded-bl-sm' :
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
                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
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
                                    className="flex-1 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
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
