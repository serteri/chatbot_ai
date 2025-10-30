import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { searchSimilarChunks, buildRAGContext, calculateConfidence } from '@/lib/document/search'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export const runtime = 'nodejs' // Edge'den nodejs'e geçtik
export const maxDuration = 30 // 30 saniye timeout

export async function POST(req: NextRequest) {
    try {
        const { chatbotId, conversationId, message, visitorId } = await req.json()

        if (!chatbotId || !message || !visitorId) {
            return NextResponse.json(
                { error: 'chatbotId, message ve visitorId gerekli' },
                { status: 400 }
            )
        }

        // Chatbot'u kontrol et
        const chatbot = await prisma.chatbot.findUnique({
            where: { identifier: chatbotId },
            include: {
                user: {
                    include: { subscription: true }
                }
            }
        })

        if (!chatbot) {
            return NextResponse.json(
                { error: 'Chatbot bulunamadı' },
                { status: 404 }
            )
        }

        if (!chatbot.isActive) {
            return NextResponse.json(
                { error: 'Chatbot şu anda aktif değil' },
                { status: 403 }
            )
        }

        // Subscription kontrolü
        const subscription = chatbot.user.subscription
        if (subscription) {
            if (subscription.maxConversations !== -1) {
                if (subscription.conversationsUsed >= subscription.maxConversations) {
                    return NextResponse.json(
                        { error: 'Aylık konuşma limiti doldu' },
                        { status: 403 }
                    )
                }
            }
        }

        // Conversation var mı kontrol et, yoksa oluştur
        let conversation
        if (conversationId) {
            conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        take: 10, // Son 10 mesaj
                    }
                }
            })
        }

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    chatbotId: chatbot.id,
                    visitorId,
                    status: 'active',
                },
                include: {
                    messages: true
                }
            })
        }

        // Kullanıcı mesajını kaydet
        await prisma.conversationMessage.create({
            data: {
                conversationId: conversation.id,
                role: 'user',
                content: message,
            }
        })

        // RAG: Dokümanlardan benzer içerik bul
        const searchResults = await searchSimilarChunks(chatbot.id, message, 3)
        const hasRelevantDocs = searchResults.chunks.length > 0 && searchResults.avgSimilarity > 0.3

        let systemPrompt = `Sen ${chatbot.botName} adlı bir AI asistanısın. ${chatbot.welcomeMessage}

Kullanıcılara yardımcı ol, ${chatbot.language} dilinde cevap ver.`

        let userPrompt = message

        if (hasRelevantDocs) {
            const context = buildRAGContext(searchResults.chunks)
            const confidence = calculateConfidence(searchResults.avgSimilarity)

            systemPrompt += `\n\nAşağıdaki dokümanlardan elde edilen bilgilere göre cevap ver:\n\n${context}\n\nEğer doküman bilgisi yeterli değilse, bunu belirt.`
        } else {
            systemPrompt += `\n\nDokümanlarımda bu soruyla ilgili bilgi bulamadım. ${chatbot.fallbackMessage || 'Başka nasıl yardımcı olabilirim?'}`
        }

        // AI'dan cevap al (streaming)
        const result = await streamText({
            model: openai(chatbot.aiModel),
            messages: [
                { role: 'system', content: systemPrompt },
                ...conversation.messages.slice(-5).map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content
                })),
                { role: 'user', content: userPrompt }
            ],
            temperature: chatbot.temperature,
            async onFinish({ text }) {
                // AI yanıtını kaydet
                await prisma.conversationMessage.create({
                    data: {
                        conversationId: conversation.id,
                        role: 'assistant',
                        content: text,
                        aiModel: chatbot.aiModel,
                        confidence: hasRelevantDocs ? calculateConfidence(searchResults.avgSimilarity) : 0,
                        sources: hasRelevantDocs ? {
                            chunks: searchResults.chunks.map(c => ({
                                documentName: c.documentName,
                                similarity: c.similarity,
                                content: c.content.slice(0, 200), // İlk 200 karakter
                            }))
                        } : null,
                    }
                })

                // Conversation güncelle
                await prisma.conversation.update({
                    where: { id: conversation.id },
                    data: { updatedAt: new Date() }
                })

                // Subscription usage artır
                if (subscription && subscription.maxConversations !== -1) {
                    await prisma.subscription.update({
                        where: { userId: chatbot.userId },
                        data: {
                            conversationsUsed: { increment: 1 }
                        }
                    })
                }

                // Chatbot stats güncelle
                await prisma.chatbot.update({
                    where: { id: chatbot.id },
                    data: {
                        totalConversations: { increment: conversation.messages.length === 0 ? 1 : 0 },
                        totalMessages: { increment: 2 }, // user + assistant
                    }
                })
            }
        })

        // Conversation ID'yi header'da gönder
        const response = result.toTextStreamResponse()
        response.headers.set('X-Conversation-Id', conversation.id)

        return response

    } catch (error) {
        console.error('Public chat error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}