'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    MessageCircle,
    Phone,
    Send,
    Bot,
    User,
    HelpCircle,
    Crown,
    ExternalLink,
    ChevronRight,
    Headphones
} from 'lucide-react'

interface WhatsAppChatWidgetProps {
    locale: string
    userName: string
    userEmail: string
    companyName?: string
    phoneNumber?: string
}

interface Message {
    id: string
    content: string
    sender: 'user' | 'bot'
    timestamp: Date
    options?: FAQOption[]
}

interface FAQOption {
    id: string
    question: string
    answer: string
}

// FAQ Data per language
const faqData: Record<string, FAQOption[]> = {
    en: [
        {
            id: 'pricing',
            question: 'How does pricing work?',
            answer: 'We offer 4 plans: Free (1 chatbot), Pro ($29/mo - 5 chatbots), Business ($79/mo - 15 chatbots), and Enterprise (custom pricing - unlimited). All paid plans include priority support.'
        },
        {
            id: 'integration',
            question: 'How do I integrate the chatbot?',
            answer: 'Integration is simple! After creating your chatbot, go to Settings > Embed Code. Copy the script and paste it into your website\'s HTML before the closing </body> tag. The chatbot will appear automatically.'
        },
        {
            id: 'training',
            question: 'How do I train my chatbot?',
            answer: 'You can train your chatbot by uploading documents (PDF, DOC, TXT), adding website URLs for crawling, or manually entering Q&A pairs. The AI learns from your content automatically.'
        },
        {
            id: 'languages',
            question: 'What languages are supported?',
            answer: 'PylonChat supports 50+ languages including English, Turkish, German, French, Spanish, Arabic, Chinese, Japanese, and more. The chatbot automatically detects and responds in the user\'s language.'
        },
        {
            id: 'analytics',
            question: 'Can I see conversation analytics?',
            answer: 'Yes! The Analytics dashboard shows total conversations, response rates, popular questions, user satisfaction scores, and conversation trends over time.'
        },
        {
            id: 'api',
            question: 'Is there an API available?',
            answer: 'Yes, Pro and higher plans include API access. You can integrate PylonChat into your own applications using our REST API. Documentation is available in your dashboard.'
        }
    ],
    tr: [
        {
            id: 'pricing',
            question: 'Fiyatlandirma nasil calisiyor?',
            answer: '4 plan sunuyoruz: Ucretsiz (1 chatbot), Pro (aylik $29 - 5 chatbot), Business (aylik $79 - 15 chatbot) ve Enterprise (ozel fiyat - sinirsiz). Tum ucretli planlar oncelikli destek icerir.'
        },
        {
            id: 'integration',
            question: 'Chatbot\'u nasil entegre ederim?',
            answer: 'Entegrasyon cok basit! Chatbot\'unuzu olusturduktan sonra Ayarlar > Embed Kodu\'na gidin. Script\'i kopyalayip web sitenizin HTML\'inde </body> etiketinden once yapistirin. Chatbot otomatik gorunecektir.'
        },
        {
            id: 'training',
            question: 'Chatbot\'umu nasil egitirim?',
            answer: 'Chatbot\'unuzu belgeler yukleyerek (PDF, DOC, TXT), tarama icin web sitesi URL\'leri ekleyerek veya manuel olarak soru-cevap cifti girerek egitebilirsiniz. AI icerigimizden otomatik ogrenir.'
        },
        {
            id: 'languages',
            question: 'Hangi diller destekleniyor?',
            answer: 'PylonChat Turkce, Ingilizce, Almanca, Fransizca, Ispanyolca, Arapca, Cince, Japonca ve daha fazlasi dahil 50\'den fazla dili destekler. Chatbot kullanicinin dilini otomatik algilar ve yanit verir.'
        },
        {
            id: 'analytics',
            question: 'Konusma analizlerini gorebilir miyim?',
            answer: 'Evet! Analitik paneli toplam konusmalari, yanit oranlarini, populer sorulari, kullanici memnuniyet puanlarini ve zaman icindeki konusma trendlerini gosterir.'
        },
        {
            id: 'api',
            question: 'API mevcut mu?',
            answer: 'Evet, Pro ve ustu planlar API erisimi icerir. REST API\'mizi kullanarak PylonChat\'i kendi uygulamalariniza entegre edebilirsiniz. Dokumantasyon panelinizde mevcuttur.'
        }
    ],
    de: [
        {
            id: 'pricing',
            question: 'Wie funktioniert die Preisgestaltung?',
            answer: 'Wir bieten 4 Plane: Kostenlos (1 Chatbot), Pro (29$/Monat - 5 Chatbots), Business (79$/Monat - 15 Chatbots) und Enterprise (individuelle Preise - unbegrenzt). Alle kostenpflichtigen Plane beinhalten Priority-Support.'
        },
        {
            id: 'integration',
            question: 'Wie integriere ich den Chatbot?',
            answer: 'Die Integration ist einfach! Nach dem Erstellen Ihres Chatbots gehen Sie zu Einstellungen > Embed-Code. Kopieren Sie das Skript und fugen Sie es vor dem schliessenden </body>-Tag in Ihre Website ein.'
        },
        {
            id: 'training',
            question: 'Wie trainiere ich meinen Chatbot?',
            answer: 'Sie konnen Ihren Chatbot trainieren, indem Sie Dokumente hochladen (PDF, DOC, TXT), Website-URLs zum Crawlen hinzufugen oder manuell Frage-Antwort-Paare eingeben.'
        },
        {
            id: 'languages',
            question: 'Welche Sprachen werden unterstutzt?',
            answer: 'PylonChat unterstutzt uber 50 Sprachen, darunter Deutsch, Englisch, Turkisch, Franzosisch, Spanisch und mehr. Der Chatbot erkennt automatisch die Sprache des Benutzers.'
        },
        {
            id: 'analytics',
            question: 'Kann ich Gesprchsanalysen sehen?',
            answer: 'Ja! Das Analytics-Dashboard zeigt Gesamtgesprache, Antwortraten, beliebte Fragen, Benutzerzufriedenheit und Gesprachstrends uber Zeit.'
        },
        {
            id: 'api',
            question: 'Gibt es eine API?',
            answer: 'Ja, Pro und hohere Plane beinhalten API-Zugang. Sie konnen PylonChat uber unsere REST-API in Ihre eigenen Anwendungen integrieren.'
        }
    ],
    es: [
        {
            id: 'pricing',
            question: 'Como funciona el precio?',
            answer: 'Ofrecemos 4 planes: Gratis (1 chatbot), Pro ($29/mes - 5 chatbots), Business ($79/mes - 15 chatbots) y Enterprise (precio personalizado - ilimitado). Todos los planes de pago incluyen soporte prioritario.'
        },
        {
            id: 'integration',
            question: 'Como integro el chatbot?',
            answer: 'La integracion es simple! Despues de crear tu chatbot, ve a Configuracion > Codigo Embed. Copia el script y pegalo en el HTML de tu sitio web antes de la etiqueta </body>.'
        },
        {
            id: 'training',
            question: 'Como entreno mi chatbot?',
            answer: 'Puedes entrenar tu chatbot subiendo documentos (PDF, DOC, TXT), agregando URLs de sitios web para rastrear, o ingresando manualmente pares de preguntas y respuestas.'
        },
        {
            id: 'languages',
            question: 'Que idiomas son compatibles?',
            answer: 'PylonChat soporta mas de 50 idiomas incluyendo Espanol, Ingles, Aleman, Frances, Turco y mas. El chatbot detecta automaticamente el idioma del usuario.'
        },
        {
            id: 'analytics',
            question: 'Puedo ver analiticas de conversaciones?',
            answer: 'Si! El panel de Analytics muestra conversaciones totales, tasas de respuesta, preguntas populares, puntuaciones de satisfaccion y tendencias de conversacion.'
        },
        {
            id: 'api',
            question: 'Hay una API disponible?',
            answer: 'Si, los planes Pro y superiores incluyen acceso a la API. Puedes integrar PylonChat en tus propias aplicaciones usando nuestra API REST.'
        }
    ],
    fr: [
        {
            id: 'pricing',
            question: 'Comment fonctionne la tarification?',
            answer: 'Nous proposons 4 forfaits: Gratuit (1 chatbot), Pro (29$/mois - 5 chatbots), Business (79$/mois - 15 chatbots) et Enterprise (tarification personnalisee - illimite). Tous les forfaits payants incluent un support prioritaire.'
        },
        {
            id: 'integration',
            question: 'Comment integrer le chatbot?',
            answer: 'L\'integration est simple! Apres avoir cree votre chatbot, allez dans Parametres > Code Embed. Copiez le script et collez-le dans le HTML de votre site avant la balise </body>.'
        },
        {
            id: 'training',
            question: 'Comment entrainer mon chatbot?',
            answer: 'Vous pouvez entrainer votre chatbot en telechargeant des documents (PDF, DOC, TXT), en ajoutant des URLs de sites web, ou en entrant manuellement des paires question-reponse.'
        },
        {
            id: 'languages',
            question: 'Quelles langues sont supportees?',
            answer: 'PylonChat supporte plus de 50 langues dont le Francais, l\'Anglais, l\'Allemand, l\'Espagnol, le Turc et plus. Le chatbot detecte automatiquement la langue de l\'utilisateur.'
        },
        {
            id: 'analytics',
            question: 'Puis-je voir les analyses de conversations?',
            answer: 'Oui! Le tableau de bord Analytics affiche les conversations totales, les taux de reponse, les questions populaires, les scores de satisfaction et les tendances.'
        },
        {
            id: 'api',
            question: 'Y a-t-il une API disponible?',
            answer: 'Oui, les forfaits Pro et superieurs incluent l\'acces API. Vous pouvez integrer PylonChat dans vos propres applications via notre API REST.'
        }
    ]
}

// Keywords that trigger WhatsApp redirect
const supportKeywords: Record<string, string[]> = {
    en: ['technical support', 'customer service', 'speak to human', 'real person', 'live agent', 'help me', 'urgent', 'emergency', 'call me', 'contact support', 'talk to someone'],
    tr: ['teknik destek', 'musteri hizmetleri', 'gercek kisi', 'canli destek', 'yardim edin', 'acil', 'beni arayin', 'destek', 'insan ile gorusmek', 'temsilci'],
    de: ['technischer support', 'kundendienst', 'echter mensch', 'live agent', 'hilfe', 'dringend', 'notfall', 'rufen sie mich an', 'support kontaktieren'],
    es: ['soporte tecnico', 'servicio al cliente', 'persona real', 'agente en vivo', 'ayuda', 'urgente', 'emergencia', 'llamame', 'contactar soporte'],
    fr: ['support technique', 'service client', 'personne reelle', 'agent en direct', 'aide', 'urgent', 'urgence', 'appelez-moi', 'contacter support']
}

// Translations
const translations: Record<string, Record<string, string>> = {
    en: {
        title: '24/7 Enterprise Support',
        subtitle: 'How can we help you today?',
        available: 'Online',
        welcomeMessage: 'Hello! I\'m PylonChat Support Assistant. I can help you with common questions. Select a topic below or type your question.',
        faqTitle: 'Frequently Asked Questions',
        inputPlaceholder: 'Type your message...',
        sendButton: 'Send',
        liveSupport: 'Connect to Live Support',
        liveSupportDesc: 'Chat with our team on WhatsApp',
        redirectingMessage: 'I understand you need personalized assistance. Let me connect you with our support team on WhatsApp for immediate help.',
        notFoundMessage: 'I couldn\'t find an exact answer to your question. Would you like to connect with our live support team?',
        connectWhatsApp: 'Connect via WhatsApp',
        askAnother: 'Ask another question',
        helpfulTitle: 'Was this helpful?',
        yes: 'Yes',
        no: 'No, connect me to support'
    },
    tr: {
        title: '7/24 Enterprise Destek',
        subtitle: 'Bugun size nasil yardimci olabiliriz?',
        available: 'Cevrimici',
        welcomeMessage: 'Merhaba! Ben PylonChat Destek Asistaniyim. Sik sorulan sorularda size yardimci olabilirim. Asagidan bir konu secin veya sorunuzu yazin.',
        faqTitle: 'Sik Sorulan Sorular',
        inputPlaceholder: 'Mesajinizi yazin...',
        sendButton: 'Gonder',
        liveSupport: 'Canli Destege Baglan',
        liveSupportDesc: 'WhatsApp uzerinden ekibimizle sohbet edin',
        redirectingMessage: 'Kisisel yardima ihtiyaciniz oldugunu anliyorum. Hemen yardim icin sizi WhatsApp uzerinden destek ekibimize baglayayim.',
        notFoundMessage: 'Sorunuza tam bir cevap bulamadim. Canli destek ekibimize baglanmak ister misiniz?',
        connectWhatsApp: 'WhatsApp ile Baglan',
        askAnother: 'Baska bir soru sor',
        helpfulTitle: 'Bu yardimci oldu mu?',
        yes: 'Evet',
        no: 'Hayir, destege bagla'
    },
    de: {
        title: '24/7 Enterprise Support',
        subtitle: 'Wie konnen wir Ihnen heute helfen?',
        available: 'Online',
        welcomeMessage: 'Hallo! Ich bin der PylonChat Support-Assistent. Ich kann Ihnen bei haufigen Fragen helfen. Wahlen Sie unten ein Thema oder geben Sie Ihre Frage ein.',
        faqTitle: 'Haufig gestellte Fragen',
        inputPlaceholder: 'Nachricht eingeben...',
        sendButton: 'Senden',
        liveSupport: 'Mit Live-Support verbinden',
        liveSupportDesc: 'Chatten Sie mit unserem Team auf WhatsApp',
        redirectingMessage: 'Ich verstehe, dass Sie personliche Hilfe benotigen. Lassen Sie mich Sie mit unserem Support-Team auf WhatsApp verbinden.',
        notFoundMessage: 'Ich konnte keine genaue Antwort auf Ihre Frage finden. Mochten Sie sich mit unserem Live-Support verbinden?',
        connectWhatsApp: 'Uber WhatsApp verbinden',
        askAnother: 'Andere Frage stellen',
        helpfulTitle: 'War das hilfreich?',
        yes: 'Ja',
        no: 'Nein, mit Support verbinden'
    },
    es: {
        title: 'Soporte Enterprise 24/7',
        subtitle: 'Como podemos ayudarte hoy?',
        available: 'En linea',
        welcomeMessage: 'Hola! Soy el Asistente de Soporte de PylonChat. Puedo ayudarte con preguntas comunes. Selecciona un tema abajo o escribe tu pregunta.',
        faqTitle: 'Preguntas Frecuentes',
        inputPlaceholder: 'Escribe tu mensaje...',
        sendButton: 'Enviar',
        liveSupport: 'Conectar con Soporte en Vivo',
        liveSupportDesc: 'Chatea con nuestro equipo en WhatsApp',
        redirectingMessage: 'Entiendo que necesitas asistencia personalizada. Dejame conectarte con nuestro equipo de soporte en WhatsApp.',
        notFoundMessage: 'No pude encontrar una respuesta exacta a tu pregunta. Te gustaria conectar con nuestro equipo de soporte en vivo?',
        connectWhatsApp: 'Conectar via WhatsApp',
        askAnother: 'Hacer otra pregunta',
        helpfulTitle: 'Fue esto util?',
        yes: 'Si',
        no: 'No, conectame con soporte'
    },
    fr: {
        title: 'Support Enterprise 24/7',
        subtitle: 'Comment pouvons-nous vous aider?',
        available: 'En ligne',
        welcomeMessage: 'Bonjour! Je suis l\'Assistant Support PylonChat. Je peux vous aider avec les questions courantes. Selectionnez un sujet ci-dessous ou tapez votre question.',
        faqTitle: 'Questions Frequentes',
        inputPlaceholder: 'Tapez votre message...',
        sendButton: 'Envoyer',
        liveSupport: 'Connecter au Support en Direct',
        liveSupportDesc: 'Chattez avec notre equipe sur WhatsApp',
        redirectingMessage: 'Je comprends que vous avez besoin d\'une assistance personnalisee. Laissez-moi vous connecter avec notre equipe support sur WhatsApp.',
        notFoundMessage: 'Je n\'ai pas trouve de reponse exacte a votre question. Souhaitez-vous vous connecter avec notre equipe de support?',
        connectWhatsApp: 'Connecter via WhatsApp',
        askAnother: 'Poser une autre question',
        helpfulTitle: 'Cela vous a-t-il aide?',
        yes: 'Oui',
        no: 'Non, connectez-moi au support'
    }
}

const WHATSAPP_NUMBER = '61432672696'

export function WhatsAppChatWidget({
    locale,
    userName,
    userEmail,
    phoneNumber = WHATSAPP_NUMBER
}: WhatsAppChatWidgetProps) {
    const t = translations[locale] || translations.en
    const faqs = faqData[locale] || faqData.en
    const keywords = supportKeywords[locale] || supportKeywords.en

    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [showFAQs, setShowFAQs] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Initialize with welcome message
    useEffect(() => {
        setMessages([{
            id: '1',
            content: t.welcomeMessage,
            sender: 'bot',
            timestamp: new Date(),
            options: faqs
        }])
    }, [locale])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const openWhatsApp = (customMessage?: string) => {
        let message = `Hello! I am an Enterprise customer.\n\nName: ${userName}\nEmail: ${userEmail}`
        if (customMessage) {
            message += `\n\nQuestion: ${customMessage}`
        }
        const encodedMessage = encodeURIComponent(message)
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer')
    }

    const checkForSupportKeywords = (text: string): boolean => {
        const lowerText = text.toLowerCase()
        return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))
    }

    const findMatchingFAQ = (text: string): FAQOption | null => {
        const lowerText = text.toLowerCase()
        for (const faq of faqs) {
            const questionWords = faq.question.toLowerCase().split(' ')
            const matchCount = questionWords.filter(word =>
                word.length > 3 && lowerText.includes(word)
            ).length
            if (matchCount >= 2) {
                return faq
            }
        }
        return null
    }

    const handleFAQClick = (faq: FAQOption) => {
        // Add user question
        const userMsg: Message = {
            id: Date.now().toString(),
            content: faq.question,
            sender: 'user',
            timestamp: new Date()
        }

        // Add bot answer
        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            content: faq.answer,
            sender: 'bot',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg, botMsg])
        setShowFAQs(false)
    }

    const handleSend = () => {
        if (!inputValue.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue.trim(),
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        const userText = inputValue.trim()
        setInputValue('')
        setShowFAQs(false)

        // Process after a small delay
        setTimeout(() => {
            // Check for support keywords first
            if (checkForSupportKeywords(userText)) {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    content: t.redirectingMessage,
                    sender: 'bot',
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, botMsg])

                // Auto-open WhatsApp after showing message
                setTimeout(() => {
                    openWhatsApp(userText)
                }, 1500)
                return
            }

            // Try to find matching FAQ
            const matchedFAQ = findMatchingFAQ(userText)
            if (matchedFAQ) {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    content: matchedFAQ.answer,
                    sender: 'bot',
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, botMsg])
            } else {
                // No match found
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    content: t.notFoundMessage,
                    sender: 'bot',
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, botMsg])
            }
        }, 500)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-green-200 flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold">{t.title}</h3>
                            <p className="text-green-100 text-sm">{t.subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                        <span className="text-sm">{t.available}</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                    <div key={message.id}>
                        <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    message.sender === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-green-500 text-white'
                                }`}>
                                    {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={`rounded-2xl px-4 py-3 ${
                                    message.sender === 'user'
                                        ? 'bg-blue-500 text-white rounded-tr-sm'
                                        : 'bg-white text-gray-800 shadow-sm border rounded-tl-sm'
                                }`}>
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Options after welcome message */}
                        {message.options && showFAQs && (
                            <div className="mt-4 ml-10">
                                <p className="text-xs text-gray-500 mb-2 font-medium">{t.faqTitle}</p>
                                <div className="space-y-2">
                                    {message.options.map((faq) => (
                                        <button
                                            key={faq.id}
                                            onClick={() => handleFAQClick(faq)}
                                            className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all group flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <HelpCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-sm text-gray-700 group-hover:text-green-700">{faq.question}</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Live Support Banner */}
            <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 flex-shrink-0">
                <button
                    onClick={() => openWhatsApp()}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-amber-300 hover:border-green-500 hover:shadow-md transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <MessageCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-gray-900 group-hover:text-green-600 flex items-center gap-2">
                                {t.liveSupport}
                                <Crown className="h-4 w-4 text-amber-500" />
                            </p>
                            <p className="text-xs text-gray-500">{t.liveSupportDesc}</p>
                        </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-green-500" />
                </button>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t flex-shrink-0">
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t.inputPlaceholder}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="bg-green-500 hover:bg-green-600"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

// Floating WhatsApp Button Component for Enterprise users
export function FloatingWhatsAppButton({
    locale,
    phoneNumber = WHATSAPP_NUMBER
}: {
    locale: string
    phoneNumber?: string
}) {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false)

    const tooltips: Record<string, string> = {
        en: '24/7 Enterprise Support',
        tr: '7/24 Enterprise Destek',
        de: '24/7 Enterprise Support',
        es: 'Soporte Enterprise 24/7',
        fr: 'Support Enterprise 24/7'
    }

    const tooltip = tooltips[locale] || tooltips.en

    const handleClick = () => {
        const message = encodeURIComponent('Hello! I am an Enterprise customer and need support.')
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank', 'noopener,noreferrer')
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isTooltipVisible && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                    {tooltip}
                    <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                </div>
            )}

            <button
                onClick={handleClick}
                onMouseEnter={() => setIsTooltipVisible(true)}
                onMouseLeave={() => setIsTooltipVisible(false)}
                className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                aria-label="WhatsApp Support"
            >
                <MessageCircle className="h-7 w-7 text-white" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow">
                    <Crown className="h-3 w-3 text-white" />
                </div>
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25"></span>
            </button>
        </div>
    )
}
