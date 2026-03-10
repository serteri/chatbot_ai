'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    MessageSquare,
    Send,
    Users,
    Lock,
    CheckCircle,
    Lightbulb,
    Zap,
    Bot,
    User
} from 'lucide-react'

interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const STORAGE_KEY = 'ndisshield_general_demo'
const MAX_MESSAGES = 5
const EXPIRY_HOURS = 24

export default function GeneralDemoPage() {
    const params = useParams()
    const router = useRouter()
    const locale = (params?.locale as string) || 'en'
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [messageCount, setMessageCount] = useState(0)
    const [isInitialized, setIsInitialized] = useState(false)

    // Load message count from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                const data = JSON.parse(stored)
                const now = Date.now()
                // Check if expired (24 hours)
                if (data.expiry && now < data.expiry) {
                    setMessageCount(data.count || 0)
                } else {
                    // Expired, reset
                    localStorage.removeItem(STORAGE_KEY)
                }
            } catch {
                localStorage.removeItem(STORAGE_KEY)
            }
        }
        setIsInitialized(true)
    }, [])

    // Save message count to localStorage whenever it changes
    useEffect(() => {
        if (isInitialized && messageCount > 0) {
            const data = {
                count: messageCount,
                expiry: Date.now() + (EXPIRY_HOURS * 60 * 60 * 1000)
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        }
    }, [messageCount, isInitialized])

    const remainingMessages = MAX_MESSAGES - messageCount

    // Auto-scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    // Focus input after response
    useEffect(() => {
        if (!isLoading && remainingMessages > 0) {
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isLoading, remainingMessages])

    // Welcome message
    useEffect(() => {
        if (!isInitialized) return

        const welcomeContent = locale === 'tr'
            ? `Merhaba! 👋 Ben NDIS Shield Hub Genel Asistanıyım.
            
Size platformumuz ve sunduğumuz hizmetler hakkında bilgi verebilirim.

🤖 **Neler yapabilirim?**
• Hizmet Sözleşmesi Analizi (NDIS)
• Avustralya (Sydney) tabanlı güvenli veri politikamızı açıklamak
• Fiyatlandırma politikalarımızı açıklamak

**Örnek sorular:**
"Hizmet Sözleşmesi Analizi nasıl çalışır?"
"Fiyatlarınız nasıl?"
"Kurulum ne kadar sürer?"

Nasıl yardımcı olabilirim?`
            : `Hello! 👋 I'm the NDIS Shield Hub General Assistant.

I can help you with information about our platform and services.

🤖 **What can I do?**
• Highlight NDIS Service Agreement Validator features
• Explain our Sovereign Data (Sydney) policies
• Provide pricing information

**Example questions:**
"How does the NDIS analysis work?"
"How is your pricing?"
"How long does setup take?"

How can I help you today?`

        setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: welcomeContent,
            timestamp: new Date()
        }])
    }, [locale, isInitialized])

    const handleSendMessage = async () => {
        if (!input.trim() || messageCount >= MAX_MESSAGES || isLoading) return

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        const userInput = input.trim()
        setInput('')
        setIsLoading(true)
        setMessageCount(prev => prev + 1)

        try {
            const response = generateGeneralResponse(userInput)

            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response,
                    timestamp: new Date()
                }])
                setIsLoading(false)
                inputRef.current?.focus()
            }, 1000 + Math.random() * 500)
        } catch (error) {
            console.error('Demo chat error:', error)
            setIsLoading(false)
        }
    }

    const generateGeneralResponse = (userInput: string): string => {
        const input = userInput.toLowerCase().trim()

        // Sektörler / Industries
        if (input.match(/(sektör|tür|yapabilirim|neler|what|industries|types)/)) {
            return locale === 'tr'
                ? `NDIS Shield Hub olarak şu anda NDIS sağlayıcıları için özelleşmiş çözümler sunuyoruz:

1. 📝 **Hizmet Sözleşmesi Analizi:** NDIS kurallarına uygunluk kontrolü.
2. ⚡ **Otomatik İyileştirme:** NDIS Fiyat Rehberi 2025/26'ya uygun ek maddeler.
3. 🔒 **Güvenli Depolama (Sovereign Vault):** Avustralya (Sydney) veri merkezli özel depolama.

Her biri NDIS altyapısına özel olarak denetlenebilir şekilde tasarlanmıştır.`
                : `At NDIS Shield Hub, we currently offer specialized solutions for NDIS Providers:

1. 📝 **Service Agreement Analysis:** Full NDIS Practice Standards compliance checks.
2. ⚡ **Auto-Remediation:** Instant addendums aligned with the 2025/26 NDIS Price Guide.
3. 🔒 **Sovereign Vault:** Secure, private Australian (ap-southeast-2) data storage.

Each operates securely to keep you 100% audit-ready.`
        }

        // Fiyatlandırma / Pricing
        if (input.match(/(fiyat|ücret|kaç para|price|cost|pricing)/)) {
            return locale === 'tr'
                ? `Fiyatlandırmamız işletmenizin büyüklüğüne göre değişmektedir:

• **Başlangıç:** Küçük işletmeler için temel özellikler.
• **Pro:** Büyüyen ekipler için gelişmiş analitik ve entegrasyonlar.
• **Enterprise:** Büyük ölçekli operasyonlar için özel çözümler.

Detaylı fiyat listesi için 'Fiyatlandırma' sayfamızı ziyaret edebilirsiniz veya satış ekibimizle iletişime geçebilirsiniz.`
                : `Our pricing varies based on your business size:

• **Starter:** Basic features for small businesses.
• **Pro:** Advanced analytics and integrations for growing teams.
• **Enterprise:** Custom solutions for large-scale operations.

You can visit our 'Pricing' page for a detailed list or contact our sales team.`
        }

        // Kurulum / Setup
        if (input.match(/(kurulum|entegrasyon|setup|install|integration)/)) {
            return locale === 'tr'
                ? `Kurulum sürecimiz oldukça hızlıdır:

1. **Hesap Oluşturun:** 1 dakika içinde kaydolun.
2. **Özelleştirin:** Chatbotunuzun görünümünü ve tonunu ayarlayın.
3. **Veri Yükleyin:** Bilgi tabanınızı (PDF, website linki vb.) ekleyin.
4. **Yayınlayın:** Size verilen kodu web sitenize ekleyin.

Toplam süreç genellikle **10 dakikadan az** sürer! 🚀`
                : `Our setup process is very fast:

1. **Create Account:** Sign up in 1 minute.
2. **Customize:** Set your chatbot's look and tone.
3. **Upload Data:** Add your knowledge base (PDF, website link, etc.).
4. **Publish:** Add the provided code to your website.

The total process usually takes **less than 10 minutes**! 🚀`
        }

        // Default response
        return locale === 'tr'
            ? `Anladım, bu konuda size yardımcı olabilirim! NDIS Shield Hub hakkında daha fazla detay öğrenmek isterseniz:

• Hizmet verdiğimiz sektörler
• Fiyatlandırma politikamız
• Kurulum ve teknik destek

Konularında sorular sorabilirsiniz. Başka nasıl yardımcı olabilirim?`
            : `I understand, I can help you with that! If you'd like to know more about NDIS Shield Hub:

• Industries we serve
• Our pricing policy
• Setup and technical support

Feel free to ask about these topics. How else can I assist you?`
    }

    const handleLanguageSwitch = (newLocale: string) => {
        const supportedLocales = ['tr', 'en', 'de', 'es', 'fr']
        const segments = window.location.pathname.split('/').filter(Boolean)
        if (segments.length > 0 && supportedLocales.includes(segments[0])) {
            segments[0] = newLocale
        } else {
            segments.unshift(newLocale)
        }
        router.push(`/${segments.join('/')}`)
    }

    if (!isInitialized) {
        return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex items-center justify-center">
            <div className="animate-pulse text-gray-600">Loading...</div>
        </div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
            {/* Navigation */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link href={`/${locale}`} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">NDIS Shield Hub</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-gray-100/80 backdrop-blur border rounded-xl p-1">
                                {['tr', 'en'].map((lang) => (
                                    <Button
                                        key={lang}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleLanguageSwitch(lang)}
                                        className={`text-xs px-3 py-1 h-8 mx-0.5 rounded-lg transition-all ${locale === lang
                                            ? 'bg-white shadow-md text-gray-800 font-semibold'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                            }`}
                                    >
                                        {lang.toUpperCase()}
                                    </Button>
                                ))}
                            </div>
                            <span className="text-xs text-gray-400 hidden sm:inline" title={locale === 'tr' ? 'Demo sadece TR/EN destekler' : 'Demo supports TR/EN only'}>
                                ({locale === 'tr' ? 'Demo: TR/EN' : 'Demo: TR/EN'})
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white py-10">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <Bot className="h-7 w-7" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            {locale === 'tr' ? 'Genel AI Asistan' : 'General AI Assistant'}
                        </h1>
                        <Badge className="bg-white/20 text-white border-0">DEMO</Badge>
                    </div>
                    <p className="text-gray-300">
                        {locale === 'tr'
                            ? 'NDIS Shield Hub platformu hakkında sorularınızı yanıtlayan sanal asistan'
                            : 'Virtual assistant answering your questions about the NDIS Shield Hub platform'}
                    </p>
                </div>
            </div>

            {/* Chat */}
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-3xl mx-auto">
                    <Card className="shadow-2xl border-0 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{locale === 'tr' ? 'NDIS Shield Hub Asistanı' : 'NDIS Shield Hub Assistant'}</CardTitle>
                                        <div className="flex items-center text-gray-300 text-xs">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse mr-1"></span>
                                            {locale === 'tr' ? 'Çevrimiçi' : 'Online'}
                                        </div>
                                    </div>
                                </div>
                                <Badge className={`${remainingMessages > 2 ? 'bg-white/20' : remainingMessages > 0 ? 'bg-orange-500' : 'bg-red-500'} text-white border-0`}>
                                    <Zap className="w-3 h-3 mr-1" />
                                    {remainingMessages}/{MAX_MESSAGES}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="h-[400px] overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex items-end space-x-2 max-w-[90%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-gray-600 to-gray-700'
                                            }`}>
                                            {message.role === 'user' ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-white" />}
                                        </div>
                                        <div className={`rounded-2xl px-4 py-2.5 ${message.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                            : 'bg-white border border-gray-200 shadow-sm rounded-bl-sm'
                                            }`}>
                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                                            <div className={`text-xs mt-1.5 flex items-center ${message.role === 'user' ? 'text-blue-200 justify-end' : 'text-gray-400'}`}>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                {message.timestamp.toLocaleTimeString(locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex items-end space-x-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                                            <Bot className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </CardContent>

                        <div className="border-t bg-white p-4">
                            {remainingMessages > 0 ? (
                                <div className="space-y-2">
                                    <div className="flex space-x-2">
                                        <Input
                                            ref={inputRef}
                                            autoFocus
                                            placeholder={locale === 'tr' ? "Sorunuzu yazın..." : "Type your question..."}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            disabled={isLoading}
                                            className="flex-1 h-11 rounded-xl"
                                        />
                                        <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} className="h-11 px-5 rounded-xl bg-gray-800 hover:bg-gray-900">
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center">
                                            <Lightbulb className="w-3 h-3 mr-1" />
                                            {locale === 'tr' ? `${remainingMessages} soru hakkınız kaldı` : `${remainingMessages} questions remaining`}
                                        </div>
                                        <Progress value={(messageCount / MAX_MESSAGES) * 100} className="w-20 h-1.5" />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">{locale === 'tr' ? 'Demo süresi bitti' : 'Demo ended'}</p>
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
