'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Minimize2, Send } from 'lucide-react'
import { t, type Locale } from '@/lib/i18n'

interface WidgetTheme {
    primaryColor: string
    buttonColor: string
    textColor: string
    position: string
    size: string
    logoUrl: string | null
}

interface WidgetConfig {
    id: string
    botName: string
    welcomeMessage: string
    language: Locale
    theme: WidgetTheme
}

interface DynamicWidgetProps {
    chatbotId: string
}

export function DynamicWidget({ chatbotId }: DynamicWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [config, setConfig] = useState<WidgetConfig | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const visitorId = typeof window !== 'undefined'
        ? localStorage.getItem('visitorId') || (() => {
        const id = 'visitor_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('visitorId', id)
        return id
    })()
        : 'visitor_temp'

    // Widget config yükle
    useEffect(() => {
        fetch(`/api/widget/${chatbotId}/config`)
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => {
                console.error('Config load error:', err)
                // Fallback config
                setConfig({
                    id: chatbotId,
                    botName: 'AI Assistant',
                    welcomeMessage: 'Hello! How can I help you?',
                    language: 'en',
                    theme: {
                        primaryColor: '#3B82F6',
                        buttonColor: '#2563EB',
                        textColor: '#FFFFFF',
                        position: 'bottom-right',
                        size: 'medium',
                        logoUrl: null
                    }
                })
            })
    }, [chatbotId])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading || !config) return

        const userMessage = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        try {
            const response = await fetch('/api/public/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatbotId,
                    conversationId,
                    message: userMessage,
                    visitorId,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || t(config.language, 'common.error'))
            }

            const convId = response.headers.get('X-Conversation-Id')
            if (convId && !conversationId) {
                setConversationId(convId)
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let assistantMessage = ''

            setMessages(prev => [...prev, { role: 'assistant', content: '' }])

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value)
                    assistantMessage += chunk

                    setMessages(prev => {
                        const newMessages = [...prev]
                        newMessages[newMessages.length - 1] = {
                            role: 'assistant',
                            content: assistantMessage
                        }
                        return newMessages
                    })
                }
            }

        } catch (error: any) {
            console.error('Send error:', error)
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: `${t(config.language, 'common.error')}: ${error.message}` }
            ])
        } finally {
            setIsLoading(false)
        }
    }

    if (!config || !config.theme) {
        return <div className="fixed bottom-6 right-6 text-gray-500">Loading...</div>
    }

    const { theme, language } = config
    const sizeClasses = {
        small: 'w-12 h-12',
        medium: 'w-16 h-16',
        large: 'w-20 h-20'
    }
    const chatSizeClasses = {
        small: { width: 'w-80', height: 'h-[500px]' },
        medium: { width: 'w-96', height: 'h-[600px]' },
        large: { width: 'w-[28rem]', height: 'h-[700px]' }
    }

    const positionClasses = theme.position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-6'
    const buttonSize = sizeClasses[theme.size as keyof typeof sizeClasses] || sizeClasses.medium
    const chatSize = chatSizeClasses[theme.size as keyof typeof chatSizeClasses] || chatSizeClasses.medium

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className={`fixed ${positionClasses} ${buttonSize} rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110`}
                    style={{
                        backgroundColor: theme.buttonColor,
                        color: theme.textColor
                    }}
                >
                    {theme.logoUrl ? (
                        <img src={theme.logoUrl} alt="Bot" className="w-8 h-8 object-contain" />
                    ) : (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                        </svg>
                    )}
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`fixed ${positionClasses} ${chatSize.width} ${chatSize.height} bg-white rounded-lg shadow-2xl flex flex-col z-50`}
                >
                    {/* Header */}
                    <div
                        className="p-4 rounded-t-lg flex items-center justify-between"
                        style={{
                            backgroundColor: theme.primaryColor,
                            color: theme.textColor
                        }}
                    >
                        <div className="flex items-center space-x-2">
                            {theme.logoUrl && (
                                <img src={theme.logoUrl} alt="Bot" className="w-8 h-8 object-contain" />
                            )}
                            <span className="font-semibold">{config.botName}</span>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:opacity-80 p-1 rounded"
                                title={t(language, 'widget.minimize')}
                            >
                                <Minimize2 className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:opacity-80 p-1 rounded"
                                title={t(language, 'widget.close')}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-8">
                                {theme.logoUrl && (
                                    <img src={theme.logoUrl} alt="Bot" className="h-12 w-12 mx-auto mb-2" />
                                )}
                                <p>{config.welcomeMessage || t(language, 'widget.welcome')}</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                        msg.role === 'user'
                                            ? 'text-white'
                                            : 'bg-gray-200 text-gray-900'
                                    }`}
                                    style={msg.role === 'user' ? { backgroundColor: theme.primaryColor } : {}}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 rounded-lg px-4 py-2">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t p-4">
                        <div className="flex space-x-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={t(language, 'widget.placeholder')}
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                style={{
                                    backgroundColor: theme.buttonColor,
                                    color: theme.textColor
                                }}
                                title={t(language, 'widget.send')}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}