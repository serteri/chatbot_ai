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
import { EcommerceWidget } from '@/components/widget/EcommerceWidget'
import {
    ShoppingCart,
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

const STORAGE_KEY = 'ndisshield_ecommerce_demo'
const MAX_MESSAGES = 5
const EXPIRY_HOURS = 24

export default function EcommerceDemoPage() {
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

    // Load message count from localStorage
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

    // Auto-scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    // Focus input
    useEffect(() => {
        if (!isLoading && remainingMessages > 0) {
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isLoading, remainingMessages])

    // Welcome message
    useEffect(() => {
        if (!isInitialized) return

        const welcomeContent = locale === 'tr'
            ? `Merhaba! 👋 Ben NDIS Shield Hub E-Ticaret Destek AI'ınızım.

🛒 **Uzman Olduğum Konular:**
• Ürün önerileri ve detaylı bilgiler
• Sipariş takibi ve durum sorgulama
• İade, değişim ve garanti işlemleri
• Ödeme sorunları ve fatura sorgulama
• Kargo, teslimat ve lojistik bilgileri
• Kampanya ve indirim bilgileri

Bu demo sürümünde **${MAX_MESSAGES} soru** sorabilirsiniz. Sınırsız erişim için ücretsiz kayıt olun!

💡 **Örnek sorular:**
"Siparişimi iptal etmek istiyorum"
"Ürün bana uymadı, nasıl iade ederim?"

Size nasıl yardımcı olabilirim?`
            : `Hello! 👋 I'm your NDIS Shield Hub E-Commerce Support AI.

🛒 **My Expertise:**
• Product recommendations and detailed info
• Order tracking and status inquiries
• Returns, exchanges, and warranty
• Payment issues and invoice inquiries
• Shipping, delivery, and logistics
• Campaigns and discount information

In this demo, you can ask **${MAX_MESSAGES} questions**. Sign up free for unlimited access!

💡 **Example questions:**
"I want to cancel my order"
"The product doesn't fit, how do I return it?"

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
            const response = generateEcommerceResponse(userInput)

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

    const generateEcommerceResponse = (userInput: string): string => {
        const input = userInput.toLowerCase().trim()

        // Selamlaşma
        if (input.match(/^(merhaba|selam|hey|hi|hello|naber|nasılsın)/)) {
            return locale === 'tr'
                ? `Merhaba! 😊 Size yardımcı olmak için buradayım!

E-ticaret desteği konusunda 7/24 hizmetinizdeyim:

📦 **Sipariş İşlemleri** - Takip, iptal, değişiklik
🔄 **İade & Değişim** - Kolay iade süreci
💳 **Ödeme** - Fatura, taksit, hata çözümü
🚚 **Kargo** - Teslimat süresi, takip
🏷️ **Ürünler** - Öneri, stok, fiyat

Hangi konuda yardımcı olabilirim?`
                : `Hello! 😊 I'm here to help you!

I'm available 24/7 for e-commerce support:

📦 **Order Management** - Tracking, cancellation, changes
🔄 **Returns & Exchanges** - Easy return process
💳 **Payment** - Invoice, installments, error resolution
🚚 **Shipping** - Delivery time, tracking
🏷️ **Products** - Recommendations, stock, pricing

What can I help you with?`
        }

        // ============================================
        // SİPARİŞ İPTAL - ÖNCE KONTROL (spesifik > genel)
        // ============================================
        if (input.match(/(iptal|cancel|vazgeç|istemiyorum|almak istemiyorum)/)) {
            return locale === 'tr'
                ? `🚫 **Sipariş İptal İşlemi**

**📋 Siparişinizin Durumuna Göre:**

**1️⃣ Henüz Hazırlanmadıysa:**
✅ **Anında iptal edilebilir!**
• Hesabınızda "Siparişlerim" → "İptal Et" tıklayın
• Veya sipariş numaranızı söyleyin, hemen iptal edeyim

**2️⃣ Hazırlanıyorsa:**
⏳ İptal talebi oluşturulur (15-30 dk onay)
• Onaylanmazsa teslimatta reddedebilirsiniz

**3️⃣ Kargoya Verildiyse:**
📦 Teslimatta "Almıyorum" deyin
• Ürün bize döner, ödemeniz iade edilir

**💰 Para İadesi Süreleri:**
• Kredi kartı: 1-7 iş günü
• Banka kartı: 1-3 iş günü
• Kapıda ödeme: Zaten ödeme yapmadınız ✌️

**🆔 Sipariş numaranızı paylaşın!**
Durumunu kontrol edip en hızlı çözümü sunayım.

---
📌 Demo (${messageCount}/${MAX_MESSAGES}) | Gerçek işlem için kayıt olun!`
                : `🚫 **Order Cancellation**

**📋 Based on Your Order Status:**

**1️⃣ Not Yet Prepared:**
✅ **Can be cancelled instantly!**
• Go to "My Orders" → Click "Cancel Order"
• Or share your order number, I'll cancel it right away

**2️⃣ Being Prepared:**
⏳ Cancellation request created (15-30 min approval)
• If not approved, you can reject at delivery

**3️⃣ Already Shipped:**
📦 Say "I'm not accepting" to the courier
• Product returns to us, payment refunded

**💰 Refund Timeline:**
• Credit card: 1-7 business days
• Debit card: 1-3 business days
• Cash on delivery: You didn't pay yet ✌️

**🆔 Share your order number!**
I'll check the status and provide the fastest solution.

---
📌 Demo (${messageCount}/${MAX_MESSAGES}) | Sign up for actual cancellations!`
        }

        // Sipariş takibi/nerede
        if (input.match(/(sipariş|order|takip|track|nerede|where|durumu|status|kargom|gönderi)/)) {
            return locale === 'tr'
                ? `📦 **Sipariş Takip Sistemi**

Siparişinizi takip etmenin birkaç yolu var:

**1. Sipariş Numarası ile Takip:**
• Sipariş onay e-postanızda "SPR-XXXXX" formatında numara var
• Bu numarayı bana söyleyin, durumu kontrol edeyim

**2. Kargo Firması Takip:**
• Kargo kodu size SMS ile gönderilir
• Popüler kargo firmaları: Yurtiçi, Aras, MNG, PTT, UPS

**3. Hesabınızdan Takip:**
• "Siparişlerim" sayfasından canlı takip
• Push bildirim ile anlık durum güncellemesi

**⏱️ Tahmini Teslimat Süreleri:**
• Aynı şehir içi: 1-2 iş günü
• Şehirlerarası: 2-4 iş günü
• Büyük/ağır ürünler: 3-7 iş günü

**📞 Destek:**
Sipariş numaranızı paylaşırsanız hemen kontrol edebilirim!

Tam sürümde otomatik sipariş takibi için kayıt olun! 🚀`
                : `📦 **Order Tracking System**

There are several ways to track your order:

**1. Track by Order Number:**
• Your confirmation email contains "ORD-XXXXX" format number
• Share it with me to check the status

**2. Carrier Tracking:**
• Tracking code is sent via SMS
• Popular carriers: FedEx, UPS, DHL, USPS

**3. Account Tracking:**
• Live tracking from "My Orders" page
• Push notifications for status updates

**⏱️ Estimated Delivery Times:**
• Same city: 1-2 business days
• Interstate: 2-4 business days
• Large/heavy items: 3-7 business days

**📞 Support:**
Share your order number and I'll check right away!

Sign up for automated order tracking! 🚀`
        }

        // İade
        if (input.match(/(iade|return|geri|back|değişim|exchange|uymadı|fit|beğenmedim|memnun değil)/)) {
            return locale === 'tr'
                ? `🔄 **İade & Değişim Rehberi**

**📋 İade Koşulları:**
• Teslimattan itibaren **14 gün** içinde iade hakkı
• Ürün orijinal ambalajında, kullanılmamış olmalı
• Fatura ve iade formu gerekli
• İç giyim, kozmetik, kişisel bakım ürünleri iade dışı

**🔄 İade Adımları:**
1. **Talep Oluşturun** - Hesabınızdan veya müşteri hizmetleri
2. **Onay Alın** - 1-2 iş günü içinde yanıt
3. **Paketi Hazırlayın** - Orijinal kutu + fatura + form
4. **Kargo Gönderin** - Anlaşmalı kargo (ücretsiz) veya kendiniz
5. **Para İadesi** - 3-7 iş günü (aynı ödeme yöntemine)

**💳 Para İadesi Süreleri:**
• Kredi Kartı: 3-7 iş günü
• Banka Kartı: 1-3 iş günü
• Kapıda Ödeme: 7-10 iş günü (IBAN'a)

**📞 Hızlı Yardım:**
Sipariş numaranızı paylaşın, iade talebinizi hemen başlatayım!

Kolay iade yönetimi için ücretsiz kayıt olun! 🎯`
                : `🔄 **Returns & Exchange Guide**

**📋 Return Conditions:**
• **14 days** from delivery to return
• Product must be unused in original packaging
• Receipt and return form required
• Underwear, cosmetics, personal care items excluded

**🔄 Return Steps:**
1. **Create Request** - From your account or customer service
2. **Get Approval** - Response within 1-2 business days
3. **Prepare Package** - Original box + receipt + form
4. **Ship It** - Partner carrier (free) or your own
5. **Refund** - 3-7 business days (same payment method)

**💳 Refund Timelines:**
• Credit Card: 3-7 business days
• Debit Card: 1-3 business days
• Cash on Delivery: 7-10 business days (to IBAN)

**📞 Quick Help:**
Share your order number, I'll start your return right away!

Sign up for easy return management! 🎯`
        }

        // Ödeme
        if (input.match(/(ödeme|payment|fatura|invoice|taksit|installment|kredi kartı|credit card|hata|error|reddedildi|declined)/)) {
            return locale === 'tr'
                ? `💳 **Ödeme & Fatura Yardımı**

**💳 Kabul Edilen Ödeme Yöntemleri:**
• Kredi/Banka Kartı (Visa, Mastercard, Troy)
• Havale/EFT
• Kapıda Ödeme (+₺20 hizmet bedeli)
• Dijital Cüzdanlar (Apple Pay, Google Pay)

**📊 Taksit Seçenekleri:**
• 500₺ üzeri: 3 taksit
• 1000₺ üzeri: 6 taksit
• 2000₺ üzeri: 9-12 taksit
• Bazı bankalarla özel kampanyalar

**❌ Ödeme Hatası Çözümleri:**
• **"Kart reddedildi"** → Limit kontrolü, 3D Secure aktifliği
• **"İşlem tamamlanamadı"** → Tarayıcı önbelleği temizle, farklı kart dene
• **"CVV hatası"** → Kartın arkasındaki 3 haneyi kontrol et
• **"Banka hatası"** → Bankanızla iletişime geçin

**🧾 Fatura İşlemleri:**
• E-fatura otomatik gönderilir
• Kurumsal fatura için kayıt sırasında seçin
• Geçmiş faturalar "Siparişlerim"de

**🔧 Sorun Çözülmezse:**
Ekran görüntüsü paylaşın, teknik ekibimiz inceleyecek!

Güvenli ödeme için kayıt olun! 🔒`
                : `💳 **Payment & Invoice Help**

**💳 Accepted Payment Methods:**
• Credit/Debit Card (Visa, Mastercard, Amex)
• Bank Transfer
• Cash on Delivery (+$5 service fee)
• Digital Wallets (Apple Pay, Google Pay, PayPal)

**📊 Installment Options:**
• $100+: 3 installments
• $250+: 6 installments
• $500+: 9-12 installments
• Special bank promotions available

**❌ Payment Error Solutions:**
• **"Card declined"** → Check limit, 3D Secure enabled
• **"Transaction failed"** → Clear browser cache, try different card
• **"CVV error"** → Verify 3-digit code on back
• **"Bank error"** → Contact your bank

**🧾 Invoice Operations:**
• E-invoice sent automatically
• Business invoice: select during registration
• Past invoices in "My Orders"

**🔧 If Issue Persists:**
Share a screenshot and our tech team will investigate!

Sign up for secure payments! 🔒`
        }

        // Kargo
        if (input.match(/(kargo|shipping|teslimat|delivery|ne zaman|when|gecikmeli|delay|gelmedi|gelmiyor)/)) {
            return locale === 'tr'
                ? `🚚 **Kargo & Teslimat Bilgileri**

**⏱️ Standart Teslimat Süreleri:**
• Büyükşehirler: 1-2 iş günü
• Diğer iller: 2-4 iş günü
• Köy/kasaba: 3-5 iş günü
• Büyük ürünler: 5-7 iş günü

**🚀 Hızlı Teslimat Seçenekleri:**
• **Aynı Gün** - Büyükşehirlerde, 14:00'e kadar sipariş (+₺50)
• **Ertesi Gün** - Türkiye geneli, 16:00'ya kadar sipariş (+₺30)

**📦 Kargo Firmaları:**
• Yurtiçi Kargo: Geniş ağ, güvenilir
• Aras Kargo: Hızlı dağıtım
• MNG Kargo: Ekonomik seçenek
• PTT: Uzak bölgelerde avantajlı

**⚠️ Gecikme Durumunda:**
1. Kargo takip kodunu kontrol edin
2. Dağıtım şubesini arayın
3. Müşteri hizmetlerine bildirin
4. Kayıp/hasarlı için tazminat talep edin

**🆓 Ücretsiz Kargo:**
• 200₺ üzeri siparişlerde geçerli
• Bazı ürünlerde her siparişte ücretsiz

Kargonuz hakkında soru sormak için sipariş numaranızı paylaşın! 📬`
                : `🚚 **Shipping & Delivery Info**

**⏱️ Standard Delivery Times:**
• Major cities: 1-2 business days
• Other areas: 2-4 business days
• Rural areas: 3-5 business days
• Large items: 5-7 business days

**🚀 Express Delivery Options:**
• **Same Day** - Major cities, order by 2 PM (+$10)
• **Next Day** - Nationwide, order by 4 PM (+$6)

**📦 Carriers:**
• FedEx: Fast & reliable
• UPS: Wide network
• USPS: Economical option
• DHL: International specialist

**⚠️ In Case of Delay:**
1. Check tracking code
2. Contact distribution center
3. Report to customer service
4. Request compensation for lost/damaged

**🆓 Free Shipping:**
• On orders over $50
• Some products always free shipping

Share your order number to ask about your shipment! 📬`
        }

        // Ürün
        if (input.match(/(ürün|product|stok|stock|fiyat|price|öneri|recommend|kampanya|sale|indirim|discount)/)) {
            return locale === 'tr'
                ? `🏷️ **Ürün & Kampanya Bilgileri**

**🔍 Ürün Arama İpuçları:**
• Arama çubuğuna ürün adı veya model kodu yazın
• Filtreleri kullanın: fiyat, marka, puan, renk, beden
• "Sıralama" ile en uygun sonuçları görün

**📊 Stok Durumu:**
• ✅ Stokta - Hemen kargoya verilir
• ⏳ Son X ürün - Acele edin!
• 📅 Ön sipariş - Belirtilen tarihte kargoda
• ❌ Stokta yok - Bildirim kurabilirsiniz

**💰 Kampanyalar (Bu Ay):**
• 🔥 **%20 indirim** - Elektronik kategorisinde
• 🎁 **Al 2 Öde 1** - Kozmetik ürünlerinde
• 💳 **9 taksit** - Seçili bankalarda
• 🚚 **Ücretsiz kargo** - 200₺ üzeri

**🏆 Önerilen Kategoriler:**
• Çok Satanlar - En popüler ürünler
• Fırsat Ürünleri - İndirimdekiler
• Yeni Gelenler - Son eklenen ürünler
• Haftanın Fırsatı - Özel seçim

Spesifik bir ürün veya kategori arıyorsanız söyleyin! 🛍️`
                : `🏷️ **Product & Campaign Info**

**🔍 Product Search Tips:**
• Type product name or model code in search
• Use filters: price, brand, rating, color, size
• "Sort" to find the best matches

**📊 Stock Status:**
• ✅ In Stock - Ships immediately
• ⏳ Only X left - Hurry!
• 📅 Pre-order - Ships on specified date
• ❌ Out of Stock - Set up notification

**💰 Current Campaigns:**
• 🔥 **20% off** - Electronics category
• 🎁 **Buy 2 Get 1** - Cosmetics products
• 💳 **9 installments** - Selected banks
• 🚚 **Free shipping** - Orders over $50

**🏆 Recommended Categories:**
• Best Sellers - Most popular items
• Deals - Discounted products
• New Arrivals - Recently added
• Weekly Special - Curated selection

Let me know if you're looking for a specific product! 🛍️`
        }

        // Default - anlaşılmadığında daha yardımcı
        return locale === 'tr'
            ? `Sorunuzu anlamaya çalışıyorum... 🤔

**Daha iyi yardımcı olabilmem için şu konularda soru sorabilirsiniz:**

📦 **Sipariş:** "Siparişim nerede?" veya "Siparişimi iptal et"
🔄 **İade:** "Ürünü iade etmek istiyorum" veya "Beden değişimi"
💳 **Ödeme:** "Kartım reddedildi" veya "Taksit seçenekleri"
🚚 **Kargo:** "Kargo ne zaman gelir?"
🏷️ **Ürünler:** "Bu ürün stokta var mı?"

**💡 Örnek sorular:**
• "Siparişimi iptal etmek istiyorum"
• "Ürün bana uymadı, nasıl iade ederim?"
• "Ödeme yaparken hata alıyorum"

---
📊 Demo (${messageCount}/${MAX_MESSAGES}) | Sınırsız destek için **kayıt olun!**`
            : `I'm trying to understand your question... 🤔

**For better assistance, you can ask about:**

📦 **Orders:** "Where is my order?" or "Cancel my order"
🔄 **Returns:** "I want to return a product" or "Size exchange"
💳 **Payment:** "My card was declined" or "Installment options"
🚚 **Shipping:** "When will my order arrive?"
🏷️ **Products:** "Is this item in stock?"

**💡 Example questions:**
• "I want to cancel my order"
• "The product doesn't fit, how do I return it?"
• "I'm getting an error during payment"

---
📊 Demo (${messageCount}/${MAX_MESSAGES}) | **Sign up** for unlimited support!`
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
        return <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
            <div className="animate-pulse text-orange-600">Loading...</div>
        </div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
            {/* Navigation */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link href={`/${locale}`} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-white" />
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
                                            ? 'bg-white shadow-md text-orange-600 font-semibold'
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
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-10">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="h-7 w-7" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            {locale === 'tr' ? 'E-Ticaret Destek AI' : 'E-Commerce Support AI'}
                        </h1>
                        <Badge className="bg-white/20 text-white border-0">DEMO</Badge>
                    </div>
                    <p className="text-orange-100">
                        {locale === 'tr'
                            ? 'Sipariş takibi, iade, ödeme ve kargo konularında 7/24 destek'
                            : '24/7 support for orders, returns, payments, and shipping'}
                    </p>
                </div>
            </div>

            {/* Chat */}
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-3xl mx-auto">
                    <Card className="shadow-2xl border-0 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{locale === 'tr' ? 'Destek Asistanı' : 'Support Assistant'}</CardTitle>
                                        <div className="flex items-center text-orange-100 text-xs">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse mr-1"></span>
                                            {locale === 'tr' ? 'Çevrimiçi' : 'Online'}
                                        </div>
                                    </div>
                                </div>
                                <Badge className={`${remainingMessages > 2 ? 'bg-white/20' : remainingMessages > 0 ? 'bg-yellow-500' : 'bg-red-500'} text-white border-0`}>
                                    <Zap className="w-3 h-3 mr-1" />
                                    {remainingMessages}/{MAX_MESSAGES}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="h-[400px] overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex items-end space-x-2 max-w-[90%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-orange-500' : 'bg-gradient-to-br from-orange-500 to-red-500'
                                            }`}>
                                            {message.role === 'user' ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-white" />}
                                        </div>
                                        <div className={`rounded-2xl px-4 py-2.5 ${message.role === 'user'
                                            ? 'bg-orange-500 text-white rounded-br-sm'
                                            : 'bg-white border border-gray-200 shadow-sm rounded-bl-sm'
                                            }`}>
                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                                            <div className={`text-xs mt-1.5 flex items-center ${message.role === 'user' ? 'text-orange-200 justify-end' : 'text-gray-400'}`}>
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
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                            <Bot className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
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
                                        <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} className="h-11 px-5 rounded-xl bg-orange-500 hover:bg-orange-600">
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

            {/* Floating WhatsApp-style Widget */}
            <EcommerceWidget locale={locale as 'tr' | 'en'} />
        </div>
    )
}