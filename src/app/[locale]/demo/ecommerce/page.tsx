'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    ShoppingCart,
    Send,
    Users,
    Lock,
    CheckCircle,
    Lightbulb,
    Zap,
    Home,
    Bot,
    User,
    Package,
    CreditCard,
    Truck
} from 'lucide-react'

interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export default function EcommerceDemoPage() {
    const params = useParams()
    const router = useRouter()
    const locale = (params?.locale as string) || 'tr'
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [messageCount, setMessageCount] = useState(0)
    const maxMessages = 5

    // Auto-scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    // Keep focus on input after sending message
    const remainingMessages = maxMessages - messageCount
    useEffect(() => {
        if (!isLoading && remainingMessages > 0) {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 50)
        }
    }, [isLoading])

    // Initialize with welcome message
    useEffect(() => {
        const welcomeContent = locale === 'tr'
            ? `Merhaba! 👋 Ben e-ticaret destek AI'ınızım.

Size yardımcı olabileceğim konular:
• Ürün önerileri ve bilgileri 🛍️
• Sipariş takibi ve durumu 📦
• İade ve değişim işlemleri 🔄
• Ödeme sorunları çözümü 💳
• Kargo ve teslimat bilgileri 🚚

Bu demo sürümünde ${maxMessages} mesaj gönderebilirsiniz. Nasıl yardımcı olabilirim?`
            : locale === 'en'
                ? `Hello! 👋 I'm your e-commerce support AI.

I can help you with:
• Product recommendations and information 🛍️
• Order tracking and status 📦
• Returns and exchanges 🔄
• Payment issue resolution 💳
• Shipping and delivery information 🚚

In this demo version, you can send ${maxMessages} messages. How can I help you?`
                : `Hello! 👋 I'm your e-commerce support AI. You can send ${maxMessages} messages in this demo.`

        const welcomeMessage: ChatMessage = {
            id: 'welcome',
            role: 'assistant',
            content: welcomeContent,
            timestamp: new Date()
        }
        setMessages([welcomeMessage])
    }, [locale, maxMessages])

    const handleSendMessage = async () => {
        if (!input.trim() || messageCount >= maxMessages || isLoading) return

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        const userInput = input.trim()
        setInput('')
        inputRef.current?.focus()
        setIsLoading(true)
        setMessageCount(prev => prev + 1)

        try {
            const response = generateEcommerceResponse(userInput)

            setTimeout(() => {
                const assistantMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, assistantMessage])
                setIsLoading(false)
                inputRef.current?.focus()
            }, 800 + Math.random() * 700)

        } catch (error) {
            console.error('Demo chat error:', error)
            setIsLoading(false)
        }
    }

    const generateEcommerceResponse = (userInput: string): string => {
        const input = userInput.toLowerCase().trim()

        // Selamlaşma
        if (input.match(/^(merhaba|selam|hey|hi|hello|naber|nasılsın|nasıl gidiyor|günaydın|iyi akşamlar|iyi günler)/)) {
            return locale === 'tr'
                ? `Merhaba! 😊 Hoş geldiniz! Size nasıl yardımcı olabilirim?

Örnek sorular:
• "Siparişim nerede?"
• "İade yapmak istiyorum"
• "Ödeme sorunum var"

Ne hakkında yardıma ihtiyacınız var?`
                : `Hello! 😊 Welcome! How can I help you today?

Example questions:
• "Where is my order?"
• "I want to return an item"
• "I have a payment issue"

What do you need help with?`
        }

        // Teşekkür
        if (input.match(/(teşekkür|sağol|thanks|thank you|eyvallah|tşk)/)) {
            return locale === 'tr'
                ? `Rica ederim! 🙏 Yardımcı olabildiysem ne mutlu bana!

Başka bir sorunuz olursa yazmanız yeterli. İyi alışverişler! 🛍️`
                : `You're welcome! 🙏 I'm glad I could help!

If you have any other questions, just ask. Happy shopping! 🛍️`
        }

        // Nasılsın
        if (input.match(/(nasılsın|how are you|iyi misin|naber|ne var ne yok)/)) {
            return locale === 'tr'
                ? `Harikayım, teşekkür ederim! 😊 Siz nasılsınız?

Bugün size nasıl yardımcı olabilirim? Sipariş takibi, ürün önerisi veya iade işlemleri konusunda sorularınızı yanıtlayabilirim.`
                : `I'm doing great, thank you! 😊 How are you?

How can I help you today? I can answer questions about order tracking, product recommendations, or returns.`
        }

        // Sipariş takibi
        if (input.match(/(sipariş|order|kargo|cargo|nerede|where|takip|track|tracking)/)) {
            return locale === 'tr'
                ? `📦 **Sipariş Takip Sistemi**

Sipariş durumunuzu kontrol etmek için:

1️⃣ **Sipariş numaranızı** girin (10 haneli kod)
2️⃣ Veya **e-posta adresinizi** söyleyin

🚚 **Kargo Süreleri:**
- İstanbul içi: 1-2 iş günü
- Diğer iller: 2-4 iş günü
- Express: Aynı gün teslimat

💡 Sipariş numaranız yoksa kayıtlı e-postanızı kontrol edin!

Sipariş numaranızı paylaşır mısınız?`
                : `📦 **Order Tracking System**

To check your order status:

1️⃣ Enter your **order number** (10-digit code)
2️⃣ Or provide your **email address**

🚚 **Delivery Times:**
- Local: 1-2 business days
- Standard: 2-4 business days
- Express: Same day delivery

💡 If you don't have your order number, check your registered email!

Can you share your order number?`
        }

        // Ürün önerisi
        if (input.match(/(ürün|product|öneri|recommend|ne alayım|suggestion|indirim|discount|kampanya)/)) {
            return locale === 'tr'
                ? `🛍️ **Günün Önerileri**

🔥 **Çok Satanlar:**
• iPhone 15 Pro - ₺64,999 (%10 indirim)
• Samsung Galaxy S24 - ₺44,999
• MacBook Air M3 - ₺54,999

🎁 **Özel Kampanyalar:**
- Elektronik: %15 ekstra indirim
- Moda: Al 2 Öde 1
- Kozmetik: Ücretsiz kargo

💳 **Ödeme Avantajları:**
- 12 aya varan taksit
- 150₺ üzeri ücretsiz kargo

Hangi kategori ilginizi çekiyor?`
                : `🛍️ **Today's Recommendations**

🔥 **Best Sellers:**
• iPhone 15 Pro - $999 (10% off)
• Samsung Galaxy S24 - $899
• MacBook Air M3 - $1,099

🎁 **Special Offers:**
- Electronics: Extra 15% off
- Fashion: Buy 2 Get 1 Free
- Beauty: Free shipping

💳 **Payment Benefits:**
- Up to 12 month installments
- Free shipping over $50

Which category interests you?`
        }

        // İade
        if (input.match(/(iade|return|değişim|exchange|geri|refund|para iade)/)) {
            return locale === 'tr'
                ? `🔄 **İade & Değişim İşlemleri**

✅ **30 Gün İade Garantisi**

📋 **İade Koşulları:**
- Ürün kullanılmamış olmalı
- Orijinal ambalajında olmalı
- Etiketler çıkarılmamış olmalı

🚚 **İade Kargo:**
- Premium üyeler: Ücretsiz
- Standart: Alıcı öder

💰 **Para İadesi:**
- Kredi kartı: 3-5 iş günü
- Banka havalesi: 5-7 iş günü

İade başlatmak için sipariş numaranızı paylaşır mısınız?`
                : `🔄 **Returns & Exchanges**

✅ **30-Day Return Policy**

📋 **Return Conditions:**
- Product must be unused
- Original packaging required
- Tags must be attached

🚚 **Return Shipping:**
- Premium members: Free
- Standard: Buyer pays

💰 **Refund Timeline:**
- Credit card: 3-5 business days
- Bank transfer: 5-7 business days

Would you like to start a return? Please share your order number.`
        }

        // Ödeme
        if (input.match(/(ödeme|payment|kart|card|taksit|installment|fatura|invoice|sorun|problem|hata|error)/)) {
            return locale === 'tr'
                ? `💳 **Ödeme Destek Merkezi**

**Kabul Edilen Yöntemler:**
- Kredi/Banka Kartı (Visa, MC, Troy)
- Apple Pay / Google Pay
- Havale/EFT
- Kapıda Ödeme

📊 **Taksit Seçenekleri:**
- 3 taksit: Komisyonsuz
- 6 taksit: +%2
- 12 taksit: +%5

⚠️ **Ödeme Sorunu mu Yaşıyorsunuz?**
1. Kart limitinizi kontrol edin
2. 3D Secure'u onaylayın
3. Farklı bir kart deneyin

Hangi konuda yardımcı olabilirim?`
                : `💳 **Payment Support Center**

**Accepted Methods:**
- Credit/Debit Cards (Visa, MC, Amex)
- Apple Pay / Google Pay
- Bank Transfer
- Cash on Delivery

📊 **Installment Options:**
- 3 months: Commission-free
- 6 months: +2%
- 12 months: +5%

⚠️ **Having Payment Issues?**
1. Check your card limit
2. Confirm 3D Secure
3. Try a different card

What can I help you with?`
        }

        // Kargo
        if (input.match(/(kargo|shipping|teslimat|delivery|ne zaman|when|geliyor)/)) {
            return locale === 'tr'
                ? `🚚 **Kargo & Teslimat Bilgileri**

**Teslimat Süreleri:**
- Aynı gün teslimat: 17:00'ye kadar
- Standart: 2-4 iş günü
- Express: 1 iş günü

📍 **Teslimat Noktaları:**
- Ev/İş adresi
- MNG Kargo noktası
- Posta makinesi

💰 **Kargo Ücreti:**
- 150₺ üzeri: Ücretsiz
- Standart: 29.90₺
- Express: 49.90₺

Siparişinizle ilgili bir sorunuz mu var?`
                : `🚚 **Shipping & Delivery Info**

**Delivery Times:**
- Same day: Order before 5 PM
- Standard: 2-4 business days
- Express: 1 business day

📍 **Delivery Options:**
- Home/Office address
- Pickup point
- Locker

💰 **Shipping Cost:**
- Over $50: Free
- Standard: $4.99
- Express: $9.99

Do you have a question about your shipment?`
        }

        // Default - akıllı fallback
        return locale === 'tr'
            ? `Size yardımcı olmak için buradayım! 🛒

Şu konularda sorabilirsiniz:
• **"Siparişim nerede?"** - Anlık takip
• **"İade yapmak istiyorum"** - 30 gün garanti
• **"Ürün öner"** - Kişisel öneriler
• **"Taksit seçenekleri"** - 12 aya kadar

Veya direkt sorunuzu yazın! 😊

💫 **Not:** Bu demo versiyonudur. Tam özellikler için kayıt olun.`
            : `I'm here to help you! 🛒

You can ask about:
• **"Where is my order?"** - Real-time tracking
• **"I want to return"** - 30-day guarantee
• **"Recommend products"** - Personalized suggestions
• **"Installment options"** - Up to 12 months

Or just type your question! 😊

💫 **Note:** This is a demo version. Sign up for full features.`
    }

    const handleLanguageSwitch = (newLocale: string) => {
        const currentPath = window.location.pathname
        const supportedLocales = ['tr', 'en', 'de', 'es', 'fr']
        const segments = currentPath.split('/').filter(Boolean)

        if (segments.length > 0 && supportedLocales.includes(segments[0])) {
            segments[0] = newLocale
        } else {
            segments.unshift(newLocale)
        }

        router.push(`/${segments.join('/')}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
            {/* Navigation Bar */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link href={`/${locale}`} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">PylonChat</span>
                        </Link>

                        <div className="flex items-center bg-gray-100/80 backdrop-blur border rounded-xl p-1">
                            {['tr', 'en', 'es', 'de', 'fr'].map((lang) => (
                                <Button
                                    key={lang}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLanguageSwitch(lang)}
                                    className={`text-xs px-3 py-1 h-8 mx-0.5 rounded-lg transition-all ${locale === lang
                                        ? 'bg-white shadow-md text-orange-600 font-semibold'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                >
                                    {lang.toUpperCase()}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                                <ShoppingCart className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-left">
                                <h1 className="text-3xl md:text-4xl font-bold">
                                    {locale === 'tr' ? 'E-Ticaret AI Asistanı' : 'E-Commerce AI Assistant'}
                                </h1>
                                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mt-1">
                                    DEMO
                                </Badge>
                            </div>
                        </div>
                        <p className="text-orange-100 text-lg">
                            {locale === 'tr'
                                ? 'Sipariş takibi, ürün önerileri ve müşteri desteği'
                                : 'Order tracking, product recommendations and customer support'}
                        </p>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap justify-center gap-2 mt-6">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center">
                                <Package className="w-4 h-4 mr-1" /> {locale === 'tr' ? 'Sipariş Takibi' : 'Order Tracking'}
                            </span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center">
                                <CreditCard className="w-4 h-4 mr-1" /> {locale === 'tr' ? 'Ödeme Desteği' : 'Payment Support'}
                            </span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center">
                                <Truck className="w-4 h-4 mr-1" /> {locale === 'tr' ? 'Kargo Bilgisi' : 'Shipping Info'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Section */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <Card className="shadow-2xl border-0 overflow-hidden">
                        {/* Chat Header */}
                        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">
                                            {locale === 'tr' ? 'Müşteri Desteği' : 'Customer Support'}
                                        </CardTitle>
                                        <div className="flex items-center space-x-1 text-orange-100 text-sm">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            <span>{locale === 'tr' ? 'Çevrimiçi' : 'Online'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge
                                        className={`${remainingMessages > 2 ? 'bg-white/20' : remainingMessages > 0 ? 'bg-yellow-500' : 'bg-red-600'} text-white border-0`}
                                    >
                                        <Zap className="w-3 h-3 mr-1" />
                                        {remainingMessages}/{maxMessages}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>

                        {/* Messages */}
                        <CardContent className="h-[450px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-end space-x-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                            ? 'bg-orange-500'
                                            : 'bg-gradient-to-br from-orange-400 to-red-500'
                                            }`}>
                                            {message.role === 'user'
                                                ? <User className="h-4 w-4 text-white" />
                                                : <Bot className="h-4 w-4 text-white" />
                                            }
                                        </div>

                                        {/* Message Bubble */}
                                        <div
                                            className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                                                ? 'bg-orange-500 text-white rounded-br-md'
                                                : 'bg-white border border-gray-200 shadow-sm rounded-bl-md'
                                                }`}
                                        >
                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {message.content}
                                            </div>
                                            <div className={`text-xs mt-2 flex items-center ${message.role === 'user' ? 'text-orange-200 justify-end' : 'text-gray-400'
                                                }`}>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                {message.timestamp.toLocaleTimeString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex items-end space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </CardContent>

                        {/* Input Area */}
                        <div className="border-t bg-white p-4">
                            {remainingMessages > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex space-x-2">
                                        <Input
                                            ref={inputRef}
                                            autoFocus
                                            placeholder={locale === 'tr' ? "Mesajınızı yazın..." : "Type your message..."}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            disabled={isLoading}
                                            className="flex-1 h-12 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!input.trim() || isLoading}
                                            className="h-12 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 transition-all"
                                        >
                                            <Send className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center">
                                            <Lightbulb className="w-3 h-3 mr-1" />
                                            {locale === 'tr' ? 'Örnek: "Siparişim nerede?"' : 'Example: "Where is my order?"'}
                                        </div>
                                        <Progress value={(messageCount / maxMessages) * 100} className="w-24 h-2" />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Lock className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 mb-4">
                                        {locale === 'tr' ? 'Demo süresi bitti' : 'Demo ended'}
                                    </p>
                                    <Link href={`/${locale}/auth/register`}>
                                        <Button className="bg-green-600 hover:bg-green-700">
                                            <Users className="mr-2 h-4 w-4" />
                                            {locale === 'tr' ? 'Ücretsiz Kayıt Ol' : 'Sign Up Free'}
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}