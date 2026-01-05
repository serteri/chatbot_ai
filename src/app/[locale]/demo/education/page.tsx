'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    GraduationCap,
    Send,
    Users,
    Lock,
    CheckCircle,
    Lightbulb,
    Zap,
    Home,
    Bot,
    User
} from 'lucide-react'

interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export default function EducationDemoPage() {
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
            ? `Merhaba! 👋 Ben eğitim danışmanı AI'ınızım.

Size yardımcı olabileceğim konular:
• Yurtdışı eğitim fırsatları 🎓
• Öğrenci vize işlemleri 🛂  
• Dil okulları ve kurslar 🗣️
• Burs imkanları 💰
• Üniversite başvuru süreçleri 📚

Bu demo sürümünde ${maxMessages} mesaj gönderebilirsiniz. Hangi konuda yardım istiyorsunuz?`
            : locale === 'en'
                ? `Hello! 👋 I'm your education consultant AI.

I can help you with:
• Study abroad opportunities 🎓
• Student visa processes 🛂  
• Language schools and courses 🗣️
• Scholarship opportunities 💰
• University application processes 📚

In this demo version, you can send ${maxMessages} messages. What would you like help with?`
                : `Hello! 👋 I'm your education consultant AI. You can send ${maxMessages} messages in this demo.`

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
            const response = generateEducationResponse(userInput)

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

    const generateEducationResponse = (userInput: string): string => {
        const input = userInput.toLowerCase().trim()

        // Selamlaşma
        if (input.match(/^(merhaba|selam|hey|hi|hello|naber|nasılsın|nasıl gidiyor|günaydın|iyi akşamlar|iyi günler)/)) {
            return locale === 'tr'
                ? `Merhaba! 😊 Ben buradayım, size yardımcı olmaya hazırım!

Size nasıl yardımcı olabilirim? Örneğin:
• "Almanya'da okumak istiyorum"
• "Burs imkanları neler?"
• "Vize için ne gerekiyor?"

Sormak istediğiniz bir konu var mı?`
                : `Hello! 😊 I'm here and ready to help you!

How can I assist you? For example:
• "I want to study in Germany"
• "What scholarship opportunities are there?"
• "What do I need for a visa?"

Is there something specific you'd like to know?`
        }

        // Teşekkür
        if (input.match(/(teşekkür|sağol|thanks|thank you|eyvallah|tşk)/)) {
            return locale === 'tr'
                ? `Rica ederim! 🙏 Başka bir sorunuz varsa yardımcı olmaktan memnuniyet duyarım. 

Tam sürüm için ücretsiz kayıt olabilir ve sınırsız sohbet edebilirsiniz! 🎓`
                : `You're welcome! 🙏 I'm happy to help if you have any other questions.

Sign up for free to get unlimited chat access! 🎓`
        }

        // Nasılsın
        if (input.match(/(nasılsın|how are you|iyi misin|naber|ne var ne yok)/)) {
            return locale === 'tr'
                ? `İyiyim, teşekkür ederim! 😊 Siz nasılsınız? 

Bugün eğitim konusunda size nasıl yardımcı olabilirim? Yurtdışı eğitim, vize, burs veya dil okulları hakkında sorularınızı yanıtlayabilirim.`
                : `I'm doing great, thank you! 😊 How are you?

How can I help you with education today? I can answer questions about studying abroad, visas, scholarships, or language schools.`
        }

        // Vize soruları
        if (input.match(/(vize|visa|student visa|öğrenci vizesi)/)) {
            return locale === 'tr'
                ? `🛂 **Öğrenci Vize Danışmanlığı**

Hangi ülke için vize bilgisi istiyorsunuz? Popüler destinasyonlar:

• **ABD (F-1 Vizesi)** - $350 harç, 2-8 hafta süre
• **İngiltere (Student Visa)** - £348 harç, 3-8 hafta süre  
• **Almanya (National Visa)** - €75 harç, 4-8 hafta süre
• **Kanada (Study Permit)** - CAD $150 harç, 4-12 hafta süre

💡 **Genel gereksinimler:** Kabul mektubu, mali durum belgesi, dil yeterlilik sertifikası, sağlık sigortası

Daha detaylı bilgi için kayıt olarak vize rehberimize tam erişim sağlayabilirsiniz!`
                : `🛂 **Student Visa Consulting**

Which country's visa information do you need? Popular destinations:

• **USA (F-1 Visa)** - $350 fee, 2-8 weeks processing
• **UK (Student Visa)** - £348 fee, 3-8 weeks processing  
• **Germany (National Visa)** - €75 fee, 4-8 weeks processing
• **Canada (Study Permit)** - CAD $150 fee, 4-12 weeks processing

💡 **Requirements:** Acceptance letter, proof of funds, language certificate, health insurance`
        }

        // Burs soruları
        if (input.match(/(burs|scholarship|mali destek|financial aid|funding)/)) {
            return locale === 'tr'
                ? `💰 **Burs Fırsatları**

En popüler burs programları:

• **Fulbright (ABD)** - Tam burs + yaşam gideri
• **DAAD (Almanya)** - €934/ay + seyahat
• **Chevening (İngiltere)** - Tam burs
• **Erasmus+ (AB)** - €700-1000/ay
• **Türkiye Bursları** - Uluslararası öğrenciler için

📅 **Başvuru Takvimleri:**
- Sonbahar: Eylül-Kasım
- İlkbahar: Ocak-Mart

Sistemimizde 500+ aktif burs var. Kayıt olarak size uygun bursları filtreleyebilirsiniz!`
                : `💰 **Scholarship Opportunities**

Most popular scholarship programs:

• **Fulbright (USA)** - Full tuition + living expenses
• **DAAD (Germany)** - €934/month + travel
• **Chevening (UK)** - Full scholarship
• **Erasmus+ (EU)** - €700-1000/month

📅 **Application Timeline:**
- Fall: September-November
- Spring: January-March

We have 500+ active scholarships. Sign up to filter scholarships that match your profile!`
        }

        // Üniversite soruları
        if (input.match(/(üniversite|university|okul|school|eğitim|education|okumak|study|master|lisans|bachelor|phd|doktora)/)) {
            return locale === 'tr'
                ? `🎓 **Yurtdışı Eğitim Danışmanlığı**

Size yardımcı olabileceğim konular:

📚 **Program Seçimi**
- Lisans, Yüksek Lisans, Doktora
- TOEFL/IELTS gereksinimleri
- GPA kriterleri

🌍 **Popüler Destinasyonlar**
- ABD: 4,000+ üniversite
- İngiltere: Russell Group okulları
- Kanada: Co-op programları
- Almanya: Ücretsiz eğitim

💡 Hangi ülke veya program hakkında bilgi almak istersiniz?`
                : `🎓 **Study Abroad Consulting**

I can help you with:

📚 **Program Selection**
- Bachelor's, Master's, PhD
- TOEFL/IELTS requirements
- GPA criteria

🌍 **Popular Destinations**
- USA: 4,000+ universities
- UK: Russell Group schools
- Canada: Co-op programs
- Germany: Free tuition

💡 Which country or program would you like to learn about?`
        }

        // Dil okulu
        if (input.match(/(dil okulu|language school|ingilizce|english|almanca|german|fransızca|french|dil kursu|language course)/)) {
            return locale === 'tr'
                ? `🗣️ **Dil Okulları & Kurslar**

Popüler dil eğitim programları:

• **İngiltere** - Cambridge, Oxford şehirlerinde
• **Malta** - Uygun fiyatlı, tatil + eğitim
• **İrlanda** - Çalışma izni imkanı
• **Almanya** - Goethe Institut sertifikalı

⏱️ **Süre Seçenekleri:**
- Kısa dönem: 2-8 hafta
- Uzun dönem: 3-12 ay
- Akademik hazırlık: 6-12 ay

Bütçenize ve hedefinize göre öneriler için kayıt olun!`
                : `🗣️ **Language Schools & Courses**

Popular language programs:

• **UK** - Cambridge, Oxford cities
• **Malta** - Affordable, vacation + education
• **Ireland** - Work permit opportunity
• **Germany** - Goethe Institut certified

⏱️ **Duration Options:**
- Short-term: 2-8 weeks
- Long-term: 3-12 months
- Academic preparation: 6-12 months`
        }

        // Ülke spesifik
        if (input.match(/(almanya|germany|deutschland)/)) {
            return locale === 'tr'
                ? `🇩🇪 **Almanya'da Eğitim**

✨ **Avantajlar:**
- Devlet üniversitelerinde ÜCRETSİZ eğitim
- Yaşam gideri: €850-1000/ay
- Mezuniyet sonrası 18 ay çalışma izni
- Avrupa'nın merkezinde konum

📋 **Gereksinimler:**
- Almanca B2/C1 veya İngilizce programlar
- Bloke hesapta €11,208/yıl
- APS sertifikası (Türk öğrenciler için)

🎯 Almanya hakkında daha detaylı bilgi için tam sürüme geçin!`
                : `🇩🇪 **Studying in Germany**

✨ **Advantages:**
- FREE tuition at public universities
- Living costs: €850-1000/month
- 18-month post-study work permit
- Central European location

📋 **Requirements:**
- German B2/C1 or English programs
- €11,208/year blocked account
- Uni-assist application

🎯 Get detailed info by signing up!`
        }

        // Default - akıllı fallback
        return locale === 'tr'
            ? `Eğitim konusunda size yardımcı olmaya hazırım! 📚

Sorularınızı şu konularda sorabilirsiniz:
• **"Almanya'da okumak istiyorum"** - Ülke bilgisi
• **"Burs var mı?"** - 500+ burs fırsatı
• **"Vize nasıl alınır?"** - Adım adım rehber
• **"Dil okulu öner"** - 150+ okul veritabanı

Veya direkt sormak istediğiniz konuyu yazın, size yardımcı olayım! 😊

💫 **Not:** Bu demo versiyonudur. Tam özellikler için kayıt olmanız gerekmektedir.`
            : `I'm ready to help you with education matters! 📚

You can ask about:
• **"I want to study in Germany"** - Country info
• **"Are there scholarships?"** - 500+ opportunities
• **"How do I get a visa?"** - Step-by-step guide
• **"Recommend a language school"** - 150+ schools

Or just type what you'd like to know! 😊

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

    const remainingMessages = maxMessages - messageCount

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Navigation Bar */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link href={`/${locale}`} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-white" />
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
                                        ? 'bg-white shadow-md text-blue-600 font-semibold'
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
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                                <GraduationCap className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-left">
                                <h1 className="text-3xl md:text-4xl font-bold">
                                    {locale === 'tr' ? 'Eğitim AI Asistanı' : 'Education AI Assistant'}
                                </h1>
                                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mt-1">
                                    DEMO
                                </Badge>
                            </div>
                        </div>
                        <p className="text-blue-100 text-lg">
                            {locale === 'tr'
                                ? 'Yurtdışı eğitim, vize ve burs konularında AI destekli danışmanlık'
                                : 'AI-powered consulting on study abroad, visas and scholarships'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Section */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <Card className="shadow-2xl border-0 overflow-hidden">
                        {/* Chat Header */}
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">
                                            {locale === 'tr' ? 'Eğitim Danışmanı' : 'Education Advisor'}
                                        </CardTitle>
                                        <div className="flex items-center space-x-1 text-blue-100 text-sm">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            <span>{locale === 'tr' ? 'Çevrimiçi' : 'Online'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge
                                        className={`${remainingMessages > 2 ? 'bg-white/20' : remainingMessages > 0 ? 'bg-orange-500' : 'bg-red-500'} text-white border-0`}
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
                                            ? 'bg-blue-600'
                                            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                            }`}>
                                            {message.role === 'user'
                                                ? <User className="h-4 w-4 text-white" />
                                                : <Bot className="h-4 w-4 text-white" />
                                            }
                                        </div>

                                        {/* Message Bubble */}
                                        <div
                                            className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-md'
                                                : 'bg-white border border-gray-200 shadow-sm rounded-bl-md'
                                                }`}
                                        >
                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {message.content}
                                            </div>
                                            <div className={`text-xs mt-2 flex items-center ${message.role === 'user' ? 'text-blue-200 justify-end' : 'text-gray-400'
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
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                                            className="flex-1 h-12 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!input.trim() || isLoading}
                                            className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all"
                                        >
                                            <Send className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center">
                                            <Lightbulb className="w-3 h-3 mr-1" />
                                            {locale === 'tr' ? 'Örnek: "Almanya\'da okumak istiyorum"' : 'Example: "I want to study in Germany"'}
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