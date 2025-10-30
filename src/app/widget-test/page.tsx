'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Bot, Send, X, Minimize2 } from 'lucide-react'

export default function WidgetTestPage() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Chatbot ID'sini buraya yapıştır (chatbot detay sayfasından alacaksın)
    const CHATBOT_ID = "PTP2l7aNOvlG"

    const visitorId = typeof window !== 'undefined'
        ? localStorage.getItem('visitorId') || (() => {
        const id = 'visitor_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('visitorId', id)
        return id
    })()
        : 'visitor_temp'

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        try {
            const response = await fetch('/api/public/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatbotId: CHATBOT_ID,
                    conversationId,
                    message: userMessage,
                    visitorId,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Bir hata oluştu')
            }

            // Conversation ID'yi al
            const convId = response.headers.get('X-Conversation-Id')
            if (convId && !conversationId) {
                setConversationId(convId)
            }

            // Stream okuma
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
                { role: 'assistant', content: 'Üzgünüm, bir hata oluştu: ' + error.message }
            ])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Chatbot Widget Test</h1>
                <p className="text-gray-600 mb-8">
                    Bu sayfa chatbot'unuzu test etmek içindir. Sağ alttaki chat butonuna tıklayın.
                </p>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Test Talimatları:</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Chatbot detay sayfasından <code className="bg-gray-200 px-2 py-1 rounded">identifier</code> kodunu kopyalayın</li>
                        <li>Bu dosyada (widget-test/page.tsx) <code className="bg-gray-200 px-2 py-1 rounded">CHATBOT_ID</code> değişkenine yapıştırın</li>
                        <li>Sayfayı yenileyin</li>
                        <li>Sağ alttaki chat butonuna tıklayın ve test edin!</li>
                    </ol>
                </Card>
            </div>

            {/* Chat Widget */}
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
                >
                    <Bot className="h-8 w-8" />
                </button>
            ) : (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Bot className="h-6 w-6" />
                            <span className="font-semibold">Chat Asistanı</span>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-blue-700 p-1 rounded"
                            >
                                <Minimize2 className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-blue-700 p-1 rounded"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-8">
                                <Bot className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p>Merhaba! Size nasıl yardımcı olabilirim?</p>
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
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-900'
                                    }`}
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
                                placeholder="Mesajınızı yazın..."
                                disabled={isLoading}
                            />
                            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}