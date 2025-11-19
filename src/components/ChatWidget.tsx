import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, FileText, Zap, BookOpen, AlertCircle } from 'lucide-react'

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
    mode?: 'document' | 'education'
}

export default function ChatWidget({ chatbotId, onClose, mode = 'document' }: ChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [chatbotName, setChatbotName] = useState('AI Assistant')
    const [welcomeMessage, setWelcomeMessage] = useState('Hello! How can I help you?')
    const [debugInfo, setDebugInfo] = useState<string>('')

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Load initial conversation or show welcome message
        if (welcomeMessage && messages.length === 0) {
            setMessages([{
                id: 'welcome',
                content: welcomeMessage,
                isBot: true,
                timestamp: new Date(),
                mode
            }])
        }
    }, [welcomeMessage, mode])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return

        // Validate chatbotId
        if (!chatbotId || chatbotId.trim() === '') {
            setDebugInfo('❌ ChatbotId boş!')
            const errorMessage: Message = {
                id: Date.now().toString(),
                content: 'Error: ChatbotId is required. Please set a valid chatbot ID.',
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

        // Debug info
        const requestData = {
            message: userMessage.content,
            chatbotId: chatbotId.trim(),
            conversationId: conversationId || null,
            mode
        }

        setDebugInfo(`🔍 Request: ${JSON.stringify(requestData, null, 2)}`)
        console.log('🔍 API Request:', requestData)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            })

            console.log('📡 Response:', {
                status: response.status,
                ok: response.ok,
                url: response.url,
                statusText: response.statusText
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('❌ API Error:', errorText)
                setDebugInfo(`❌ API Error (${response.status}): ${errorText}`)
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
            }

            const data = await response.json()
            console.log('✅ API Response Data:', data)
            setDebugInfo(`✅ Success: ${JSON.stringify(data, null, 2)}`)

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
                content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isBot: true,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
            setDebugInfo(`💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        sendMessage()
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'text-green-600'
        if (confidence >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getConfidenceText = (confidence: number) => {
        if (confidence >= 80) return 'Yüksek Güven'
        if (confidence >= 60) return 'Orta Güven'
        return 'Düşük Güven'
    }

    return (
        <Card className="h-[600px] w-full max-w-md flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                    {mode === 'education' ? (
                        <BookOpen className="h-5 w-5 text-blue-500" />
                    ) : (
                        <Bot className="h-5 w-5 text-blue-500" />
                    )}
                    <CardTitle className="text-sm font-medium">
                        {mode === 'education' ? 'Eğitim Danışmanı' : chatbotName}
                    </CardTitle>
                </div>
                {onClose && (
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        ✕
                    </Button>
                )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-3 space-y-3">
                {/* Debug Info */}
                {debugInfo && (
                    <div className="p-2 bg-gray-100 rounded text-xs max-h-20 overflow-y-auto">
                        <div className="flex items-center gap-1 mb-1">
                            <AlertCircle className="w-3 h-3" />
                            <span className="font-medium">Debug:</span>
                        </div>
                        <pre className="whitespace-pre-wrap">{debugInfo}</pre>
                    </div>
                )}

                {/* Chatbot Info */}
                <div className="text-xs text-gray-500 p-2 bg-blue-50 rounded">
                    <strong>Chatbot ID:</strong> {chatbotId || 'Not set'}<br/>
                    <strong>Mode:</strong> {mode}<br/>
                    <strong>Conversation:</strong> {conversationId || 'New'}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {messages.map((message) => (
                        <div key={message.id} className="space-y-2">
                            <div
                                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                        message.isBot
                                            ? message.content.startsWith('Error:')
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-gray-100 text-gray-800'
                                            : 'bg-blue-500 text-white'
                                    }`}
                                >
                                    <div className="flex items-start space-x-2">
                                        {message.isBot && (
                                            <div className="flex-shrink-0 mt-0.5">
                                                {message.content.startsWith('Error:') ? (
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                ) : mode === 'education' ? (
                                                    <BookOpen className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <Bot className="h-4 w-4 text-blue-500" />
                                                )}
                                            </div>
                                        )}
                                        {!message.isBot && (
                                            <div className="flex-shrink-0 mt-0.5">
                                                <User className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {message.content}
                                            </p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {formatTime(message.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RAG Sources & Confidence */}
                            {message.isBot && message.sources && message.sources.length > 0 && (
                                <div className="ml-8 space-y-2">
                                    {/* Confidence Score */}
                                    {message.confidence !== undefined && message.confidence > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <Zap className="h-3 w-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">
                        Güven:
                      </span>
                                            <span className={`text-xs font-medium ${getConfidenceColor(message.confidence)}`}>
                        %{message.confidence} ({getConfidenceText(message.confidence)})
                      </span>
                                        </div>
                                    )}

                                    {/* Sources */}
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-1">
                                            <FileText className="h-3 w-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">Kaynaklar:</span>
                                        </div>
                                        <div className="space-y-1">
                                            {message.sources.map((source, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <Badge variant="outline" className="text-xs py-0">
                                                        {source.documentName}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400">
                            %{source.similarity} eşleşme
                          </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Education Mode Indicator */}
                            {message.isBot && message.mode === 'education' && (
                                <div className="ml-8">
                                    <Badge variant="secondary" className="text-xs">
                                        <BookOpen className="h-3 w-3 mr-1" />
                                        Eğitim Modu
                                    </Badge>
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                                <div className="flex items-center space-x-2">
                                    <Bot className="h-4 w-4 text-blue-500 animate-pulse" />
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="flex space-x-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={mode === 'education' ? "Eğitim hakkında soru sorun..." : "Mesajınızı yazın..."}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isLoading || !inputValue.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}