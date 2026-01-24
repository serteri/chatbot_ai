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
    Headphones,
    X,
    Search,
    Settings,
    Users
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

// Comprehensive FAQ data for floating widget
const quickFAQs: Record<string, Array<{ q: string; a: string; category?: string }>> = {
    tr: [
        // Genel
        { q: 'PylonChat nedir ve ne ise yarar?', a: 'PylonChat, isletmeler icin gelistirilmis yapay zeka destekli chatbot platformudur. Web sitenize, mobil uygulamaniza veya sosyal medya kanallariniza entegre edebileceginiz akilli chatbotlar olusturmanizi saglar. Musteri sorularini 7/24 otomatik yanitlar, musteri memnuniyetini artirir ve destek maliyetlerinizi %60\'a kadar azaltir.', category: 'Genel' },
        { q: 'Hangi sektorlere hizmet veriyorsunuz?', a: 'PylonChat tum sektorlerde kullanilabilir: E-ticaret (urun onerileri, siparis takibi), Egitim (ogrenci danismanligi, kayit islemleri), Emlak (mulk sorgulama, randevu alma), Saglik (randevu, SSS), Finans (hesap bilgileri, islem sorgulama), Turizm (rezervasyon, bilgi), Perakende ve daha fazlasi. Her sektor icin ozellestirilmis sablonlar sunuyoruz.', category: 'Genel' },
        { q: 'Ucretsiz deneme surumu var mi?', a: 'Evet! Ucretsiz planumuzla hemen baslayabilirsiniz. Kredi karti gerektirmez. Ucretsiz planda 1 chatbot olusturabilir, 3 belge yukleyebilir ve aylik 100 mesaj kullanabilirsiniz. Tum temel ozelliklere erisim saglarsiniz. Daha fazla ozellik icin Pro veya Business planina yukseltebilirsiniz.', category: 'Genel' },

        // Fiyatlandirma
        { q: 'Fiyatlandirma nasil calisiyor? Hangi planlar var?', a: 'Dort plan sunuyoruz:\n\n• UCRETSIZ: 1 chatbot, 3 belge, aylik 100 mesaj, temel ozellikler\n• PRO ($29/ay): 5 chatbot, 20 belge, aylik 5.000 mesaj, gelismis analitik, oncelikli destek\n• BUSINESS ($79/ay): 15 chatbot, 100 belge, aylik 25.000 mesaj, API erisimi, ozel marka, 7/24 destek\n• ENTERPRISE (Ozel): Sinirsiz chatbot ve mesaj, ozel entegrasyonlar, SLA garantisi, ozel hesap yoneticisi\n\nYillik odemede %20 indirim kazanirsiniz.', category: 'Fiyatlandirma' },
        { q: 'Mesaj limiti asarsam ne olur?', a: 'Mesaj limitinizi astiginizda chatbotunuz calismaya devam eder ancak asim ucreti uygulanir:\n\n• Pro plan: Asim basina $0.01\n• Business plan: Asim basina $0.008\n• Enterprise: Asim ucreti yoktur, sinirsiz mesaj\n\nLimit yaklastiginizda (80% ve 95%) e-posta bildirimi alirsiniz. Dashboard\'dan kullanim durumunuzu takip edebilirsiniz.', category: 'Fiyatlandirma' },
        { q: 'Para iade politikasi nedir?', a: 'Memnuniyet garantisi sunuyoruz:\n\n• Ilk 14 gun icinde memnun kalmazsaniz tam iade\n• Yillik planlarda kalan sure icin orantili iade\n• Iade islemi 5-7 is gunu icinde tamamlanir\n• Iade talebinizi support@pylonchat.com adresine gonderebilirsiniz\n\nIptal sonrasi verileriniz 30 gun saklanir, istediginiz zaman geri donebilirsiniz.', category: 'Fiyatlandirma' },

        // Entegrasyon
        { q: 'Chatbotu web siteme nasil entegre ederim?', a: 'Entegrasyon 3 kolay adimda tamamlanir:\n\n1. Dashboard\'da chatbotunuzu olusturun ve egitim verilerini ekleyin\n2. Ayarlar > Embed Kodu bolumune gidin\n3. Verilen JavaScript kodunu web sitenizin </body> etiketinden hemen once yapistirin\n\nWordPress icin eklentimizi kullanabilirsiniz. Shopify, Wix, Squarespace icin de ozel entegrasyon rehberlerimiz mevcuttur. Chatbot otomatik olarak sitenizde gorunecektir.', category: 'Entegrasyon' },
        { q: 'Hangi platformlarla entegre olur?', a: 'PylonChat genis entegrasyon destegi sunar:\n\n• WEB: Tum web siteleri, WordPress, Shopify, WooCommerce, Magento, Wix, Squarespace\n• MESAJLASMA: WhatsApp Business, Facebook Messenger, Instagram DM, Telegram\n• IS ARACLARI: Slack, Microsoft Teams, Discord\n• CRM: Salesforce, HubSpot, Zendesk, Freshdesk, Pipedrive\n• OTOMASYON: Zapier ile 5000+ uygulama baglantisi\n• OZEL: REST API ile kendi entegrasyonlarinizi gelistirebilirsiniz', category: 'Entegrasyon' },
        { q: 'API dokumantasyonu nerede? Nasil kullanirim?', a: 'API dokumantasyonuna Dashboard > Gelistirici > API Dokumantasyonu bolumunden ulasabilirsiniz.\n\nAPI ile yapabilecekleriniz:\n• Chatbot olusturma ve yonetme\n• Egitim verileri yukleme\n• Mesaj gonderme ve alma\n• Konusma gecmisine erisim\n• Analitik verileri cekme\n\nAPI anahtarinizi ayni sayfadan olusturabilirsiniz. Rate limit: Pro 60/dk, Business 300/dk, Enterprise ozel.', category: 'Entegrasyon' },

        // Egitim
        { q: 'Chatbotumu nasil egitirim? Hangi yontemler var?', a: 'Chatbotunuzu 3 farkli yontemle egitebilirsiniz:\n\n1. BELGE YUKLEME: PDF, DOCX, DOC, TXT, CSV, XLSX dosyalari yukleyin. AI otomatik olarak icerigi analiz eder.\n\n2. WEB SITESI TARAMA: URL girin, chatbot sitenizi tarar ve icerik cikarir. SSS, urun bilgileri, blog yazilari otomatik ogrenilir.\n\n3. MANUEL GIRIS: Soru-cevap ciftleri dogrudan ekleyin. Ozel senaryolar icin ideal.\n\nEgitim genellikle birkac dakika icerisinde tamamlanir.', category: 'Egitim' },
        { q: 'Hangi dosya formatlarini destekliyorsunuz?', a: 'Desteklenen dosya formatlari:\n\n• BELGELER: PDF, DOCX, DOC, TXT, RTF, ODT\n• TABLOLAR: CSV, XLSX, XLS (urun kataloglari icin ideal)\n• WEB: HTML, XML, Sitemap\n• KOD: Markdown (MD)\n\nMaksimum dosya boyutu:\n• Pro: 10MB/dosya, toplam 50MB\n• Business: 50MB/dosya, toplam 500MB\n• Enterprise: Sinirsiz\n\nBirden fazla dosya ayni anda yuklenebilir.', category: 'Egitim' },
        { q: 'Chatbot kac dil destekliyor?', a: 'PylonChat 50\'den fazla dili destekler:\n\n• Turkce, Ingilizce, Almanca, Fransizca, Ispanyolca\n• Arapca, Cince (Basitlestirilmis/Geleneksel), Japonca, Korece\n• Rusca, Portekizce, Italyanca, Hollandaca, Lehce\n• Hintce, Endonezyaca, Vietnamca, Tayce\n• Ve daha fazlasi...\n\nChatbot kullanicinin dilini otomatik algilar ve ayni dilde yanit verir. Her dil icin ayri egitim verileri de yukleyebilirsiniz.', category: 'Egitim' },

        // Analitik
        { q: 'Hangi analitik ve raporlari gorebilirim?', a: 'Dashboard\'da kapsamli analitikler sunuyoruz:\n\n• GENEL: Toplam konusma, mesaj sayisi, aktif kullanici\n• PERFORMANS: Cozum orani, ortalama yanit suresi, musteri memnuniyeti\n• ICERIK: En cok sorulan sorular, yanitlanamayan sorular, populer konular\n• ZAMAN: Yogun saatler, gunluk/haftalik/aylik trendler\n• DONUSUM: Lead yakalama, hedef tamamlama, canli destege yonlendirme\n\nRaporlar CSV, PDF, JSON formatinda indirilebilir. Zamanlanmis e-posta raporlari ayarlanabilir.', category: 'Analitik' },

        // Guvenlik
        { q: 'Verilerim guvenli mi? Hangi onlemler aliniyor?', a: 'En yuksek guvenlik standartlarini uyguluyoruz:\n\n• SIFRELEME: TLS 1.3 baglanti, AES-256 veri sifreleme\n• ALTYAPI: SOC 2 Type II sertifikali AWS veri merkezleri\n• ERISIM: 2FA zorunlu, IP beyaz listesi (Enterprise), rol bazli yetkilendirme\n• DENETIM: Duzenli guvenlik testleri, penetrasyon testleri\n• UYUMLULUK: GDPR, KVKK, CCPA, HIPAA (Enterprise)\n\nVerileriniz Avrupa (Frankfurt) veya ABD (Virginia) veri merkezlerinde saklanir.', category: 'Guvenlik' },
        { q: 'GDPR ve KVKK uyumlu mu?', a: 'Evet, tam uyumluyuz:\n\n• Veri Isleme Sozlesmesi (DPA) mevcut\n• Kullanici rizasi yonetimi (cookie banner entegrasyonu)\n• Veri silme talep araci (RTBF - Right to be Forgotten)\n• Veri tasima destegi (Data Portability)\n• Avrupa\'da veri depolama secenegi\n• Gizlilik politikasi ve kullanim sartlari sablonlari\n• DPO (Data Protection Officer) ile iletisim kanali\n\nKVKK verbis bildirimi icin gerekli dokumanlari sagliyoruz.', category: 'Guvenlik' },

        // Hesap
        { q: 'Hesabimi nasil yonetirim? Ayarlari nereden degistiririm?', a: 'Dashboard\'dan tum hesap islemlerinizi yapabilirsiniz:\n\n• PROFIL: Ad, e-posta, sifre degisikligi\n• FATURALAMA: Plan degisikligi, odeme yontemi, fatura gecmisi\n• EKIP: Kullanici ekleme/cikarma, roller ve izinler\n• BILDIRIMLER: E-posta bildirimleri, haftalik raporlar\n• GUVENLIK: 2FA etkinlestirme, oturum yonetimi, API anahtarlari\n• ENTEGRASYONLAR: Ucuncu parti baglantilari yonetme\n\nTum degisiklikler aninda kaydedilir.', category: 'Hesap' },
        { q: 'Aboneligimi nasil iptal ederim?', a: 'Dashboard > Faturalama > Abonelik Yonetimi bolumunden iptal edebilirsiniz:\n\n• Iptal mevcut fatura donemi sonuna kadar gecerlidir\n• Tum ozellikleriniz donem sonuna kadar aktif kalir\n• Verileriniz iptal sonrasi 30 gun saklanir\n• 30 gun icinde yeniden aktif edebilirsiniz\n• 14 gun icinde iptal ederseniz tam iade alirsiniz\n\nIptal oncesi verilerinizi disa aktarmanizi oneririz. Geri bildiriminiz bizim icin degerli!', category: 'Hesap' }
    ],
    en: [
        // General
        { q: 'What is PylonChat and what does it do?', a: 'PylonChat is an AI-powered chatbot platform built for businesses. It allows you to create intelligent chatbots that integrate with your website, mobile app, or social media channels. It automatically answers customer questions 24/7, increases customer satisfaction, and reduces support costs by up to 60%.', category: 'General' },
        { q: 'Which industries do you serve?', a: 'PylonChat works for all industries: E-commerce (product recommendations, order tracking), Education (student advising, registration), Real Estate (property inquiries, appointments), Healthcare (appointments, FAQs), Finance (account info, transactions), Tourism (reservations, info), Retail, and more. We offer customized templates for each industry.', category: 'General' },
        { q: 'Is there a free trial?', a: 'Yes! You can start with our free plan immediately. No credit card required. Free plan includes 1 chatbot, 3 documents, and 100 messages/month. Access all basic features. Upgrade to Pro or Business for more features.', category: 'General' },

        // Pricing
        { q: 'How does pricing work? What plans are available?', a: 'We offer four plans:\n\n• FREE: 1 chatbot, 3 docs, 100 msgs/month, basic features\n• PRO ($29/mo): 5 chatbots, 20 docs, 5,000 msgs/month, advanced analytics, priority support\n• BUSINESS ($79/mo): 15 chatbots, 100 docs, 25,000 msgs/month, API access, white-label, 24/7 support\n• ENTERPRISE (Custom): Unlimited chatbots & messages, custom integrations, SLA guarantee, dedicated account manager\n\nGet 20% off with annual billing.', category: 'Pricing' },
        { q: 'What happens if I exceed the message limit?', a: 'If you exceed your message limit, your chatbot continues working but overage fees apply:\n\n• Pro plan: $0.01 per overage\n• Business plan: $0.008 per overage\n• Enterprise: No overage fees, unlimited messages\n\nYou receive email notifications at 80% and 95% usage. Track usage in Dashboard.', category: 'Pricing' },
        { q: 'What is the refund policy?', a: 'We offer a satisfaction guarantee:\n\n• Full refund within first 14 days if not satisfied\n• Prorated refund for remaining time on annual plans\n• Refund processed within 5-7 business days\n• Send requests to support@pylonchat.com\n\nAfter cancellation, data is kept for 30 days - you can return anytime.', category: 'Pricing' },

        // Integration
        { q: 'How do I integrate the chatbot with my website?', a: 'Integration is completed in 3 easy steps:\n\n1. Create your chatbot in Dashboard and add training data\n2. Go to Settings > Embed Code\n3. Paste the JavaScript code just before </body> tag on your website\n\nUse our plugin for WordPress. We have dedicated integration guides for Shopify, Wix, Squarespace. The chatbot will automatically appear on your site.', category: 'Integration' },
        { q: 'Which platforms do you integrate with?', a: 'PylonChat offers extensive integration support:\n\n• WEB: All websites, WordPress, Shopify, WooCommerce, Magento, Wix, Squarespace\n• MESSAGING: WhatsApp Business, Facebook Messenger, Instagram DM, Telegram\n• BUSINESS TOOLS: Slack, Microsoft Teams, Discord\n• CRM: Salesforce, HubSpot, Zendesk, Freshdesk, Pipedrive\n• AUTOMATION: 5000+ apps via Zapier\n• CUSTOM: Build your own integrations with REST API', category: 'Integration' },
        { q: 'Where is the API documentation? How do I use it?', a: 'Access API documentation at Dashboard > Developer > API Documentation.\n\nWith the API you can:\n• Create and manage chatbots\n• Upload training data\n• Send and receive messages\n• Access conversation history\n• Pull analytics data\n\nGenerate your API key on the same page. Rate limits: Pro 60/min, Business 300/min, Enterprise custom.', category: 'Integration' },

        // Training
        { q: 'How do I train my chatbot? What methods are available?', a: 'Train your chatbot using 3 methods:\n\n1. DOCUMENT UPLOAD: Upload PDF, DOCX, DOC, TXT, CSV, XLSX files. AI automatically analyzes content.\n\n2. WEBSITE CRAWLING: Enter URL, chatbot crawls your site and extracts content. FAQs, product info, blog posts are auto-learned.\n\n3. MANUAL ENTRY: Add Q&A pairs directly. Ideal for custom scenarios.\n\nTraining typically completes within minutes.', category: 'Training' },
        { q: 'What file formats do you support?', a: 'Supported file formats:\n\n• DOCUMENTS: PDF, DOCX, DOC, TXT, RTF, ODT\n• SPREADSHEETS: CSV, XLSX, XLS (ideal for product catalogs)\n• WEB: HTML, XML, Sitemap\n• CODE: Markdown (MD)\n\nMaximum file size:\n• Pro: 10MB/file, 50MB total\n• Business: 50MB/file, 500MB total\n• Enterprise: Unlimited\n\nMultiple files can be uploaded simultaneously.', category: 'Training' },
        { q: 'How many languages does the chatbot support?', a: 'PylonChat supports 50+ languages:\n\n• English, Turkish, German, French, Spanish\n• Arabic, Chinese (Simplified/Traditional), Japanese, Korean\n• Russian, Portuguese, Italian, Dutch, Polish\n• Hindi, Indonesian, Vietnamese, Thai\n• And more...\n\nThe chatbot auto-detects user language and responds accordingly. You can also upload separate training data for each language.', category: 'Training' },

        // Analytics
        { q: 'What analytics and reports can I see?', a: 'We offer comprehensive analytics in Dashboard:\n\n• GENERAL: Total conversations, message count, active users\n• PERFORMANCE: Resolution rate, avg response time, customer satisfaction\n• CONTENT: Most asked questions, unanswered queries, popular topics\n• TIME: Peak hours, daily/weekly/monthly trends\n• CONVERSION: Lead capture, goal completion, live support escalation\n\nReports downloadable in CSV, PDF, JSON. Scheduled email reports available.', category: 'Analytics' },

        // Security
        { q: 'Is my data secure? What measures are taken?', a: 'We implement highest security standards:\n\n• ENCRYPTION: TLS 1.3 connection, AES-256 data encryption\n• INFRASTRUCTURE: SOC 2 Type II certified AWS data centers\n• ACCESS: Mandatory 2FA, IP whitelist (Enterprise), role-based permissions\n• AUDIT: Regular security tests, penetration testing\n• COMPLIANCE: GDPR, CCPA, HIPAA (Enterprise)\n\nData stored in Europe (Frankfurt) or USA (Virginia) data centers.', category: 'Security' },
        { q: 'Is it GDPR and CCPA compliant?', a: 'Yes, we are fully compliant:\n\n• Data Processing Agreement (DPA) available\n• User consent management (cookie banner integration)\n• Data deletion request tool (RTBF - Right to be Forgotten)\n• Data portability support\n• Europe data storage option\n• Privacy policy and terms of service templates\n• DPO (Data Protection Officer) contact channel\n\nWe provide necessary documentation for compliance.', category: 'Security' },

        // Account
        { q: 'How do I manage my account? Where do I change settings?', a: 'Manage all account operations from Dashboard:\n\n• PROFILE: Name, email, password changes\n• BILLING: Plan changes, payment method, invoice history\n• TEAM: Add/remove users, roles and permissions\n• NOTIFICATIONS: Email notifications, weekly reports\n• SECURITY: Enable 2FA, session management, API keys\n• INTEGRATIONS: Manage third-party connections\n\nAll changes are saved instantly.', category: 'Account' },
        { q: 'How do I cancel my subscription?', a: 'Cancel from Dashboard > Billing > Subscription Management:\n\n• Cancellation is valid until end of current billing period\n• All features remain active until period ends\n• Data is kept for 30 days after cancellation\n• Reactivate within 30 days anytime\n• Full refund if cancelled within 14 days\n\nWe recommend exporting your data before cancelling. Your feedback is valuable to us!', category: 'Account' }
    ]
}

const floatingTranslations: Record<string, Record<string, string>> = {
    tr: {
        title: 'Yardim Merkezi',
        searchPlaceholder: 'Soru ara...',
        popularQuestions: 'Sik Sorulan Sorular',
        noResults: 'Sonuc bulunamadi',
        needHelp: 'Canli destek gerekiyor mu?',
        technicalSupport: 'Teknik Destek',
        customerService: 'Musteri Hizmetleri',
        connectWhatsApp: 'WhatsApp ile Baglan',
        close: 'Kapat'
    },
    en: {
        title: 'Help Center',
        searchPlaceholder: 'Search questions...',
        popularQuestions: 'Frequently Asked Questions',
        noResults: 'No results found',
        needHelp: 'Need live support?',
        technicalSupport: 'Technical Support',
        customerService: 'Customer Service',
        connectWhatsApp: 'Connect via WhatsApp',
        close: 'Close'
    },
    de: {
        title: 'Hilfezentrum',
        searchPlaceholder: 'Fragen suchen...',
        popularQuestions: 'Haufig gestellte Fragen',
        noResults: 'Keine Ergebnisse',
        needHelp: 'Live-Support benotigt?',
        technicalSupport: 'Technischer Support',
        customerService: 'Kundendienst',
        connectWhatsApp: 'Uber WhatsApp verbinden',
        close: 'Schliessen'
    },
    es: {
        title: 'Centro de Ayuda',
        searchPlaceholder: 'Buscar preguntas...',
        popularQuestions: 'Preguntas Frecuentes',
        noResults: 'Sin resultados',
        needHelp: 'Necesitas soporte en vivo?',
        technicalSupport: 'Soporte Tecnico',
        customerService: 'Servicio al Cliente',
        connectWhatsApp: 'Conectar via WhatsApp',
        close: 'Cerrar'
    },
    fr: {
        title: 'Centre d\'Aide',
        searchPlaceholder: 'Rechercher...',
        popularQuestions: 'Questions Frequentes',
        noResults: 'Aucun resultat',
        needHelp: 'Besoin de support?',
        technicalSupport: 'Support Technique',
        customerService: 'Service Client',
        connectWhatsApp: 'Connecter via WhatsApp',
        close: 'Fermer'
    }
}

// Floating Support Button with FAQ Popup
export function FloatingWhatsAppButton({
    locale,
    phoneNumber = WHATSAPP_NUMBER
}: {
    locale: string
    phoneNumber?: string
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

    const t = floatingTranslations[locale] || floatingTranslations.en
    const faqs = quickFAQs[locale] || quickFAQs.en

    const filteredFAQs = faqs.filter(faq =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const openWhatsApp = (type: 'technical' | 'customer') => {
        const msg = type === 'technical'
            ? 'Hello! I need Technical Support assistance.'
            : 'Hello! I need Customer Service assistance.'
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`, '_blank')
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* FAQ Popup */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="h-5 w-5" />
                                <h3 className="font-bold">{t.title}</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {/* Search */}
                        <div className="mt-3 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-200" />
                            <input
                                type="text"
                                placeholder={t.searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-green-200 text-sm focus:outline-none focus:bg-white/30"
                            />
                        </div>
                    </div>

                    {/* FAQ List */}
                    <div className="max-h-64 overflow-y-auto">
                        {filteredFAQs.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {filteredFAQs.map((faq, index) => (
                                    <div key={index}>
                                        <button
                                            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                                        >
                                            <span className="text-sm font-medium text-gray-800 pr-2">{faq.q}</span>
                                            <ChevronRight className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${expandedIndex === index ? 'rotate-90' : ''}`} />
                                        </button>
                                        {expandedIndex === index && (
                                            <div className="px-4 pb-3">
                                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{faq.a}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                {t.noResults}
                            </div>
                        )}
                    </div>

                    {/* Contact Support Section */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <p className="text-xs text-gray-500 mb-3">{t.needHelp}</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => openWhatsApp('technical')}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <Settings className="h-4 w-4" />
                                {t.technicalSupport}
                            </button>
                            <button
                                onClick={() => openWhatsApp('customer')}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <Users className="h-4 w-4" />
                                {t.customerService}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
                    isOpen ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-500 hover:bg-green-600'
                }`}
                aria-label="Support"
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <>
                        <HelpCircle className="h-7 w-7 text-white" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow">
                            <Crown className="h-3 w-3 text-white" />
                        </div>
                        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25"></span>
                    </>
                )}
            </button>
        </div>
    )
}
