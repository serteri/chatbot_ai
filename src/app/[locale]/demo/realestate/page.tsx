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
    Home,
    Send,
    Users,
    Lock,
    CheckCircle,
    Lightbulb,
    Zap,
    Bot,
    User,
    Building2,
    MapPin,
    DollarSign,
    Calendar
} from 'lucide-react'

interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const STORAGE_KEY = 'pylonchat_realestate_demo'
const MAX_MESSAGES = 5
const EXPIRY_HOURS = 24

export default function RealEstateDemoPage() {
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
                if (data.expiry && now < data.expiry) {
                    setMessageCount(data.count || 0)
                } else {
                    localStorage.removeItem(STORAGE_KEY)
                }
            } catch {
                localStorage.removeItem(STORAGE_KEY)
            }
        }
        setIsInitialized(true)
    }, [])

    // Save message count to localStorage
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    useEffect(() => {
        if (!isLoading && remainingMessages > 0) {
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isLoading, remainingMessages])

    // Welcome message
    useEffect(() => {
        if (!isInitialized) return

        const welcomeContent = locale === 'tr'
            ? `Merhaba! 🏠 Ben PylonChat Emlak Asistanıyım.

**Size nasıl yardımcı olabilirim?**

🏢 **Gayrimenkul türü** - Daire, villa, arsa, ticari...
💰 **Bütçe belirleme** - Size uygun fiyat aralığı
📍 **Lokasyon önerileri** - En iyi bölgeler
🏦 **Kredi/Finansman** - Ön onay ve kredi süreçleri
📅 **Randevu ayarlama** - Emlak danışmanıyla görüşme

Bu demo sürümünde **${MAX_MESSAGES} soru** sorabilirsiniz.

💡 **Örnek:** "3+1 daire arıyorum, bütçem 3 milyon TL"

Hayalinizdeki evi bulmak için hazır mısınız? 🔑`
            : `Hello! 🏠 I'm PylonChat Real Estate Assistant.

**How can I help you?**

🏢 **Property type** - Apartment, villa, land, commercial...
💰 **Budget planning** - Find your price range
📍 **Location suggestions** - Best neighborhoods
🏦 **Financing** - Pre-approval and mortgage info
📅 **Schedule viewing** - Book with an agent

In this demo, you can ask **${MAX_MESSAGES} questions**.

💡 **Example:** "I'm looking for a 3-bedroom apartment, budget $500K"

Ready to find your dream home? 🔑`

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
            const response = generateRealEstateResponse(userInput)

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

    const generateRealEstateResponse = (userInput: string): string => {
        const input = userInput.toLowerCase().trim()

        // Greeting
        if (input.match(/^(merhaba|selam|hey|hi|hello|naber)/)) {
            return locale === 'tr'
                ? `Merhaba! 😊 Emlak arayışınızda size yardımcı olmaktan mutluluk duyarım!

**Öncelikle birkaç soru sormama izin verin:**

1️⃣ Ne tür bir gayrimenkul arıyorsunuz?
   • Daire / Residence
   • Müstakil ev / Villa
   • Arsa
   • Ticari (dükkan, ofis)

2️⃣ Hangi bölge/ilçede bakmak istersiniz?

3️⃣ Bütçeniz nedir?

Bu bilgilerle size en uygun seçenekleri sunabilirim! 🏡`
                : `Hello! 😊 I'm happy to help you with your real estate search!

**Let me ask you a few questions first:**

1️⃣ What type of property are you looking for?
   • Apartment / Condo
   • House / Villa
   • Land
   • Commercial (shop, office)

2️⃣ Which area/neighborhood are you interested in?

3️⃣ What's your budget?

With this info, I can show you the best options! 🏡`
        }

        // Budget related
        if (input.match(/(bütçe|budget|milyon|million|tl|usd|dolar|fiyat|price|para|money|kaç|how much)/)) {
            return locale === 'tr'
                ? `💰 **Bütçe Danışmanlığı**

**Türkiye Emlak Fiyat Rehberi (2024):**

🏢 **Daire Fiyatları (İstanbul):**
• Kadıköy, Beşiktaş: 8-15 Milyon TL
• Ataşehir, Üsküdar: 5-10 Milyon TL
• Esenyurt, Beylikdüzü: 2-5 Milyon TL

🏡 **Villa Fiyatları:**
• Bodrum, Çeşme: 20-50+ Milyon TL
• Sapanca, Kocaeli: 8-20 Milyon TL

📊 **Kredi Ön Onayı:**
• Maaşın 10-12 katı kadar kredi alınabilir
• %20-30 peşinat genellikle gerekli
• Faiz oranları: %2.5-4 (aylık)

**Bütçenizi söylerseniz size özel seçenekler sunabilirim!**

Örnek: "Bütçem 5 milyon TL, Kadıköy'de 3+1 arıyorum"`
                : `💰 **Budget Consulting**

**Real Estate Price Guide (2024):**

🏢 **Apartment Prices (Major Cities):**
• Downtown/Prime: $400K - $1M+
• Suburbs: $200K - $500K
• Emerging areas: $100K - $300K

🏡 **House/Villa Prices:**
• Luxury: $800K - $3M+
• Mid-range: $400K - $800K

📊 **Mortgage Pre-Approval:**
• Usually 3-5x annual income
• 20% down payment typical
• Current rates: 6-8% (varies)

**Tell me your budget and I'll show you matching options!**

Example: "My budget is $500K, looking for 3-bedroom in suburbs"`
        }

        // Room/size related
        if (input.match(/(oda|room|bedroom|3\+1|2\+1|4\+1|metrekare|sqm|m2|büyüklük|size)/)) {
            return locale === 'tr'
                ? `🏠 **Oda ve Alan Rehberi**

**Daire Tipleri:**
• **1+1:** 45-65 m² - Bekar/Çift için ideal
• **2+1:** 80-110 m² - Küçük aile
• **3+1:** 120-160 m² - Orta büyüklükte aile
• **4+1:** 180-250 m² - Geniş aile
• **5+1+:** 250+ m² - Lüks segment

**Önemli Kriterler:**
✅ Net/Brüt alan farkına dikkat
✅ Kat planı ve oda düzeni
✅ Balkon/teras var mı?
✅ Depo ve otopark dahil mi?
✅ Bina yaşı ve deprem yönetmeliği

**Kaç odalı ve kaç metrekare bir ev arıyorsunuz?**

Detay verirseniz size en uygun ilanları filtreleyebilirim! 📐`
                : `🏠 **Room & Size Guide**

**Property Types:**
• **Studio:** 400-600 sqft - Singles/couples
• **1-bed:** 600-900 sqft - Small household
• **2-bed:** 900-1,200 sqft - Small family
• **3-bed:** 1,200-1,800 sqft - Medium family
• **4+ bed:** 1,800+ sqft - Large family

**Key Criteria:**
✅ Usable vs total area
✅ Floor plan layout
✅ Balcony/terrace included?
✅ Parking and storage?
✅ Building age and condition

**How many bedrooms do you need?**

Give me details and I'll filter the best listings! 📐`
        }

        // Location related
        if (input.match(/(lokasyon|location|bölge|area|ilçe|district|nerede|where|kadıköy|beşiktaş|ataşehir|esenyurt|istanbul|ankara|izmir)/)) {
            return locale === 'tr'
                ? `📍 **Lokasyon Rehberi - İstanbul**

**🌟 Premium Bölgeler:**
• **Beşiktaş:** Merkezi konum, yüksek fiyat, sosyal hayat
• **Kadıköy:** Bohem atmosfer, ulaşım kolaylığı
• **Sarıyer:** Doğa, lüks, sakin yaşam

**🏙️ Gelişen Bölgeler:**
• **Ataşehir:** Finans merkezi, modern, iş olanakları
• **Başakşehir:** Yeni, geniş daireler, aile dostu
• **Kartal:** Metro hattı, uygun fiyat, deniz manzarası

**💰 Uygun Fiyatlı Bölgeler:**
• **Esenyurt:** Geniş seçenek, yeni binalar
• **Beylikdüzü:** Marina, sahil, sosyal olanaklar
• **Pendik:** Havalimanına yakın, gelişiyor

**Hangi bölgede aramak istersiniz?**

İşyerinize yakınlık, ulaşım, okul gibi kriterleri de belirtebilirsiniz! 🗺️`
                : `📍 **Location Guide**

**🌟 Premium Areas:**
• **Downtown:** Central, expensive, vibrant social life
• **Waterfront:** Scenic views, premium pricing
• **Historic districts:** Character, walkability

**🏙️ Growing Areas:**
• **Tech hubs:** Near business centers, modern
• **New developments:** Latest amenities, family-friendly
• **Transit corridors:** Good connectivity, value

**💰 Affordable Areas:**
• **Suburbs:** More space, newer builds
• **Emerging neighborhoods:** Investment potential
• **Outer districts:** Best value per sqft

**Which area interests you?**

You can also mention preferences like proximity to work, schools, transit! 🗺️`
        }

        // Credit/mortgage related
        if (input.match(/(kredi|mortgage|loan|banka|bank|finans|financing|ön onay|pre.?approval|taksit|payment)/)) {
            return locale === 'tr'
                ? `🏦 **Konut Kredisi Rehberi**

**📋 Kredi Ön Onayı İçin Gerekenler:**
• Kimlik fotokopisi
• Gelir belgesi / Maaş bordrosu
• Son 3 aylık banka hesap özeti
• İkametgah belgesi
• Varsa diğer gelir belgeleri

**💳 Kredi Hesaplama (Örnek):**
• Konut değeri: 5.000.000 TL
• Peşinat (%20): 1.000.000 TL
• Kredi tutarı: 4.000.000 TL
• Vade: 120 ay (10 yıl)
• Aylık taksit: ~₺65.000 (faize göre değişir)

**🏦 Öncü Bankalar:**
1. Ziraat Bankası - En düşük faiz
2. Vakıfbank - Kampanyalı oranlar
3. Halkbank - Uygun şartlar
4. Özel bankalar - Hızlı süreç

**Kredi ön onayınız var mı?**

Ön onayınız varsa sizi doğrudan uygun ilanlarla eşleştirebiliriz! ✅`
                : `🏦 **Mortgage Guide**

**📋 For Pre-Approval You Need:**
• ID/Passport
• Proof of income / Pay stubs
• Bank statements (last 3 months)
• Employment letter
• Tax returns (if self-employed)

**💳 Mortgage Example:**
• Home price: $500,000
• Down payment (20%): $100,000
• Loan amount: $400,000
• Term: 30 years
• Monthly payment: ~$2,400 (varies by rate)

**🏦 Key Lenders:**
• Traditional banks - Best rates
• Credit unions - Member benefits
• Online lenders - Fast process
• Mortgage brokers - Options comparison

**Do you have mortgage pre-approval?**

With pre-approval, we can match you with listings immediately! ✅`
        }

        // Appointment/visit related
        if (input.match(/(randevu|appointment|görüşme|meeting|ziyaret|visit|görmek|see|gezinti|tour)/)) {
            return locale === 'tr'
                ? `📅 **Randevu Ayarlama**

**🏠 Ev Gezisi İçin Hazırlık:**
✅ Ön onay veya bütçe belgesi hazır olsun
✅ Kimlik fotokopinizi getirin
✅ Sorularınızı listeleyin
✅ Bölgeyi önceden araştırın

**📋 Görüşmede Nelere Dikkat Etmeli:**
• Doğal aydınlatma (gündüz ziyaret)
• Su basıncı ve sıhhi tesisat
• Elektrik sistemi
• Isı yalıtımı / pencereler
• Komşuluk ve bina yönetimi
• Aidat ve ortak giderler

**🗓️ Randevu Seçenekleri:**
• Hafta içi: 09:00 - 18:00
• Hafta sonu: 10:00 - 16:00
• Akşam: Özel talebe göre

**Demo sürümü tamamlandıktan sonra kayıt olarak gerçek randevu alabilirsiniz!**

Hangi gün ve saate müsaitsiniz? 📞`
                : `📅 **Schedule a Viewing**

**🏠 Prepare for Your Visit:**
✅ Have pre-approval or budget proof ready
✅ Bring ID
✅ List your questions
✅ Research the neighborhood

**📋 What to Check During Visit:**
• Natural lighting (daytime visit)
• Water pressure and plumbing
• Electrical system
• Insulation / windows
• Neighborhood and building management
• HOA fees and common expenses

**🗓️ Appointment Options:**
• Weekdays: 9:00 AM - 6:00 PM
• Weekends: 10:00 AM - 4:00 PM
• Evenings: By special request

**After completing the demo, sign up to book real appointments!**

When are you available? 📞`
        }

        // Property type
        if (input.match(/(daire|apartment|villa|ev|house|arsa|land|ticari|commercial|residence|konut|flat)/)) {
            return locale === 'tr'
                ? `🏢 **Gayrimenkul Türleri**

**🏠 Konut:**
• **Daire:** Standart apartman dairesi
• **Residence:** Lüks, güvenlikli, sosyal olanaklar
• **Dubleks:** İki katlı daire
• **Triplex:** Üç katlı daire
• **Penthouse:** Çatı katı, teras

**🏡 Müstakil:**
• **Villa:** Bahçeli, havuzlu
• **Müstakil Ev:** Tek aile konutu
• **Çiftlik Evi:** Kırsal, geniş arazi

**🏪 Ticari:**
• **Dükkan:** Cadde üzeri, AVM
• **Ofis:** İş merkezi, plaza
• **Depo:** Lojistik, sanayi

**🌳 Arsa:**
• **Konut arsası:** İmarlı
• **Tarla:** Tarım arazisi
• **Ticari arsa:** İş yeri için

**Hangi tür gayrimenkul arıyorsunuz?**`
                : `🏢 **Property Types**

**🏠 Residential:**
• **Apartment:** Standard unit
• **Condo:** With amenities, HOA
• **Duplex:** Two-story unit
• **Penthouse:** Top floor, terrace

**🏡 Single Family:**
• **House:** Detached home
• **Villa:** Luxury with garden/pool
• **Townhouse:** Multi-story, shared walls
• **Farmhouse:** Rural, large land

**🏪 Commercial:**
• **Retail:** Street-level, mall
• **Office:** Business center
• **Warehouse:** Industrial/logistics

**🌳 Land:**
• **Residential lot:** Zoned for homes
• **Agricultural:** Farmland
• **Commercial:** For business use

**What type of property are you looking for?**`
        }

        // Default response
        return locale === 'tr'
            ? `Emlak arayışınızda size yardımcı olmaya hazırım! 🏠

**Şu konularda detaylı bilgi alabilisiniz:**

🏢 **Gayrimenkul:** "Kadıköy'de 3+1 daire arıyorum"
💰 **Bütçe:** "5 milyon TL bütçemle ne alabilirim?"
📍 **Lokasyon:** "İstanbul'da hangi bölgeler iyi?"
🏦 **Kredi:** "Konut kredisi nasıl alınır?"
📅 **Randevu:** "Ev görmek için ne yapmalıyım?"

**Hızlı Lead Qualification Soruları:**
1. Ne tür ev arıyorsunuz? (Daire/Villa/Arsa)
2. Bütçeniz nedir?
3. Hangi bölgeyi tercih edersiniz?
4. Kredi ön onayınız var mı?

Bu bilgileri vererek hızlıca uygun seçeneklere ulaşabilirsiniz! 🔑

---
⚡ Demo: ${messageCount}/${MAX_MESSAGES} hak kullanıldı`
            : `I'm ready to help with your property search! 🏠

**You can ask about:**

🏢 **Property:** "I'm looking for a 3-bed apartment downtown"
💰 **Budget:** "What can I get for $500K?"
📍 **Location:** "Which neighborhoods are best?"
🏦 **Financing:** "How do I get a mortgage?"
📅 **Viewing:** "How do I schedule a tour?"

**Quick Lead Qualification:**
1. What type of property? (Apartment/House/Land)
2. What's your budget?
3. Preferred area?
4. Do you have mortgage pre-approval?

Provide these details for quick matching! 🔑

---
⚡ Demo: ${messageCount}/${MAX_MESSAGES} used`
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
        return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 flex items-center justify-center">
            <div className="animate-pulse text-amber-600">Loading...</div>
        </div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50">
            {/* Navigation */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link href={`/${locale}`} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">PylonChat</span>
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
                                            ? 'bg-white shadow-md text-amber-600 font-semibold'
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
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white py-10">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Building2 className="h-7 w-7" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            {locale === 'tr' ? 'Emlak AI Asistanı' : 'Real Estate AI Assistant'}
                        </h1>
                        <Badge className="bg-white/20 text-white border-0">DEMO</Badge>
                    </div>
                    <p className="text-amber-100">
                        {locale === 'tr'
                            ? '7/24 Lead Qualification - Potansiyel alıcılarınızı otomatik eleyin'
                            : '24/7 Lead Qualification - Automatically qualify potential buyers'}
                    </p>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-sm">
                            <DollarSign className="w-3 h-3" />
                            {locale === 'tr' ? 'Bütçe Eleme' : 'Budget Screening'}
                        </div>
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-sm">
                            <MapPin className="w-3 h-3" />
                            {locale === 'tr' ? 'Lokasyon Önerileri' : 'Location Tips'}
                        </div>
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-sm">
                            <Calendar className="w-3 h-3" />
                            {locale === 'tr' ? 'Randevu Ayarlama' : 'Schedule Viewing'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat */}
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-3xl mx-auto">
                    <Card className="shadow-2xl border-0 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{locale === 'tr' ? 'Emlak Danışmanı' : 'Real Estate Advisor'}</CardTitle>
                                        <div className="flex items-center text-amber-100 text-xs">
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
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-amber-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'
                                            }`}>
                                            {message.role === 'user' ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-white" />}
                                        </div>
                                        <div className={`rounded-2xl px-4 py-2.5 ${message.role === 'user'
                                            ? 'bg-amber-600 text-white rounded-br-sm'
                                            : 'bg-white border border-gray-200 shadow-sm rounded-bl-sm'
                                            }`}>
                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                                            <div className={`text-xs mt-1.5 flex items-center ${message.role === 'user' ? 'text-amber-200 justify-end' : 'text-gray-400'}`}>
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
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                            <Bot className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                                            placeholder={locale === 'tr' ? "Örn: 3+1 daire, 3 milyon TL bütçe..." : "E.g.: 3-bed apartment, $500K budget..."}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            disabled={isLoading}
                                            className="flex-1 h-11 rounded-xl"
                                        />
                                        <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} className="h-11 px-5 rounded-xl bg-amber-600 hover:bg-amber-700">
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
