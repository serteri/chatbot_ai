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
    GraduationCap,
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

const STORAGE_KEY = 'pylonchat_education_demo'
const MAX_MESSAGES = 5
const EXPIRY_HOURS = 24

export default function EducationDemoPage() {
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
            ? `Merhaba! 👋 Ben PylonChat Eğitim Danışmanı AI'ınızım.

🎓 **Uzmanlık Alanlarım:**
• Yurtdışı üniversite başvuruları
• Öğrenci vize süreçleri (ABD, İngiltere, Almanya, Kanada)
• Burs programları ve mali destek
• Dil okulları ve hazırlık programları
• TOEFL, IELTS, GRE, GMAT sınavları

Bu demo sürümünde **${MAX_MESSAGES} soru** sorabilirsiniz. Ardından ücretsiz kayıt olarak sınırsız erişim sağlayabilirsiniz!

💡 **Örnek sorular:**
"Almanya'da mühendislik okumak istiyorum, ne yapmalıyım?"
"ABD'de tam burslu master programları var mı?"

Nasıl yardımcı olabilirim?`
            : `Hello! 👋 I'm your PylonChat Education Advisor AI.

🎓 **My Expertise:**
• University applications abroad
• Student visa processes (USA, UK, Germany, Canada)
• Scholarships and financial aid
• Language schools and preparation programs
• TOEFL, IELTS, GRE, GMAT exams

In this demo, you can ask **${MAX_MESSAGES} questions**. Sign up free for unlimited access!

💡 **Example questions:**
"I want to study engineering in Germany, what should I do?"
"Are there fully-funded master's programs in the USA?"

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
            const response = generateEducationResponse(userInput)

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

    const generateEducationResponse = (userInput: string): string => {
        const input = userInput.toLowerCase().trim()

        // Selamlaşma
        if (input.match(/^(merhaba|selam|hey|hi|hello|naber|nasılsın)/)) {
            return locale === 'tr'
                ? `Merhaba! 😊 Size yardımcı olmak için buradayım!

Eğitim danışmanlığı konusunda uzmanım. Şu konularda detaylı bilgi verebilirim:

🎓 **Üniversite Başvuruları** - Hangi ülke, hangi program, gereksinimler
🛂 **Vize Süreçleri** - Adım adım başvuru rehberi
💰 **Burslar** - 500+ aktif burs, uygunluk kriterleri
📚 **Dil Okulları** - Ülkelere göre en iyi seçenekler

Hangi konuda yardımcı olabilirim?`
                : `Hello! 😊 I'm here to help you!

I specialize in education consulting. I can provide detailed information on:

🎓 **University Applications** - Countries, programs, requirements
🛂 **Visa Processes** - Step-by-step application guide
💰 **Scholarships** - 500+ active scholarships, eligibility criteria
📚 **Language Schools** - Best options by country

What would you like to know?`
        }

        // Almanya
        if (input.match(/(almanya|germany|deutschland|alman)/)) {
            return locale === 'tr'
                ? `🇩🇪 **Almanya'da Eğitim - Kapsamlı Rehber**

**✨ Neden Almanya?**
• Devlet üniversitelerinde **ÜCRETSİZ** eğitim (sadece ~€300/dönem harç)
• Avrupa'nın en güçlü ekonomisi, mükemmel kariyer fırsatları
• Mezuniyet sonrası **18 aylık çalışma izni**
• 400+ üniversite, dünya çapında tanınırlık

**📋 Başvuru Gereksinimleri:**
• Almanca programlar: B2/C1 sertifikası (TestDaF, DSH)
• İngilizce programlar: IELTS 6.5+ veya TOEFL 90+
• Bloke hesap: **€11,208/yıl** (aylık €934)
• APS sertifikası (Türk öğrenciler için zorunlu)
• Motivasyon mektubu ve CV

**🎓 Popüler Programlar:**
• Mühendislik (TU Munich, TU Berlin, RWTH Aachen)
• İşletme (Mannheim, WHU, ESMT Berlin)
• Bilgisayar Bilimleri (TU Munich, KIT, TU Darmstadt)

**💰 Yaşam Maliyetleri:**
• Kira: €300-600/ay (öğrenci yurdu)
• Yemek: €200-300/ay
• Ulaşım: €50/ay (öğrenci bileti)
• Toplam: €700-1000/ay

**⏰ Başvuru Takvimleri:**
• Kış dönemi: Mayıs-Temmuz
• Yaz dönemi: Kasım-Ocak

Daha detaylı bilgi ve kişiselleştirilmiş danışmanlık için ücretsiz kayıt olun! 🚀`
                : `🇩🇪 **Studying in Germany - Comprehensive Guide**

**✨ Why Germany?**
• **FREE tuition** at public universities (only ~€300/semester admin fee)
• Europe's strongest economy, excellent career prospects
• **18-month post-study work permit**
• 400+ universities, globally recognized degrees

**📋 Application Requirements:**
• German programs: B2/C1 certificate (TestDaF, DSH)
• English programs: IELTS 6.5+ or TOEFL 90+
• Blocked account: **€11,208/year** (€934/month)
• Motivation letter and CV
• Academic transcripts

**🎓 Popular Programs:**
• Engineering (TU Munich, TU Berlin, RWTH Aachen)
• Business (Mannheim, WHU, ESMT Berlin)
• Computer Science (TU Munich, KIT, TU Darmstadt)

**💰 Living Costs:**
• Rent: €300-600/month (student dorm)
• Food: €200-300/month
• Transport: €50/month (student ticket)
• Total: €700-1000/month

**⏰ Application Deadlines:**
• Winter semester: May-July
• Summer semester: November-January

Sign up free for personalized advice and application support! 🚀`
        }

        // ABD / USA
        if (input.match(/(abd|amerika|usa|united states|amerikan)/)) {
            return locale === 'tr'
                ? `🇺🇸 **ABD'de Eğitim - Kapsamlı Rehber**

**✨ Neden ABD?**
• Dünyanın en prestijli üniversiteleri (Harvard, MIT, Stanford)
• Geniş program seçeneği ve araştırma fırsatları
• Kampüs yaşamı ve networking imkanları
• OPT ile mezuniyet sonrası **3 yıla kadar çalışma izni** (STEM)

**📋 Başvuru Gereksinimleri:**
• TOEFL 100+ veya IELTS 7.0+
• GRE/GMAT (program bazında)
• Statement of Purpose
• 3 Referans Mektubu
• Finansal Garanti Belgesi

**💰 Maliyetler (Yıllık):**
• Eğitim: $30,000-80,000 (devlet vs özel)
• Yaşam: $15,000-25,000
• Sağlık Sigortası: $2,000-3,000

**🎓 Önemli Burs Programları:**
• **Fulbright** - Tam burs + yaşam gideri
• **Hubert H. Humphrey** - Profesyoneller için
• Üniversite bazlı merit bursları
• Araştırma Asistanlığı (RA) - Ücretsiz + maaş

**🛂 F-1 Vize Süreci:**
1. Üniversiteden kabul al (I-20 formu)
2. SEVIS ücreti öde ($350)
3. DS-160 formu doldur
4. Vize mülakatı ($185)
• Süre: 2-8 hafta

Kişiselleştirilmiş ABD başvuru danışmanlığı için kayıt olun! 🚀`
                : `🇺🇸 **Studying in the USA - Comprehensive Guide**

**✨ Why USA?**
• World's most prestigious universities (Harvard, MIT, Stanford)
• Wide range of programs and research opportunities
• Campus life and networking
• OPT allows **up to 3 years work** after graduation (STEM)

**📋 Application Requirements:**
• TOEFL 100+ or IELTS 7.0+
• GRE/GMAT (program dependent)
• Statement of Purpose
• 3 Recommendation Letters
• Financial Documents

**💰 Annual Costs:**
• Tuition: $30,000-80,000 (public vs private)
• Living: $15,000-25,000
• Health Insurance: $2,000-3,000

**🎓 Major Scholarship Programs:**
• **Fulbright** - Full funding + living expenses
• **Hubert H. Humphrey** - For professionals
• Merit-based university scholarships
• Research Assistantships (RA) - Free tuition + stipend

**🛂 F-1 Visa Process:**
1. Get university acceptance (I-20 form)
2. Pay SEVIS fee ($350)
3. Complete DS-160 form
4. Visa interview ($185)
• Timeline: 2-8 weeks

Sign up for personalized US application consulting! 🚀`
        }

        // Avustralya / Australia
        if (input.match(/(avustralya|australia|aussie|sydney|melbourne)/)) {
            return locale === 'tr'
                ? `🇦🇺 **Avustralya'da Eğitim - Kapsamlı Rehber**

**✨ Neden Avustralya?**
• Dünya sıralamasında 7 üniversite ilk 100'de (Melbourne, Sydney, ANU)
• Mezuniyet sonrası **2-4 yıl çalışma vizesi** (PSWV)
• Mükemmel yaşam kalitesi ve güvenli ortam
• 6 aylık tatil dönemlerinde **haftada 48 saat** çalışma hakkı
• Çok kültürlü ortam, büyük Türk topluluğu

**📋 Başvuru Gereksinimleri:**
• IELTS 6.0-7.0 veya TOEFL 79-100
• Lisans için: Lise diploması + transkript
• Master için: Lisans diploması, GPA 2.5+
• GTE (Genuine Temporary Entrant) beyanı
• Mali durum belgesi (~AUD$21,000/yıl)

**💰 Maliyetler (Yıllık):**
• Eğitim: AUD$20,000-45,000 (programa göre)
• Yaşam: AUD$21,000-25,000
• Sağlık Sigortası (OSHC): AUD$500-700
• Toplam: ~AUD$50,000-70,000/yıl

**🎓 En İyi Üniversiteler:**
• University of Melbourne (Dünya #14)
• University of Sydney (#19)
• Australian National University (#30)
• UNSW Sydney (#19)
• University of Queensland (#43)

**🛂 Student Visa (Subclass 500):**
• Harç: AUD$710
• Süre: 4-8 hafta
• Gerekli: CoE, OSHC, mali belgeler, GTE
• Avantaj: Aile vizesi alabilir

**🏙️ Popüler Şehirler:**
• **Sydney** - En büyük, pahalı ama iş fırsatı bol
• **Melbourne** - Kültürel, öğrenci dostu
• **Brisbane** - Uygun fiyat, tropikal iklim
• **Perth** - Madencilik sektörü, az nüfuslu
• **Adelaide** - En ekonomik, göç puanı bonusu

Avustralya başvurunuz için kayıt olun! 🦘`
                : `🇦🇺 **Studying in Australia - Comprehensive Guide**

**✨ Why Australia?**
• 7 universities in world top 100 (Melbourne, Sydney, ANU)
• **2-4 year post-study work visa** (PSWV)
• Excellent quality of life and safe environment
• **48 hours/week** work during breaks
• Multicultural environment

**📋 Application Requirements:**
• IELTS 6.0-7.0 or TOEFL 79-100
• Bachelor's: High school diploma + transcript
• Master's: Bachelor's degree, GPA 2.5+
• GTE (Genuine Temporary Entrant) statement
• Financial proof (~AUD$21,000/year)

**💰 Annual Costs:**
• Tuition: AUD$20,000-45,000 (program dependent)
• Living: AUD$21,000-25,000
• Health Insurance (OSHC): AUD$500-700
• Total: ~AUD$50,000-70,000/year

**🎓 Top Universities:**
• University of Melbourne (World #14)
• University of Sydney (#19)
• Australian National University (#30)
• UNSW Sydney (#19)
• University of Queensland (#43)

**🛂 Student Visa (Subclass 500):**
• Fee: AUD$710
• Timeline: 4-8 weeks
• Required: CoE, OSHC, financials, GTE
• Benefit: Can bring family

**🏙️ Popular Cities:**
• **Sydney** - Largest, expensive but job opportunities
• **Melbourne** - Cultural, student-friendly
• **Brisbane** - Affordable, tropical climate
• **Perth** - Mining industry, less populated
• **Adelaide** - Most economical, migration bonus

Sign up for Australia application support! 🦘`
        }

        // Kanada / Canada
        if (input.match(/(kanada|canada|canadian|toronto|vancouver)/)) {
            return locale === 'tr'
                ? `🇨🇦 **Kanada'da Eğitim - Kapsamlı Rehber**

**✨ Neden Kanada?**
• Dünya'nın en güvenli ülkelerinden biri
• Mezuniyet sonrası **3 yıla kadar çalışma izni** (PGWP)
• Kalıcı oturma (PR) için kolay yol
• ABD'ye yakın, daha uygun fiyatlı
• Çift dilli ortam (İngilizce + Fransızca)

**📋 Başvuru Gereksinimleri:**
• IELTS 6.0-6.5 veya TOEFL 80-90
• Lisans diploması (master için)
• GPA 3.0/4.0 önerilen
• Motivasyon mektubu
• 2 Referans mektubu
• GIC (Guaranteed Investment Certificate) ~CAD$10,000

**💰 Maliyetler (Yıllık):**
• Eğitim: CAD$15,000-35,000
• Yaşam: CAD$12,000-18,000
• Sağlık Sigortası: Eyalete göre ücretsiz/ücretli
• Toplam: ~CAD$30,000-55,000/yıl

**🎓 En İyi Üniversiteler:**
• University of Toronto (Dünya #21)
• University of British Columbia (#34)
• McGill University (#31)
• University of Montreal
• University of Alberta

**🛂 Study Permit:**
• Harç: CAD$150
• Süre: 8-16 hafta
• SDS programı ile hızlandırılmış süreç (4 hafta)
• Kampüste çalışma: 20 saat/hafta

**🏙️ Popüler Şehirler:**
• **Toronto** - En büyük şehir, iş merkezi
• **Vancouver** - Doğayla iç içe, Asya yakın
• **Montreal** - Fransızca, kültürel, uygun
• **Calgary** - Petrol sektörü, düşük vergi
• **Ottawa** - Başkent, hükümet işleri

Kanada eğitim planınız için kayıt olun! 🍁`
                : `🇨🇦 **Studying in Canada - Comprehensive Guide**

**✨ Why Canada?**
• One of the safest countries in the world
• **Up to 3-year post-graduation work permit** (PGWP)
• Easy pathway to permanent residence (PR)
• Close to USA, more affordable
• Bilingual environment (English + French)

**📋 Application Requirements:**
• IELTS 6.0-6.5 or TOEFL 80-90
• Bachelor's degree (for master's)
• GPA 3.0/4.0 recommended
• Statement of Purpose
• 2 Reference Letters
• GIC (Guaranteed Investment Certificate) ~CAD$10,000

**💰 Annual Costs:**
• Tuition: CAD$15,000-35,000
• Living: CAD$12,000-18,000
• Health Insurance: Free/paid by province
• Total: ~CAD$30,000-55,000/year

**🎓 Top Universities:**
• University of Toronto (World #21)
• University of British Columbia (#34)
• McGill University (#31)
• University of Montreal
• University of Alberta

**🛂 Study Permit:**
• Fee: CAD$150
• Timeline: 8-16 weeks
• SDS program for faster processing (4 weeks)
• On-campus work: 20 hours/week

**🏙️ Popular Cities:**
• **Toronto** - Largest city, business hub
• **Vancouver** - Nature, close to Asia
• **Montreal** - French, cultural, affordable
• **Calgary** - Oil industry, low taxes
• **Ottawa** - Capital, government jobs

Sign up for Canada education planning! 🍁`
        }

        // İngiltere / UK
        if (input.match(/(ingiltere|uk|united kingdom|british|london|oxford|cambridge|england)/)) {
            return locale === 'tr'
                ? `🇬🇧 **İngiltere'de Eğitim - Kapsamlı Rehber**

**✨ Neden İngiltere?**
• Dünya'nın en prestijli üniversiteleri (Oxford, Cambridge)
• Master programları **sadece 1 yıl** - hızlı mezuniyet
• İngilizce'nin ana vatanı, mükemmel dil gelişimi
• Mezuniyet sonrası **2 yıl çalışma vizesi** (Graduate Route)
• Avrupa'ya kolay ulaşım

**📋 Başvuru Gereksinimleri:**
• IELTS 6.5-7.0 (program bazında değişir)
• UCAS üzerinden başvuru (lisans için)
• Personal Statement
• Referans mektubu
• Portfolyo (sanat/tasarım için)

**💰 Maliyetler (Yıllık):**
• Eğitim: £15,000-38,000 (programa göre)
• Yaşam (Londra): £15,000-18,000
• Yaşam (Londra dışı): £12,000-15,000
• Sağlık Sigortası: £470/yıl (IHS)
• Toplam: ~£28,000-55,000/yıl

**🎓 En İyi Üniversiteler:**
• University of Oxford (Dünya #1)
• University of Cambridge (#2)
• Imperial College London (#6)
• UCL (#9)
• LSE (#45)

**🛂 Student Visa:**
• Harç: £348 + £470/yıl IHS
• Süre: 3-8 hafta
• CAS numarası gerekli
• 28 gün banka bakiyesi (Londra: £1,334/ay)

**🏙️ Popüler Şehirler:**
• **Londra** - Global finans merkezi, pahalı
• **Manchester** - Öğrenci dostu, uygun fiyat
• **Edinburgh** - İskoçya, güzel mimari
• **Bristol** - Teknoloji hub'ı
• **Birmingham** - 2. büyük şehir, çeşitlilik

İngiltere başvurunuz için kayıt olun! 🎓`
                : `🇬🇧 **Studying in the UK - Comprehensive Guide**

**✨ Why UK?**
• World's most prestigious universities (Oxford, Cambridge)
• Master's programs **only 1 year** - fast graduation
• Birthplace of English, excellent language development
• **2-year post-study work visa** (Graduate Route)
• Easy access to Europe

**📋 Application Requirements:**
• IELTS 6.5-7.0 (varies by program)
• UCAS application (for undergraduate)
• Personal Statement
• Reference letter
• Portfolio (for art/design)

**💰 Annual Costs:**
• Tuition: £15,000-38,000 (program dependent)
• Living (London): £15,000-18,000
• Living (outside London): £12,000-15,000
• Health Surcharge: £470/year (IHS)
• Total: ~£28,000-55,000/year

**🎓 Top Universities:**
• University of Oxford (World #1)
• University of Cambridge (#2)
• Imperial College London (#6)
• UCL (#9)
• LSE (#45)

**🛂 Student Visa:**
• Fee: £348 + £470/year IHS
• Timeline: 3-8 weeks
• CAS number required
• 28-day bank balance (London: £1,334/month)

**🏙️ Popular Cities:**
• **London** - Global finance hub, expensive
• **Manchester** - Student-friendly, affordable
• **Edinburgh** - Scotland, beautiful architecture
• **Bristol** - Tech hub
• **Birmingham** - 2nd largest, diverse

Sign up for UK application support! 🎓`
        }

        // Burs
        if (input.match(/(burs|scholarship|mali destek|financial|funding|tam burs|full)/)) {
            return locale === 'tr'
                ? `💰 **Burs Fırsatları - Detaylı Rehber**

**🌟 En Prestijli Tam Burs Programları:**

**1. Fulbright (ABD)** 🇺🇸
• Kapsamı: Eğitim + yaşam + seyahat + sağlık sigortası
• Kimler başvurabilir: Türk vatandaşları, lisans mezunu
• Son başvuru: Genellikle Mayıs
• Seçim oranı: ~%10

**2. DAAD (Almanya)** 🇩🇪
• Kapsamı: €934/ay + seyahat + sağlık sigortası
• Programlar: Yüksek lisans, doktora, araştırma
• Son başvuru: Ekim-Kasım
• Seçim oranı: ~%20

**3. Chevening (İngiltere)** 🇬🇧
• Kapsamı: Tam eğitim + £1,300/ay yaşam + seyahat
• Süre: 1 yıllık master programları
• Son başvuru: Kasım
• Seçim oranı: ~%5

**4. Erasmus+ (AB)** 🇪🇺
• Kapsamı: €700-1400/ay (ülkeye göre)
• Programlar: Değişim, ortak yüksek lisans
• Süre: 3-24 ay

**📊 Başvuru İpuçları:**
• En az 6 ay önceden hazırlık başlayın
• Motivasyon mektubuna özen gösterin
• Referanslarınızı erken bilgilendirin
• Birden fazla bursa başvurun

Sistemimizde **500+ aktif burs** var. Kayıt olarak size uygun bursları filtreleyin! 🎯`
                : `💰 **Scholarship Opportunities - Detailed Guide**

**🌟 Most Prestigious Full Scholarships:**

**1. Fulbright (USA)** 🇺🇸
• Coverage: Tuition + living + travel + health insurance
• Who: Bachelor's degree holders
• Deadline: Usually May
• Selection rate: ~10%

**2. DAAD (Germany)** 🇩🇪
• Coverage: €934/month + travel + health insurance
• Programs: Master's, PhD, research
• Deadline: October-November
• Selection rate: ~20%

**3. Chevening (UK)** 🇬🇧
• Coverage: Full tuition + £1,300/month + travel
• Duration: 1-year master's programs
• Deadline: November
• Selection rate: ~5%

**4. Erasmus+ (EU)** 🇪🇺
• Coverage: €700-1400/month (varies by country)
• Programs: Exchange, joint master's
• Duration: 3-24 months

**📊 Application Tips:**
• Start preparation at least 6 months early
• Perfect your motivation letter
• Inform referees early
• Apply to multiple scholarships

We have **500+ active scholarships** in our database. Sign up to filter matching opportunities! 🎯`
        }

        // Vize
        if (input.match(/(vize|visa|student visa|öğrenci vizesi)/)) {
            return locale === 'tr'
                ? `🛂 **Öğrenci Vize Rehberi**

**🇺🇸 ABD (F-1 Vizesi)**
• Harç: $350 (SEVIS) + $185 (vize)
• Süre: 2-8 hafta
• Gerekli: I-20 formu, mali belgeler, mülakat
• İpucu: Mülakatta açık ve özgüvenli olun

**🇬🇧 İngiltere (Student Visa)**
• Harç: £348 + £470/yıl sağlık
• Süre: 3-8 hafta
• Gerekli: CAS numarası, £9,207+ banka hesabı (Londra)
• Online başvuru + biyometri randevusu

**🇩🇪 Almanya (National Visa)**
• Harç: €75
• Süre: 4-8 hafta
• Gerekli: Bloke hesap (€11,208), APS sertifikası
• İpucu: Randevu almak için erken başvurun

**🇨🇦 Kanada (Study Permit)**
• Harç: CAD $150
• Süre: 4-12 hafta
• Gerekli: Kabul mektubu, mali belgeler
• Avantaj: PGWP ile mezuniyet sonrası çalışma

**📋 Genel Gereksinimler:**
• Pasaport (en az 6 ay geçerli)
• Kabul mektubu
• Mali durum belgesi
• Dil sertifikası
• Sağlık sigortası

Vize sürecinizi adım adım yönetmek için kayıt olun! ✈️`
                : `🛂 **Student Visa Guide**

**🇺🇸 USA (F-1 Visa)**
• Fees: $350 (SEVIS) + $185 (visa)
• Timeline: 2-8 weeks
• Required: I-20 form, financial docs, interview
• Tip: Be clear and confident in interview

**🇬🇧 UK (Student Visa)**
• Fees: £348 + £470/year health surcharge
• Timeline: 3-8 weeks
• Required: CAS number, £9,207+ bank balance (London)
• Online application + biometrics appointment

**🇩🇪 Germany (National Visa)**
• Fees: €75
• Timeline: 4-8 weeks
• Required: Blocked account (€11,208)
• Tip: Book appointment early

**🇨🇦 Canada (Study Permit)**
• Fees: CAD $150
• Timeline: 4-12 weeks
• Required: Acceptance letter, financial docs
• Benefit: PGWP for post-graduation work

**📋 Common Requirements:**
• Valid passport (6+ months)
• Acceptance letter
• Proof of funds
• Language certificate
• Health insurance

Sign up to manage your visa process step by step! ✈️`
        }

        // Dil okulu
        if (input.match(/(dil okulu|dil eğitimi|language school|ingilizce|english course|almanca|german course|dil kursu)/)) {
            return locale === 'tr'
                ? `🗣️ **Dil Okulları Rehberi**

**🇬🇧 İngiltere**
• En iyi şehirler: Cambridge, Oxford, Londra, Brighton
• Haftalık maliyet: £250-450
• Avantaj: Native ortam, aksan kalitesi
• Popüler okullar: British Council, EF, Kaplan

**🇦🇺 Avustralya**
• Haftalık maliyet: AUD$300-450
• Avantaj: Çalışma izni (haftada 48 saat), güneşli iklim
• Şehirler: Sydney, Melbourne, Brisbane, Gold Coast
• Süre: 4 hafta - 12 ay
• Bonus: IELTS hazırlık kursları mükemmel

**🇲🇹 Malta**
• Haftalık maliyet: €200-350
• Avantaj: Uygun fiyat, güneşli iklim, AB vizesi
• Süre: 2 hafta - 12 ay
• İpucu: Yaz ayları çok kalabalık

**🇮🇪 İrlanda**
• Haftalık maliyet: €200-350
• Avantaj: Çalışma izni (haftada 20 saat)
• Şehirler: Dublin, Cork, Galway

**🇩🇪 Almanya (Almanca)**
• Goethe Institut: ~€1,200/ay (yoğun)
• VHS (Halk Eğitim): €300-500/kurs
• Üniversite hazırlık: Studienkolleg

**⏱️ Önerilen Süre:**
• Turistik: 2-4 hafta
• Orta seviye gelişim: 2-3 ay
• Akademik hazırlık: 6-12 ay

**💡 İpuçları:**
• Akredite okul seçin
• Konaklama seçeneklerini karşılaştırın
• Grubun milliyetine dikkat edin

Dil okulu karşılaştırması için kayıt olun! 📚`
                : `🗣️ **Language School Guide**

**🇬🇧 United Kingdom**
• Best cities: Cambridge, Oxford, London, Brighton
• Weekly cost: £250-450
• Advantage: Native environment, accent quality
• Popular schools: British Council, EF, Kaplan

**🇦🇺 Australia**
• Weekly cost: AUD$300-450
• Advantage: Work permit (48 hours/week), sunny climate
• Cities: Sydney, Melbourne, Brisbane, Gold Coast
• Duration: 4 weeks - 12 months
• Bonus: Excellent IELTS preparation courses

**🇲🇹 Malta**
• Weekly cost: €200-350
• Advantage: Affordable, sunny weather, EU visa
• Duration: 2 weeks - 12 months
• Tip: Summer months are crowded

**🇮🇪 Ireland**
• Weekly cost: €200-350
• Advantage: Work permit (20 hours/week)
• Cities: Dublin, Cork, Galway

**🇩🇪 Germany (German)**
• Goethe Institut: ~€1,200/month (intensive)
• VHS (Community): €300-500/course
• University prep: Studienkolleg

**⏱️ Recommended Duration:**
• Tourist: 2-4 weeks
• Intermediate improvement: 2-3 months
• Academic preparation: 6-12 months

**💡 Tips:**
• Choose accredited schools
• Compare accommodation options
• Check group nationality mix

Sign up for language school comparisons! 📚`
        }

        // Üniversite / okumak
        if (input.match(/(üniversite|university|okul|okumak|study|master|lisans|bachelor|phd|doktora|yüksek lisans)/)) {
            return locale === 'tr'
                ? `🎓 **Yurtdışı Eğitim Danışmanlığı**

**Popüler Destinasyonlar ve Avantajları:**

🇩🇪 **Almanya** - Ücretsiz eğitim, güçlü ekonomi
🇺🇸 **ABD** - En prestijli üniversiteler
🇬🇧 **İngiltere** - 1 yıllık master, hızlı mezuniyet
🇨🇦 **Kanada** - Kolay göç politikası
🇳🇱 **Hollanda** - İngilizce programlar, uygun maliyetler
🇦🇺 **Avustralya** - Çalışma izni, yaşam kalitesi

**📋 Genel Gereksinimler:**
• Lisans için: Lise diploması, dil sertifikası
• Master için: Lisans diploması, GPA 2.5+, dil sertifikası
• PhD için: Yüksek lisans, araştırma proposal

**⏰ Planlama Takvimi:**
• 12-18 ay önce: Ülke/program araştırması
• 10-12 ay önce: Dil sınavı (IELTS/TOEFL)
• 8-10 ay önce: Başvuru belgeleri hazırlık
• 6-8 ay önce: Başvuru gönderimi
• 3-4 ay önce: Vize başvurusu

Hangi ülke veya program hakkında detaylı bilgi istersiniz? 🌍`
                : `🎓 **Study Abroad Consulting**

**Popular Destinations and Benefits:**

🇩🇪 **Germany** - Free tuition, strong economy
🇺🇸 **USA** - Most prestigious universities
🇬🇧 **UK** - 1-year master's, fast graduation
🇨🇦 **Canada** - Easy immigration policy
🇳🇱 **Netherlands** - English programs, affordable
🇦🇺 **Australia** - Work permit, quality of life

**📋 General Requirements:**
• Bachelor's: High school diploma, language certificate
• Master's: Bachelor's degree, GPA 2.5+, language cert
• PhD: Master's degree, research proposal

**⏰ Planning Timeline:**
• 12-18 months before: Country/program research
• 10-12 months before: Language test (IELTS/TOEFL)
• 8-10 months before: Document preparation
• 6-8 months before: Submit applications
• 3-4 months before: Visa application

Which country or program would you like to know more about? 🌍`
        }

        // Default response - daha detaylı
        return locale === 'tr'
            ? `Eğitim danışmanlığı konusunda size yardımcı olmaya hazırım! 📚

**Detaylı bilgi alabileceğiniz konular:**

🌍 **Ülkeler:** "Almanya'da okumak istiyorum" veya "ABD eğitim masrafları"
💰 **Burslar:** "Fulbright burs" veya "Tam burslu programlar"
🛂 **Vizeler:** "ABD öğrenci vizesi nasıl alınır"
📚 **Dil Okulları:** "İngiltere'de dil okulu"
🎓 **Programlar:** "Bilgisayar mühendisliği master"

Örnek soru: **"Almanya'da ücretsiz mühendislik eğitimi için ne gerekiyor?"**

Daha spesifik bir soru sorarak başlayabilirsiniz! 😊

---
⚡ **Not:** Demo sürümündesiniz (${messageCount}/${MAX_MESSAGES} hak kullanıldı). 
Sınırsız erişim için **ücretsiz kayıt olun!**`
            : `I'm ready to help you with education consulting! 📚

**Topics you can ask about:**

🌍 **Countries:** "I want to study in Germany" or "USA education costs"
💰 **Scholarships:** "Fulbright scholarship" or "Fully funded programs"
🛂 **Visas:** "How to get US student visa"
📚 **Language Schools:** "Language school in UK"
🎓 **Programs:** "Computer engineering master's"

Example: **"What do I need for free engineering education in Germany?"**

Ask a specific question to get started! 😊

---
⚡ **Note:** You're in demo mode (${messageCount}/${MAX_MESSAGES} used). 
**Sign up free** for unlimited access!`
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
        return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="animate-pulse text-blue-600">Loading...</div>
        </div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Navigation */}
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
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-10">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <GraduationCap className="h-7 w-7" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            {locale === 'tr' ? 'Eğitim AI Danışmanı' : 'Education AI Advisor'}
                        </h1>
                        <Badge className="bg-white/20 text-white border-0">DEMO</Badge>
                    </div>
                    <p className="text-blue-100">
                        {locale === 'tr'
                            ? 'Yurtdışı eğitim, burs ve vize konularında uzman AI danışmanınız'
                            : 'Your expert AI advisor for studying abroad, scholarships and visas'}
                    </p>
                </div>
            </div>

            {/* Chat */}
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-3xl mx-auto">
                    <Card className="shadow-2xl border-0 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{locale === 'tr' ? 'Eğitim Danışmanı' : 'Education Advisor'}</CardTitle>
                                        <div className="flex items-center text-blue-100 text-xs">
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
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
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
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <Bot className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
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
                                        <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700">
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