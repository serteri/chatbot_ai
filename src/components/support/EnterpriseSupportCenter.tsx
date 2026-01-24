'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    MessageCircle,
    Search,
    ChevronDown,
    ChevronRight,
    HelpCircle,
    CreditCard,
    Code,
    Bot,
    Shield,
    FileText,
    Headphones,
    Users,
    Zap,
    Globe,
    Settings,
    BarChart3,
    Phone,
    Mail,
    ExternalLink,
    Crown,
    CheckCircle
} from 'lucide-react'

interface EnterpriseSupportCenterProps {
    locale: string
    userName: string
    userEmail: string
}

interface FAQItem {
    question: string
    answer: string
}

interface FAQCategory {
    id: string
    title: string
    icon: React.ReactNode
    color: string
    questions: FAQItem[]
}

// Comprehensive FAQ Data
const faqCategories: Record<string, FAQCategory[]> = {
    tr: [
        {
            id: 'general',
            title: 'Genel Sorular',
            icon: <HelpCircle className="h-5 w-5" />,
            color: 'blue',
            questions: [
                {
                    question: 'PylonChat nedir?',
                    answer: 'PylonChat, isletmeler icin AI destekli chatbot platformudur. Web sitenize, uygulamaniza veya sosyal medya kanallariniza entegre edebileceginiz akilli chatbotlar olusturmanizi saglar. Chatbotlariniz musteri sorularini 7/24 otomatik olarak yanitlar, musteri memnuniyetini arttirir ve destek maliyetlerinizi azaltir.'
                },
                {
                    question: 'Hangi sektorlere hizmet veriyorsunuz?',
                    answer: 'PylonChat tum sektorlere hizmet vermektedir. E-ticaret, egitim, emlak, saglik, finans, turizm, perakende ve daha fazlasi. Her sektor icin ozellestirilmis chatbot sablonlari sunuyoruz. Ayrica sektorunuze ozel ozellikler de gelistirebiliriz.'
                },
                {
                    question: 'Chatbot kurulumu ne kadar suruyor?',
                    answer: 'Temel bir chatbot 5 dakika icinde kurulabilir. Belge yukleyerek veya web sitesi URL\'si ekleyerek chatbotunuzu hizlica egitebilirsiniz. Daha karmasik entegrasyonlar icin teknik ekibimiz size yardimci olur ve genellikle 1-3 gun icinde tamamlanir.'
                },
                {
                    question: 'Ucretsiz deneme surumu var mi?',
                    answer: 'Evet! Ucretsiz planumizla 1 chatbot olusturabilir ve temel ozellikleri deneyebilirsiniz. Kredi karti gerektirmez. Ucretsiz planda aylik 100 mesaj hakkiniz vardir. Daha fazla ozellik icin Pro veya Business planlarina yukseltebilirsiniz.'
                },
                {
                    question: 'Mobil uygulamam var mi?',
                    answer: 'Evet, hem iOS hem de Android icin mobil uygulamalarimiz mevcuttur. Mobil uygulama uzerinden chatbot konusmalarini takip edebilir, anlik bildirimler alabilir ve gerektiginde canli destege gecebilirsiniz.'
                },
                {
                    question: 'Destek saatleri nedir?',
                    answer: 'Pro plan icin hafta ici 09:00-18:00 arasi e-posta destegi, Business plan icin 7/24 e-posta ve chat destegi, Enterprise plan icin 7/24 telefon, e-posta, chat ve ozel hesap yoneticisi destegi sunuyoruz.'
                }
            ]
        },
        {
            id: 'pricing',
            title: 'Fiyatlandirma & Planlar',
            icon: <CreditCard className="h-5 w-5" />,
            color: 'green',
            questions: [
                {
                    question: 'Fiyatlandirma nasil calisiyor?',
                    answer: '4 plan sunuyoruz:\n\n• Ucretsiz: 1 chatbot, aylik 100 mesaj, temel ozellikler\n• Pro ($29/ay): 5 chatbot, aylik 5.000 mesaj, gelismis analitik\n• Business ($79/ay): 15 chatbot, aylik 25.000 mesaj, API erisimi, oncelikli destek\n• Enterprise (Ozel fiyat): Sinirsiz chatbot ve mesaj, ozel entegrasyonlar, 7/24 destek, SLA garantisi'
                },
                {
                    question: 'Yillik odeme indirimi var mi?',
                    answer: 'Evet! Yillik odeme secenegi ile %20 indirim kazanirsiniz. Ornegin Pro plan aylik $29 yerine yillik odemede aylik $23.20\'ye denk gelir. Yillik planlar ayrica oncelikli destek ve ekstra ozellikler icerir.'
                },
                {
                    question: 'Plan degisikligi nasil yapilir?',
                    answer: 'Dashboard > Faturalama bolumunden istediginiz zaman plan degistirebilirsiniz. Yukseltme aninda gecerli olur. Dusurme ise mevcut fatura doneninizin sonunda gecerli olur. Kullanilmayan krediler iade edilmez ancak sonraki doneme aktarilabilir.'
                },
                {
                    question: 'Mesaj limiti asarsam ne olur?',
                    answer: 'Mesaj limitinizi astiginizda chatbotunuz calismaya devam eder ancak asim ucreti uygulanir. Pro planda asim basina $0.01, Business planda $0.008 ucretlendirilir. Enterprise planlarda asim ucreti yoktur. Limit yaklastiginizda e-posta bildirimi alirsiniz.'
                },
                {
                    question: 'Para iade politikasi nedir?',
                    answer: 'Ilk 14 gun icinde memnun kalmazsiniz tam iade garantisi sunuyoruz. Iade talebinizi support@pylonchat.com adresine gonderebilirsiniz. Yillik planlarda kalan sure icin orantili iade yapilir.'
                },
                {
                    question: 'Kurumsal fiyatlandirma nasil belirleniyor?',
                    answer: 'Enterprise plani isletmenizin ihtiyaclarina gore ozellestiriyoruz. Chatbot sayisi, mesaj hacmi, ozel entegrasyon gereksinimleri, SLA gereksinimleri ve destek duzeyi gibi faktorlere gore fiyatlandirma yapilir. Ucretsiz demo icin bizimle iletisime gecin.'
                }
            ]
        },
        {
            id: 'technical',
            title: 'Teknik & Entegrasyon',
            icon: <Code className="h-5 w-5" />,
            color: 'purple',
            questions: [
                {
                    question: 'Web siteme nasil entegre ederim?',
                    answer: 'Entegrasyon cok basit:\n\n1. Dashboard\'da chatbotunuzu olusturun\n2. Ayarlar > Embed Kodu\'na gidin\n3. Verilen JavaScript kodunu kopyalayin\n4. Web sitenizin </body> etiketinden hemen once yapistirin\n\nChatbot otomatik olarak sitenizde gorunecektir. WordPress, Shopify, Wix, Squarespace gibi platformlar icin ozel eklentilerimiz de mevcuttur.'
                },
                {
                    question: 'Hangi platformlarla entegre olur?',
                    answer: 'PylonChat su platformlarla entegre olur:\n\n• Web siteleri (tum platformlar)\n• WordPress, Shopify, WooCommerce, Magento\n• WhatsApp Business, Facebook Messenger, Instagram\n• Slack, Microsoft Teams, Discord\n• Salesforce, HubSpot, Zendesk\n• Zapier ile 5000+ uygulama\n• REST API ile ozel entegrasyonlar'
                },
                {
                    question: 'API dokumantasyonu nerede?',
                    answer: 'API dokumantasyonuna Dashboard > Gelistirici > API Dokumantasyonu bolumunden ulasabilirsiniz. REST API\'miz ile chatbot olusturma, egitme, mesaj gonderme ve analitik verilere erisim saglanabilir. API anahtarinizi ayni sayfadan olusturabilirsiniz.'
                },
                {
                    question: 'Webhook destegi var mi?',
                    answer: 'Evet! Webhooks ile su olaylari dinleyebilirsiniz:\n\n• Yeni mesaj geldiginde\n• Konusma basladiginda/bittiginde\n• Lead yakalandiginda\n• Chatbot egitimi tamamlandiginda\n\nDashboard > Ayarlar > Webhooks bolumunden yapilandirilabilir.'
                },
                {
                    question: 'Ozel domain kullanabilir miyim?',
                    answer: 'Evet, Business ve Enterprise planlarinda chatbot widget\'iniz icin ozel domain kullanabilirsiniz. Ornegin chat.sirketiniz.com seklinde. DNS ayarlarini yapmaniz ve SSL sertifikasi icin bizimle iletisime gecmeniz yeterlidir.'
                },
                {
                    question: 'Rate limiting var mi?',
                    answer: 'API istekleri icin rate limiting uygulanir:\n\n• Pro: Dakikada 60 istek\n• Business: Dakikada 300 istek\n• Enterprise: Ozel limitler\n\nLimit asimlari 429 hata kodu dondurur. Daha yuksek limitler icin Enterprise plani degerlendirin.'
                },
                {
                    question: 'SDK\'lar mevcut mu?',
                    answer: 'Evet, resmi SDK\'larimiz mevcuttur:\n\n• JavaScript/TypeScript\n• Python\n• PHP\n• Ruby\n• Java\n• .NET\n\nTum SDK\'lar GitHub\'da acik kaynakli olarak yayinlanmistir ve npm, pip, composer vb. paket yoneticileri uzerinden yuklenebilir.'
                }
            ]
        },
        {
            id: 'training',
            title: 'Chatbot Egitimi',
            icon: <Bot className="h-5 w-5" />,
            color: 'amber',
            questions: [
                {
                    question: 'Chatbotumu nasil egitirim?',
                    answer: 'Chatbotunuzu 3 farkli yontemle egitebilirsiniz:\n\n1. Belge Yukleme: PDF, DOCX, TXT, CSV dosyalari yukleyin\n2. Web Sitesi Tarama: URL girin, otomatik icerik cikarilsin\n3. Manuel Giris: Soru-cevap ciftleri ekleyin\n\nAI otomatik olarak icerigimizi analiz eder ve chatbotu egitir. Egitim genellikle birkaç dakika icerisinde tamamlanir.'
                },
                {
                    question: 'Hangi dosya formatlarini destekliyorsunuz?',
                    answer: 'Desteklenen dosya formatlari:\n\n• Belgeler: PDF, DOCX, DOC, TXT, RTF\n• Tablolar: CSV, XLSX, XLS\n• Web: HTML, XML\n• Kod: MD (Markdown)\n\nMaksimum dosya boyutu Pro planda 10MB, Business\'ta 50MB, Enterprise\'da sinirsizdır.'
                },
                {
                    question: 'Web sitemi otomatik tarayabilir mi?',
                    answer: 'Evet! URL girdiginizde chatbot:\n\n• Ana sayfa ve alt sayfalari tarar\n• Metin iceriklerini cikarir\n• SSS, urun bilgileri, blog yazilarini ogrenír\n• Sitemap varsa kullanir\n\nTarama derinligi Pro planda 50 sayfa, Business\'ta 500 sayfa, Enterprise\'da sinirsizdír.'
                },
                {
                    question: 'Egitim verileri guvenli mi?',
                    answer: 'Evet, tuem egitim verileriniz:\n\n• AES-256 ile sifrelenir\n• Avrupa ve ABD\'deki guvenli veri merkezlerinde saklanir\n• GDPR ve KVKK uyumludur\n• Sadece sizin chatbotunuz tarafindan kullanilir\n• Istediginiz zaman silebilirsiniz\n\nVerileriniz hicbir sekilde ucuncu taraflarla paylasilmaz.'
                },
                {
                    question: 'Chatbot cevaplarini nasil iyilestiririm?',
                    answer: 'Chatbot performansini artirmak icin:\n\n1. Analitiklerden yanlis/eksik cevaplari inceleyin\n2. Yeni soru-cevap ciftleri ekleyin\n3. Mevcut icerikleri guncelleyin\n4. Konusma akislarini optimize edin\n5. A/B testleri yapin\n\nAyrica AI onerileri bolumunden iyilestirme onerilerini gorebilirsiniz.'
                },
                {
                    question: 'Coklu dil destegi var mi?',
                    answer: 'Evet! Chatbotunuz 50+ dili destekler:\n\n• Turkce, Ingilizce, Almanca, Fransizca, Ispanyolca\n• Arapca, Cince, Japonca, Korece\n• Rusca, Portekizce, Italyanca\n• Ve daha fazlasi...\n\nChatbot kullanicinin dilini otomatik algilar ve ayni dilde yanit verir. Dil basina ayri egitim de yapabilirsiniz.'
                }
            ]
        },
        {
            id: 'analytics',
            title: 'Analitik & Raporlama',
            icon: <BarChart3 className="h-5 w-5" />,
            color: 'cyan',
            questions: [
                {
                    question: 'Hangi metrikleri takip edebilirim?',
                    answer: 'Dashboard\'da su metrikleri takip edebilirsiniz:\n\n• Toplam konusma sayisi\n• Mesaj sayisi ve ortalama konusma suresi\n• Cozum orani (chatbotun basariyla cevapladigi sorular)\n• Musteri memnuniyet skoru\n• En cok sorulan sorular\n• Yogun saatler ve gunler\n• Lead yakalama orani\n• Canli destege yonlendirme orani'
                },
                {
                    question: 'Raporlari disari aktarabilir miyim?',
                    answer: 'Evet! Raporlari su formatlarda indirebilirsiniz:\n\n• CSV (Excel uyumlu)\n• PDF (detayli rapor)\n• JSON (API entegrasyonu icin)\n\nAyrica zamanlanmis raporlar olusturabilir ve e-posta ile otomatik gonderim ayarlayabilirsiniz (Business ve Enterprise planlarda).'
                },
                {
                    question: 'Gercek zamanli analitik var mi?',
                    answer: 'Evet, Enterprise planda gercek zamanli dashboard mevcuttur:\n\n• Anlik aktif konusma sayisi\n• Canli mesaj akisi\n• Anlik cozum orani\n• Coğrafi dagil\n• Cihaz ve tarayici istatistikleri'
                },
                {
                    question: 'Google Analytics entegrasyonu var mi?',
                    answer: 'Evet! Chatbot etkilesimlerini Google Analytics\'e gonderebilirsiniz:\n\n• Konusma baslatma eventi\n• Mesaj gonderme eventi\n• Lead yakalama eventi\n• Hedef tamamlama takibi\n\nDashboard > Entegrasyonlar > Google Analytics bolumunden yapilandirilabilir.'
                }
            ]
        },
        {
            id: 'security',
            title: 'Guvenlik & Gizlilik',
            icon: <Shield className="h-5 w-5" />,
            color: 'red',
            questions: [
                {
                    question: 'Verilerim guvenli mi?',
                    answer: 'Evet, en yuksek guvenlik standartlarini uyguluyoruz:\n\n• TLS 1.3 ile sifrelenmis baglanti\n• AES-256 ile veri sifreleme\n• SOC 2 Type II sertifikali veri merkezleri\n• Duzenli guvenlik denetimleri\n• 2FA (iki faktorlu dogrulama)\n• IP beyaz listesi (Enterprise)'
                },
                {
                    question: 'GDPR ve KVKK uyumlu mu?',
                    answer: 'Evet, tam uyumluyuz:\n\n• Veri isleme sozlesmesi (DPA) mevcut\n• Kullanici rizasi yonetimi\n• Veri silme talepleri icin arac\n• Veri tasima hakki destegi\n• Avrupa\'da veri depolama secenegi\n• Gizlilik politikasi sablonu'
                },
                {
                    question: 'Verilerim nerede saklanyor?',
                    answer: 'Varsayilan olarak verileriniz:\n\n• Avrupa (Frankfurt, Almanya)\n• ABD (Virginia)\n\nveri merkezlerinde saklanir. Enterprise planlarda ozel bolge secimi yapilabilir. Tum veri merkezleri ISO 27001 sertifikalidir.'
                },
                {
                    question: 'SSO (Single Sign-On) destegi var mi?',
                    answer: 'Evet, Enterprise planda SSO destegi mevcuttur:\n\n• SAML 2.0\n• OAuth 2.0 / OpenID Connect\n• Azure AD, Okta, Google Workspace\n• Ozel IdP entegrasyonu\n\nSSO kurulumu icin teknik ekibimiz size yardimci olur.'
                },
                {
                    question: 'Yedekleme politikasi nedir?',
                    answer: 'Verileriniz duzenli olarak yedeklenir:\n\n• Gunluk otomatik yedekleme\n• 30 gun yedek saklama\n• Farkli cografi konumlarda kopya\n• Istege bagli geri yukleme\n• Enterprise\'da anlik yedekleme'
                }
            ]
        },
        {
            id: 'billing',
            title: 'Faturalama & Odeme',
            icon: <FileText className="h-5 w-5" />,
            color: 'indigo',
            questions: [
                {
                    question: 'Hangi odeme yontemlerini kabul ediyorsunuz?',
                    answer: 'Su odeme yontemlerini kabul ediyoruz:\n\n• Kredi/Banka karti (Visa, Mastercard, Amex)\n• PayPal\n• Banka havalesi (Enterprise)\n• Fatura ile odeme (Enterprise, yillik)\n\nTum odemeler Stripe uzerinden guvenli sekilde islenir.'
                },
                {
                    question: 'Faturami nereden gorebilirim?',
                    answer: 'Dashboard > Faturalama > Fatura Gecmisi bolumunden tum faturalarinizi gorebilir ve PDF olarak indirebilirsiniz. Ayrica her fatura e-posta adresinize otomatik gonderilir.'
                },
                {
                    question: 'Fatura bilgilerimi nasil guncellerim?',
                    answer: 'Dashboard > Faturalama > Fatura Bilgileri bolumunden:\n\n• Sirket adi\n• Vergi numarasi\n• Fatura adresi\n• E-posta adresi\n\nbilgilerini guncelleyebilirsiniz. Degisiklikler bir sonraki faturadan itibaren gecerli olur.'
                },
                {
                    question: 'Aboneligimi nasil iptal ederim?',
                    answer: 'Dashboard > Faturalama > Abonelik Yonetimi bolumunden aboneliginizi iptal edebilirsiniz. Iptal:\n\n• Mevcut fatura donemi sonuna kadar gecerlidir\n• Verileriniz 30 gun saklanir\n• Istediginiz zaman yeniden aktif edebilirsiniz\n\n14 gun icinde iptal ederseniz tam iade alirsiniz.'
                }
            ]
        }
    ],
    en: [
        {
            id: 'general',
            title: 'General Questions',
            icon: <HelpCircle className="h-5 w-5" />,
            color: 'blue',
            questions: [
                {
                    question: 'What is PylonChat?',
                    answer: 'PylonChat is an AI-powered chatbot platform for businesses. It allows you to create intelligent chatbots that can be integrated into your website, app, or social media channels. Your chatbots automatically answer customer questions 24/7, increase customer satisfaction, and reduce support costs.'
                },
                {
                    question: 'Which industries do you serve?',
                    answer: 'PylonChat serves all industries including e-commerce, education, real estate, healthcare, finance, tourism, retail, and more. We offer customized chatbot templates for each industry and can develop industry-specific features.'
                },
                {
                    question: 'How long does chatbot setup take?',
                    answer: 'A basic chatbot can be set up in 5 minutes. You can quickly train your chatbot by uploading documents or adding website URLs. For more complex integrations, our technical team assists you and typically completes within 1-3 days.'
                },
                {
                    question: 'Is there a free trial?',
                    answer: 'Yes! With our free plan, you can create 1 chatbot and try basic features. No credit card required. The free plan includes 100 messages per month. Upgrade to Pro or Business plans for more features.'
                },
                {
                    question: 'Do you have a mobile app?',
                    answer: 'Yes, we have mobile apps for both iOS and Android. You can track chatbot conversations, receive instant notifications, and switch to live support when needed through the mobile app.'
                },
                {
                    question: 'What are the support hours?',
                    answer: 'Pro plan: Email support weekdays 9AM-6PM. Business plan: 24/7 email and chat support. Enterprise plan: 24/7 phone, email, chat, and dedicated account manager support.'
                }
            ]
        },
        {
            id: 'pricing',
            title: 'Pricing & Plans',
            icon: <CreditCard className="h-5 w-5" />,
            color: 'green',
            questions: [
                {
                    question: 'How does pricing work?',
                    answer: 'We offer 4 plans:\n\n• Free: 1 chatbot, 100 messages/month, basic features\n• Pro ($29/mo): 5 chatbots, 5,000 messages/month, advanced analytics\n• Business ($79/mo): 15 chatbots, 25,000 messages/month, API access, priority support\n• Enterprise (Custom): Unlimited chatbots and messages, custom integrations, 24/7 support, SLA guarantee'
                },
                {
                    question: 'Is there an annual payment discount?',
                    answer: 'Yes! You get 20% off with annual payment. For example, Pro plan becomes $23.20/month instead of $29/month. Annual plans also include priority support and extra features.'
                },
                {
                    question: 'How do I change my plan?',
                    answer: 'You can change your plan anytime from Dashboard > Billing. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period. Unused credits are not refunded but can be carried over.'
                },
                {
                    question: 'What happens if I exceed the message limit?',
                    answer: 'If you exceed your message limit, your chatbot continues to work but overage fees apply. Pro plan: $0.01 per overage, Business: $0.008. Enterprise plans have no overage fees. You receive email notifications when approaching the limit.'
                },
                {
                    question: 'What is the refund policy?',
                    answer: 'We offer a full refund guarantee within the first 14 days if not satisfied. Send your refund request to support@pylonchat.com. Annual plans receive prorated refunds for remaining time.'
                },
                {
                    question: 'How is enterprise pricing determined?',
                    answer: 'Enterprise plan is customized based on your business needs. Pricing depends on chatbot count, message volume, custom integration requirements, SLA requirements, and support level. Contact us for a free demo.'
                }
            ]
        },
        {
            id: 'technical',
            title: 'Technical & Integration',
            icon: <Code className="h-5 w-5" />,
            color: 'purple',
            questions: [
                {
                    question: 'How do I integrate with my website?',
                    answer: 'Integration is very simple:\n\n1. Create your chatbot in Dashboard\n2. Go to Settings > Embed Code\n3. Copy the JavaScript code provided\n4. Paste it just before the </body> tag on your website\n\nThe chatbot will automatically appear on your site. We also have dedicated plugins for WordPress, Shopify, Wix, Squarespace, and more.'
                },
                {
                    question: 'Which platforms do you integrate with?',
                    answer: 'PylonChat integrates with:\n\n• All websites\n• WordPress, Shopify, WooCommerce, Magento\n• WhatsApp Business, Facebook Messenger, Instagram\n• Slack, Microsoft Teams, Discord\n• Salesforce, HubSpot, Zendesk\n• 5000+ apps via Zapier\n• Custom integrations via REST API'
                },
                {
                    question: 'Where is the API documentation?',
                    answer: 'API documentation is available at Dashboard > Developer > API Documentation. Our REST API allows chatbot creation, training, messaging, and analytics access. You can generate your API key from the same page.'
                },
                {
                    question: 'Is webhook support available?',
                    answer: 'Yes! With Webhooks you can listen to:\n\n• New message received\n• Conversation started/ended\n• Lead captured\n• Chatbot training completed\n\nConfigure in Dashboard > Settings > Webhooks.'
                },
                {
                    question: 'Can I use a custom domain?',
                    answer: 'Yes, Business and Enterprise plans can use a custom domain for chatbot widgets. For example, chat.yourcompany.com. Simply configure DNS settings and contact us for SSL certificate.'
                },
                {
                    question: 'Is there rate limiting?',
                    answer: 'Rate limiting applies to API requests:\n\n• Pro: 60 requests/minute\n• Business: 300 requests/minute\n• Enterprise: Custom limits\n\nLimit overages return 429 error code. Consider Enterprise plan for higher limits.'
                },
                {
                    question: 'Are SDKs available?',
                    answer: 'Yes, we have official SDKs:\n\n• JavaScript/TypeScript\n• Python\n• PHP\n• Ruby\n• Java\n• .NET\n\nAll SDKs are open source on GitHub and installable via npm, pip, composer, etc.'
                }
            ]
        },
        {
            id: 'training',
            title: 'Chatbot Training',
            icon: <Bot className="h-5 w-5" />,
            color: 'amber',
            questions: [
                {
                    question: 'How do I train my chatbot?',
                    answer: 'You can train your chatbot using 3 methods:\n\n1. Document Upload: Upload PDF, DOCX, TXT, CSV files\n2. Website Crawling: Enter URL for automatic content extraction\n3. Manual Entry: Add Q&A pairs directly\n\nAI automatically analyzes your content and trains the chatbot. Training typically completes within minutes.'
                },
                {
                    question: 'Which file formats do you support?',
                    answer: 'Supported file formats:\n\n• Documents: PDF, DOCX, DOC, TXT, RTF\n• Spreadsheets: CSV, XLSX, XLS\n• Web: HTML, XML\n• Code: MD (Markdown)\n\nMax file size: Pro 10MB, Business 50MB, Enterprise unlimited.'
                },
                {
                    question: 'Can it automatically crawl my website?',
                    answer: 'Yes! When you enter a URL, the chatbot:\n\n• Crawls main page and subpages\n• Extracts text content\n• Learns FAQs, product info, blog posts\n• Uses sitemap if available\n\nCrawl depth: Pro 50 pages, Business 500 pages, Enterprise unlimited.'
                },
                {
                    question: 'Is my training data secure?',
                    answer: 'Yes, all training data:\n\n• Encrypted with AES-256\n• Stored in secure EU and US data centers\n• GDPR and CCPA compliant\n• Used only by your chatbot\n• Deletable anytime\n\nYour data is never shared with third parties.'
                },
                {
                    question: 'How do I improve chatbot responses?',
                    answer: 'To improve chatbot performance:\n\n1. Review incorrect/missing answers in analytics\n2. Add new Q&A pairs\n3. Update existing content\n4. Optimize conversation flows\n5. Run A/B tests\n\nYou can also see improvement suggestions in the AI Recommendations section.'
                },
                {
                    question: 'Is multi-language support available?',
                    answer: 'Yes! Your chatbot supports 50+ languages:\n\n• English, Turkish, German, French, Spanish\n• Arabic, Chinese, Japanese, Korean\n• Russian, Portuguese, Italian\n• And more...\n\nThe chatbot auto-detects user language and responds accordingly. You can also train separately per language.'
                }
            ]
        },
        {
            id: 'analytics',
            title: 'Analytics & Reporting',
            icon: <BarChart3 className="h-5 w-5" />,
            color: 'cyan',
            questions: [
                {
                    question: 'What metrics can I track?',
                    answer: 'You can track these metrics in Dashboard:\n\n• Total conversation count\n• Message count and average conversation duration\n• Resolution rate (questions successfully answered)\n• Customer satisfaction score\n• Most asked questions\n• Peak hours and days\n• Lead capture rate\n• Live support escalation rate'
                },
                {
                    question: 'Can I export reports?',
                    answer: 'Yes! You can download reports in:\n\n• CSV (Excel compatible)\n• PDF (detailed report)\n• JSON (for API integration)\n\nYou can also create scheduled reports and set up automatic email delivery (Business and Enterprise plans).'
                },
                {
                    question: 'Is real-time analytics available?',
                    answer: 'Yes, Enterprise plan includes real-time dashboard:\n\n• Current active conversations\n• Live message stream\n• Instant resolution rate\n• Geographic distribution\n• Device and browser statistics'
                },
                {
                    question: 'Is there Google Analytics integration?',
                    answer: 'Yes! You can send chatbot interactions to Google Analytics:\n\n• Conversation start event\n• Message send event\n• Lead capture event\n• Goal completion tracking\n\nConfigure in Dashboard > Integrations > Google Analytics.'
                }
            ]
        },
        {
            id: 'security',
            title: 'Security & Privacy',
            icon: <Shield className="h-5 w-5" />,
            color: 'red',
            questions: [
                {
                    question: 'Is my data secure?',
                    answer: 'Yes, we implement the highest security standards:\n\n• TLS 1.3 encrypted connection\n• AES-256 data encryption\n• SOC 2 Type II certified data centers\n• Regular security audits\n• 2FA (two-factor authentication)\n• IP whitelist (Enterprise)'
                },
                {
                    question: 'Is it GDPR and CCPA compliant?',
                    answer: 'Yes, we are fully compliant:\n\n• Data Processing Agreement (DPA) available\n• User consent management\n• Data deletion request tool\n• Data portability support\n• Europe data storage option\n• Privacy policy template'
                },
                {
                    question: 'Where is my data stored?',
                    answer: 'By default, your data is stored in:\n\n• Europe (Frankfurt, Germany)\n• USA (Virginia)\n\ndata centers. Enterprise plans can select custom regions. All data centers are ISO 27001 certified.'
                },
                {
                    question: 'Is SSO (Single Sign-On) supported?',
                    answer: 'Yes, Enterprise plan includes SSO support:\n\n• SAML 2.0\n• OAuth 2.0 / OpenID Connect\n• Azure AD, Okta, Google Workspace\n• Custom IdP integration\n\nOur technical team assists with SSO setup.'
                },
                {
                    question: 'What is the backup policy?',
                    answer: 'Your data is regularly backed up:\n\n• Daily automatic backup\n• 30-day backup retention\n• Copies in different geographic locations\n• On-demand restoration\n• Enterprise: Real-time backup'
                }
            ]
        },
        {
            id: 'billing',
            title: 'Billing & Payment',
            icon: <FileText className="h-5 w-5" />,
            color: 'indigo',
            questions: [
                {
                    question: 'Which payment methods do you accept?',
                    answer: 'We accept:\n\n• Credit/Debit cards (Visa, Mastercard, Amex)\n• PayPal\n• Bank transfer (Enterprise)\n• Invoice payment (Enterprise, annual)\n\nAll payments are securely processed through Stripe.'
                },
                {
                    question: 'Where can I view my invoices?',
                    answer: 'You can view and download all invoices as PDF from Dashboard > Billing > Invoice History. Each invoice is also automatically sent to your email address.'
                },
                {
                    question: 'How do I update billing information?',
                    answer: 'From Dashboard > Billing > Billing Information, you can update:\n\n• Company name\n• Tax ID\n• Billing address\n• Email address\n\nChanges take effect from the next invoice.'
                },
                {
                    question: 'How do I cancel my subscription?',
                    answer: 'You can cancel your subscription from Dashboard > Billing > Subscription Management. Cancellation:\n\n• Is valid until end of current billing period\n• Your data is kept for 30 days\n• You can reactivate anytime\n\nCancel within 14 days for full refund.'
                }
            ]
        }
    ]
}

// Add other languages with same structure (de, es, fr) - abbreviated for length
const getCategories = (locale: string): FAQCategory[] => {
    return faqCategories[locale] || faqCategories.en
}

const translations: Record<string, Record<string, string>> = {
    tr: {
        title: 'Destek Merkezi',
        subtitle: 'Size nasil yardimci olabiliriz?',
        searchPlaceholder: 'Soru ara...',
        categories: 'Kategoriler',
        popularQuestions: 'Populer Sorular',
        noResults: 'Sonuc bulunamadi',
        needMoreHelp: 'Daha fazla yardima mi ihtiyaciniz var?',
        technicalSupport: 'Teknik Destek Ekibi',
        technicalSupportDesc: 'Teknik sorunlar ve entegrasyon yardimi icin',
        customerService: 'Musteri Hizmetleri',
        customerServiceDesc: 'Genel sorular, faturalama ve hesap yardimi',
        availableNow: '7/24 Musait',
        connectWhatsApp: 'WhatsApp ile Baglan',
        responseTime: '1 saat icinde yanit'
    },
    en: {
        title: 'Support Center',
        subtitle: 'How can we help you?',
        searchPlaceholder: 'Search questions...',
        categories: 'Categories',
        popularQuestions: 'Popular Questions',
        noResults: 'No results found',
        needMoreHelp: 'Need more help?',
        technicalSupport: 'Technical Support Team',
        technicalSupportDesc: 'For technical issues and integration help',
        customerService: 'Customer Service',
        customerServiceDesc: 'General questions, billing, and account help',
        availableNow: 'Available 24/7',
        connectWhatsApp: 'Connect via WhatsApp',
        responseTime: 'Response within 1 hour'
    },
    de: {
        title: 'Support-Center',
        subtitle: 'Wie konnen wir Ihnen helfen?',
        searchPlaceholder: 'Fragen suchen...',
        categories: 'Kategorien',
        popularQuestions: 'Beliebte Fragen',
        noResults: 'Keine Ergebnisse gefunden',
        needMoreHelp: 'Brauchen Sie mehr Hilfe?',
        technicalSupport: 'Technisches Support-Team',
        technicalSupportDesc: 'Fur technische Probleme und Integrationshilfe',
        customerService: 'Kundendienst',
        customerServiceDesc: 'Allgemeine Fragen, Abrechnung und Kontohilfe',
        availableNow: '24/7 Verfugbar',
        connectWhatsApp: 'Uber WhatsApp verbinden',
        responseTime: 'Antwort innerhalb 1 Stunde'
    },
    es: {
        title: 'Centro de Soporte',
        subtitle: 'Como podemos ayudarte?',
        searchPlaceholder: 'Buscar preguntas...',
        categories: 'Categorias',
        popularQuestions: 'Preguntas Populares',
        noResults: 'No se encontraron resultados',
        needMoreHelp: 'Necesitas mas ayuda?',
        technicalSupport: 'Equipo de Soporte Tecnico',
        technicalSupportDesc: 'Para problemas tecnicos y ayuda de integracion',
        customerService: 'Servicio al Cliente',
        customerServiceDesc: 'Preguntas generales, facturacion y ayuda de cuenta',
        availableNow: 'Disponible 24/7',
        connectWhatsApp: 'Conectar via WhatsApp',
        responseTime: 'Respuesta en 1 hora'
    },
    fr: {
        title: 'Centre de Support',
        subtitle: 'Comment pouvons-nous vous aider?',
        searchPlaceholder: 'Rechercher des questions...',
        categories: 'Categories',
        popularQuestions: 'Questions Populaires',
        noResults: 'Aucun resultat trouve',
        needMoreHelp: 'Besoin de plus d\'aide?',
        technicalSupport: 'Equipe Support Technique',
        technicalSupportDesc: 'Pour les problemes techniques et l\'aide a l\'integration',
        customerService: 'Service Client',
        customerServiceDesc: 'Questions generales, facturation et aide au compte',
        availableNow: 'Disponible 24/7',
        connectWhatsApp: 'Connecter via WhatsApp',
        responseTime: 'Reponse dans 1 heure'
    }
}

const WHATSAPP_NUMBER = '61432672696'

const colorClasses: Record<string, { bg: string, text: string, border: string, light: string }> = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
    green: { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200', light: 'bg-green-50' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200', light: 'bg-cyan-50' },
    red: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200', light: 'bg-red-50' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50' }
}

export function EnterpriseSupportCenter({
    locale,
    userName,
    userEmail
}: EnterpriseSupportCenterProps) {
    const t = translations[locale] || translations.en
    const categories = getCategories(locale)

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

    const toggleQuestion = (categoryId: string, questionIndex: number) => {
        const key = `${categoryId}-${questionIndex}`
        const newExpanded = new Set(expandedQuestions)
        if (newExpanded.has(key)) {
            newExpanded.delete(key)
        } else {
            newExpanded.add(key)
        }
        setExpandedQuestions(newExpanded)
    }

    const openWhatsApp = (type: 'technical' | 'customer') => {
        const messageType = type === 'technical' ? 'Technical Support' : 'Customer Service'
        const message = `Hello! I need ${messageType} assistance.\n\nName: ${userName}\nEmail: ${userEmail}`
        const encodedMessage = encodeURIComponent(message)
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer')
    }

    // Filter questions based on search
    const filteredCategories = categories.map(category => ({
        ...category,
        questions: category.questions.filter(q =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => searchQuery === '' || category.questions.length > 0)

    const displayCategories = selectedCategory
        ? filteredCategories.filter(c => c.id === selectedCategory)
        : filteredCategories

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-lg border-2 focus:border-blue-500"
                />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === null
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {t.categories}
                </button>
                {categories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                            selectedCategory === category.id
                                ? `${colorClasses[category.color].bg} text-white`
                                : `${colorClasses[category.color].light} ${colorClasses[category.color].text} hover:opacity-80`
                        }`}
                    >
                        {category.icon}
                        {category.title}
                    </button>
                ))}
            </div>

            {/* FAQ Categories */}
            <div className="space-y-4">
                {displayCategories.map(category => (
                    <Card key={category.id} className={`overflow-hidden border-2 ${colorClasses[category.color].border}`}>
                        <div className={`px-6 py-4 ${colorClasses[category.color].light} border-b ${colorClasses[category.color].border}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${colorClasses[category.color].bg} rounded-lg flex items-center justify-center text-white`}>
                                    {category.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{category.title}</h3>
                                    <p className="text-sm text-gray-500">{category.questions.length} soru</p>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {category.questions.map((faq, index) => {
                                    const isExpanded = expandedQuestions.has(`${category.id}-${index}`)
                                    return (
                                        <div key={index} className="group">
                                            <button
                                                onClick={() => toggleQuestion(category.id, index)}
                                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                                                <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isExpanded && (
                                                <div className="px-6 pb-4">
                                                    <div className="bg-gray-50 rounded-lg p-4 text-gray-600 whitespace-pre-line">
                                                        {faq.answer}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* No Results */}
            {displayCategories.length === 0 && (
                <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t.noResults}</p>
                </div>
            )}

            {/* Contact Support Section */}
            <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Headphones className="h-6 w-6 text-green-600" />
                    {t.needMoreHelp}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Technical Support */}
                    <Card
                        className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple-400 group"
                        onClick={() => openWhatsApp('technical')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                                    <Settings className="h-7 w-7 text-purple-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 group-hover:text-purple-600 flex items-center gap-2">
                                        {t.technicalSupport}
                                        <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">{t.technicalSupportDesc}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            {t.availableNow}
                                        </span>
                                        <span className="text-xs text-gray-400">{t.responseTime}</span>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                {t.connectWhatsApp}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Customer Service */}
                    <Card
                        className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-400 group"
                        onClick={() => openWhatsApp('customer')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-500 transition-colors">
                                    <Users className="h-7 w-7 text-green-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 group-hover:text-green-600 flex items-center gap-2">
                                        {t.customerService}
                                        <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">{t.customerServiceDesc}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            {t.availableNow}
                                        </span>
                                        <span className="text-xs text-gray-400">{t.responseTime}</span>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                {t.connectWhatsApp}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
