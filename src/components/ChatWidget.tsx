'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, FileText, Zap, BookOpen, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Building2 } from 'lucide-react'

interface Message {
    id: string
    content: string
    isBot: boolean
    timestamp: Date
    sources?: Array<{
        documentName: string
        similarity: number
    }>
    confidence?: number
    mode?: string
}

interface ChatWidgetProps {
    chatbotId: string
    onClose?: () => void
    mode?: string
    onRealEstateClick?: () => void // Callback to open RealEstateWidget
    // Customization Props for Live Preview
    customization?: {
        primaryColor?: string
        buttonColor?: string
        textColor?: string
        botName?: string
        welcomeMessage?: string
        logoUrl?: string | null
        hideBranding?: boolean
    }
}

export default function ChatWidget({ chatbotId, onClose, mode = 'document', onRealEstateClick, customization }: ChatWidgetProps) {
    const t = useTranslations('ChatWidget')
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [conversationId, setConversationId] = useState<string | null>(null)

    // Debug bilgisini gizleyip açmak için state
    const [showDebug, setShowDebug] = useState(false)
    const [debugInfo, setDebugInfo] = useState<string>('')

    // Default values fallback to passed customization or translation
    const chatbotName = customization?.botName || t('defaultBotName');
    const welcomeMessage = customization?.welcomeMessage || t('defaultWelcomeMessage');

    const primaryColor = customization?.primaryColor || '#2563EB'; // blue-600
    const buttonColor = customization?.buttonColor || '#2563EB';
    const textColor = customization?.textColor || '#FFFFFF';

    const messagesEndRef = useRef<HTMLDivElement>(null)

    // İlk yükleme (ve customization değişirse güncelle)
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                content: welcomeMessage,
                isBot: true,
                timestamp: new Date(),
                mode
            }])
        } else if (messages.length === 1 && messages[0].id === 'welcome' && customization?.welcomeMessage) {
            // Canlı önizleme sırasında hoşgeldin mesajını güncelle
            setMessages([{
                ...messages[0],
                content: customization.welcomeMessage
            }])
        }
    }, [welcomeMessage, mode, customization?.welcomeMessage])

    // Otomatik kaydırma
    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return

        if (!chatbotId || chatbotId.trim() === '') {
            setDebugInfo('❌ ChatbotId boş!')
            const errorMessage: Message = {
                id: Date.now().toString(),
                content: t('errors.noId'),
                isBot: true,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
            return
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue.trim(),
            isBot: false,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)

        const requestData = {
            message: userMessage.content,
            chatbotId: chatbotId.trim(),
            conversationId: conversationId || null,
            mode
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
            }

            const data = await response.json()
            setDebugInfo(JSON.stringify(data, null, 2)) // Debug güncellendi

            if (data.success) {
                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: data.response,
                    isBot: true,
                    timestamp: new Date(),
                    sources: data.sources || [],
                    confidence: data.confidence || 0,
                    mode: data.mode
                }

                setMessages(prev => [...prev, botMessage])

                if (data.conversationId) {
                    setConversationId(data.conversationId)
                }
            } else {
                throw new Error(data.error || 'Failed to get response')
            }

        } catch (error) {
            console.error('💥 Chat error:', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: t('errors.generic'),
                isBot: true,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        sendMessage()
    }

    const formatTime = (date: Date) => {
        return date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }


    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
        if (confidence >= 0.6) return 'text-amber-600 bg-amber-50 border-amber-200'
        return 'text-red-600 bg-red-50 border-red-200'
    }

    return (
        <Card className="h-[650px] w-full max-w-md flex flex-col shadow-2xl border-0 overflow-hidden ring-1 ring-slate-900/5">
            {/* Header */}
            <CardHeader
                className="flex flex-row items-center justify-between py-4 px-5 shrink-0"
                style={{ backgroundColor: primaryColor, color: textColor }}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                        {customization?.logoUrl ? (
                            <img src={customization.logoUrl} alt="Bot Logo" className="h-5 w-5 object-contain" />
                        ) : mode === 'education' ? (
                            <BookOpen className="h-5 w-5" style={{ color: textColor }} />
                        ) : (
                            <Bot className="h-5 w-5" style={{ color: textColor }} />
                        )}
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold" style={{ color: textColor }}>
                            {mode === 'education' ? t('educationAdvisor') : chatbotName}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 opacity-90">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                            </span>
                            <span className="text-xs font-medium" style={{ color: textColor }}>{t('online')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {/* Real Estate Button - only show when callback is provided */}
                    {onRealEstateClick && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onRealEstateClick}
                            className="hover:bg-white/10 h-8 w-8"
                            style={{ color: textColor }}
                            title={t('realEstateAssistant')}
                        >
                            <Building2 className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Debug Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowDebug(!showDebug)}
                        className="hover:bg-white/10 h-8 w-8"
                        style={{ color: textColor }}
                        title="Debug Info"
                    >
                        {showDebug ? <ChevronUp className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </Button>

                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="hover:bg-white/10 h-8 w-8 rounded-full"
                            style={{ color: textColor }}
                        >
                            ✕
                        </Button>
                    )}
                </div>
            </CardHeader>

            {/* Debug Panel (Opsiyonel) */}
            {showDebug && (
                <div className="bg-slate-100 p-2 text-[10px] font-mono text-slate-600 border-b max-h-32 overflow-y-auto shadow-inner">
                    <p className="font-bold mb-1">Debug Info:</p>
                    <pre className="whitespace-pre-wrap">{debugInfo || 'No debug data yet.'}</pre>
                    <p className="mt-1">ID: {chatbotId} | Mode: {mode}</p>
                </div>
            )}

            {/* Messages Area */}
            <CardContent className="flex-1 flex flex-col p-0 bg-slate-50 relative overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex w-full ${message.isBot ? 'justify-start' : 'justify-end'}`}>

                            {/* Avatar for Bot */}
                            {message.isBot && (
                                <div className="flex-shrink-0 mr-2 mt-1">
                                    <div className="h-8 w-8 rounded-full flex items-center justify-center border border-slate-200 bg-white">
                                        {customization?.logoUrl ? (
                                            <img src={customization.logoUrl} alt="Bot" className="h-5 w-5 object-contain" />
                                        ) : mode === 'education' ? (
                                            <BookOpen className="h-4 w-4" style={{ color: primaryColor }} />
                                        ) : (
                                            <Bot className="h-4 w-4" style={{ color: primaryColor }} />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div className={`flex flex-col max-w-[85%] ${message.isBot ? 'items-start' : 'items-end'}`}>
                                <div
                                    className={`relative px-4 py-3 shadow-sm text-sm leading-relaxed ${message.isBot
                                        ? 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100'
                                        : 'text-white rounded-2xl rounded-tr-sm'
                                        }`}
                                    style={!message.isBot ? { backgroundColor: buttonColor, color: textColor } : {}}
                                >
                                    {/* Mesaj İçeriği - Taşmayı önleyen sınıflar */}
                                    <div className="whitespace-pre-wrap break-words overflow-hidden" style={{ wordBreak: 'break-word' }}>
                                        {message.content}
                                    </div>
                                </div>

                                {/* Metadata Row */}
                                <div className="flex items-center gap-2 mt-1 px-1">
                                    <span className="text-[10px] text-slate-400">
                                        {formatTime(message.timestamp)}
                                    </span>

                                    {/* Confidence Badge (Bot Only) */}
                                    {message.isBot && message.confidence !== undefined && message.confidence > 0 && (
                                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-medium ${getConfidenceColor(message.confidence)}`}>
                                            <Zap className="h-2.5 w-2.5" />
                                            %{Math.round(message.confidence * 100)}
                                        </div>
                                    )}
                                </div>

                                {/* Sources (Bot Only) */}
                                {message.isBot && message.sources && message.sources.length > 0 && (
                                    <div className="mt-2 pl-1 w-full">
                                        <p className="text-[10px] font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            {t('sources')}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {message.sources.map((source, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1 shadow-sm transition-colors hover:bg-slate-50"
                                                >
                                                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                                                    <span className="text-[10px] text-slate-600 truncate max-w-[100px]" title={source.documentName}>
                                                        {source.documentName}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Avatar (Optional, keeps layout balanced) */}
                            {!message.isBot && (
                                <div className="flex-shrink-0 ml-2 mt-1">
                                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex-shrink-0 mr-2">
                                <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                                    <Bot className="h-4 w-4" style={{ color: primaryColor }} />
                                </div>
                            </div>
                            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor }}></div>
                                    <div className="w-2 h-2 rounded-full animate-bounce delay-150" style={{ backgroundColor: primaryColor }}></div>
                                    <div className="w-2 h-2 rounded-full animate-bounce delay-300" style={{ backgroundColor: primaryColor }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Görünmez element - Scroll'u aşağı çekmek için */}
                    <div ref={messagesEndRef} className="h-1" />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                    <form onSubmit={handleSubmit} className="flex gap-2 items-end relative">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={mode === 'education' ? t('placeholderEducation') : t('placeholderGeneral')}
                            disabled={isLoading}
                            className="flex-1 min-h-[44px] py-3 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 focus-visible:ring-offset-0 rounded-xl pr-12"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !inputValue.trim()}
                            className="absolute right-1.5 bottom-1.5 h-8 w-8 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
                            style={{ backgroundColor: buttonColor, color: textColor }}
                        >
                            {isLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                    {!customization?.hideBranding && (
                        <div className="mt-2 text-center">
                            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                                {t('aiPowered')} · Powered by
                                <span style={{ color: primaryColor, fontWeight: 600 }}>PylonChat</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}