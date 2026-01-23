'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Send,
    Crown,
    User,
    HeadphonesIcon,
    Clock,
    CheckCheck,
    Loader2
} from 'lucide-react'

interface Message {
    id: string
    content: string
    sender: 'user' | 'support'
    timestamp: Date
    status?: 'sending' | 'sent' | 'delivered'
}

interface SupportChatWidgetProps {
    locale: string
    userName: string
    userEmail: string
}

const translations: Record<string, Record<string, string>> = {
    en: {
        title: '24/7 Enterprise Support',
        subtitle: 'Our dedicated support team is here to help',
        placeholder: 'Type your message...',
        send: 'Send',
        online: 'Online',
        typing: 'Support agent is typing...',
        welcome: 'Hello! Welcome to PylonChat Enterprise Support. I\'m here to help you with any questions or issues. How can I assist you today?',
        received: 'Thank you for your message. Our support team will respond shortly. As an Enterprise customer, you have priority access and will receive a response within 1 hour.',
        agentName: 'PylonChat Support'
    },
    tr: {
        title: '7/24 Enterprise Destek',
        subtitle: 'Özel destek ekibimiz size yardımcı olmak için burada',
        placeholder: 'Mesajınızı yazın...',
        send: 'Gönder',
        online: 'Çevrimiçi',
        typing: 'Destek temsilcisi yazıyor...',
        welcome: 'Merhaba! PylonChat Enterprise Desteğe hoş geldiniz. Herhangi bir soru veya sorunuzda size yardımcı olmak için buradayım. Bugün size nasıl yardımcı olabilirim?',
        received: 'Mesajınız için teşekkürler. Destek ekibimiz en kısa sürede yanıt verecektir. Enterprise müşterisi olarak öncelikli erişiminiz var ve 1 saat içinde yanıt alacaksınız.',
        agentName: 'PylonChat Destek'
    },
    de: {
        title: '24/7 Enterprise Support',
        subtitle: 'Unser engagiertes Support-Team ist hier, um Ihnen zu helfen',
        placeholder: 'Nachricht eingeben...',
        send: 'Senden',
        online: 'Online',
        typing: 'Support-Mitarbeiter tippt...',
        welcome: 'Hallo! Willkommen beim PylonChat Enterprise Support. Ich bin hier, um Ihnen bei allen Fragen oder Problemen zu helfen. Wie kann ich Ihnen heute helfen?',
        received: 'Vielen Dank für Ihre Nachricht. Unser Support-Team wird in Kürze antworten. Als Enterprise-Kunde haben Sie Prioritätszugang und erhalten innerhalb von 1 Stunde eine Antwort.',
        agentName: 'PylonChat Support'
    },
    es: {
        title: 'Soporte Enterprise 24/7',
        subtitle: 'Nuestro equipo de soporte dedicado está aquí para ayudarte',
        placeholder: 'Escribe tu mensaje...',
        send: 'Enviar',
        online: 'En línea',
        typing: 'El agente de soporte está escribiendo...',
        welcome: '¡Hola! Bienvenido al Soporte Enterprise de PylonChat. Estoy aquí para ayudarte con cualquier pregunta o problema. ¿Cómo puedo ayudarte hoy?',
        received: 'Gracias por tu mensaje. Nuestro equipo de soporte responderá en breve. Como cliente Enterprise, tienes acceso prioritario y recibirás una respuesta en 1 hora.',
        agentName: 'Soporte PylonChat'
    },
    fr: {
        title: 'Support Enterprise 24/7',
        subtitle: 'Notre équipe de support dédiée est là pour vous aider',
        placeholder: 'Tapez votre message...',
        send: 'Envoyer',
        online: 'En ligne',
        typing: 'L\'agent de support écrit...',
        welcome: 'Bonjour ! Bienvenue au Support Enterprise PylonChat. Je suis là pour vous aider avec toutes vos questions ou problèmes. Comment puis-je vous aider aujourd\'hui ?',
        received: 'Merci pour votre message. Notre équipe de support répondra sous peu. En tant que client Enterprise, vous avez un accès prioritaire et recevrez une réponse dans l\'heure.',
        agentName: 'Support PylonChat'
    }
}

export function SupportChatWidget({ locale, userName, userEmail }: SupportChatWidgetProps) {
    const t = translations[locale] || translations.en
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: t.welcome,
            sender: 'support',
            timestamp: new Date()
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!inputValue.trim() || isSending) return

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue.trim(),
            sender: 'user',
            timestamp: new Date(),
            status: 'sending'
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsSending(true)

        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 500))

        setMessages(prev => prev.map(msg =>
            msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
        ))

        // Simulate support response
        setIsTyping(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsTyping(false)

        const supportMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: t.received,
            sender: 'support',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, supportMessage])
        setIsSending(false)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <HeadphonesIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{t.title}</h3>
                            <p className="text-sm text-amber-100">{t.subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-sm">{t.online}</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                message.sender === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                            }`}>
                                {message.sender === 'user'
                                    ? <User className="h-4 w-4" />
                                    : <Crown className="h-4 w-4" />
                                }
                            </div>

                            {/* Message Bubble */}
                            <div>
                                <div className={`rounded-2xl px-4 py-2 ${
                                    message.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 shadow-sm border rounded-tl-none'
                                }`}>
                                    {message.sender === 'support' && (
                                        <p className="text-xs font-semibold text-amber-600 mb-1">{t.agentName}</p>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                                <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${
                                    message.sender === 'user' ? 'justify-end' : ''
                                }`}>
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTime(message.timestamp)}</span>
                                    {message.sender === 'user' && message.status === 'delivered' && (
                                        <CheckCheck className="h-3 w-3 text-blue-500 ml-1" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span>{t.typing}</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t rounded-b-lg">
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t.placeholder}
                        className="flex-1"
                        disabled={isSending}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isSending}
                        className="bg-amber-500 hover:bg-amber-600"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
