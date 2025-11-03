import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { searchSimilarChunks, buildRAGContext, calculateConfidence } from '@/lib/document/search'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { sendNewMessageNotification } from '@/lib/email/helpers'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * Domain kontrolü fonksiyonu
 */
function isDomainAllowed(origin: string | null, allowedDomains: string[]): boolean {
    // Development için localhost'a izin ver
    if (process.env.NODE_ENV === 'development') {
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return true
        }
    }

    // Origin yoksa red et
    if (!origin) return false

    try {
        const url = new URL(origin)
        const hostname = url.hostname

        // Allowed domains boşsa, herkese açık demektir
        if (allowedDomains.length === 0) return true

        // Wildcard ve exact match kontrolü
        return allowedDomains.some(allowed => {
            // Exact match
            if (hostname === allowed) return true

            // Wildcard match (*.example.com)
            if (allowed.startsWith('*.')) {
                const domain = allowed.slice(2)
                return hostname.endsWith(domain)
            }

            // Subdomain match (example.com -> *.example.com)
            return hostname.endsWith(`.${allowed}`)
        })
    } catch {
        return false
    }
}

export async function POST(req: NextRequest) {
    try {
        const { chatbotId, conversationId, message, visitorId } = await req.json()

        if (!chatbotId || !message || !visitorId) {
            return NextResponse.json(
                { error: 'chatbotId, message ve visitorId gerekli' },
                { status: 400 }
            )
        }

        // Origin kontrolü
        const origin = req.headers.get('origin') || req.headers.get('referer')

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

        // 🔒 DOMAIN KONTROLÜ
        if (!isDomainAllowed(origin, chatbot.allowedDomains)) {
            console.log(`❌ Domain rejected: ${origin}`)
            console.log(`✅ Allowed domains: ${chatbot.allowedDomains.join(', ')}`)

            return NextResponse.json(
                { error: 'Bu domain için yetkilendirilmemiş' },
                { status: 403 }
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
                        take: 10,
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
        const hasRelevantDocs = searchResults.chunks.length > 0 && searchResults.avgSimilarity > 0.68

        console.log('🔍 Search:', {
            query: message,
            chunks: searchResults.chunks.length,
            similarity: searchResults.avgSimilarity,
            hasRelevant: hasRelevantDocs
        })

        let systemPrompt = `Sen ${chatbot.botName} adlı bir AI asistanısın. ${chatbot.welcomeMessage}

Kullanıcılara yardımcı ol, ${chatbot.language} dilinde cevap ver.`

        let userPrompt = message

        if (hasRelevantDocs) {
            const context = buildRAGContext(searchResults.chunks)
            systemPrompt += `\n\n📚 DOKÜMAN BİLGİLERİ:\n${context}\n\n⚠️ KURALAR:
1. Eğer soru dokümanlarla DOĞRUDAN İLGİLİyse, doküman bilgisini kullan
2. Eğer soru dokümanlarla İLGİLİ DEĞİLse veya dokümanlar yetersizse, fallback mesajı ver: "${chatbot.fallbackMessage}"
3. Genel bilgi VERME, sadece doküman bilgisi ver`
        }


        // 📌 Dokümanda bilgi yoksa direkt fallback
        if (!hasRelevantDocs) {
            const fallbackText = chatbot.fallbackMessage || 'Üzgünüm, bu konuda yardımcı olamıyorum.'

            // Database'e kaydet
            await prisma.conversationMessage.create({
                data: {
                    conversationId: conversation.id,
                    role: 'assistant',
                    content: fallbackText,
                    aiModel: chatbot.aiModel,
                    confidence: 0,
                    sources: null,
                }
            })

            // Stats güncelle
            await prisma.conversation.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() }
            })

            await prisma.chatbot.update({
                where: { id: chatbot.id },
                data: {
                    totalMessages: { increment: 2 },
                }
            })

            // Direkt fallback text'i dön
            const response = new NextResponse(fallbackText)
            response.headers.set('X-Conversation-Id', conversation.id)
            if (origin) {
                response.headers.set('Access-Control-Allow-Origin', origin)
                response.headers.set('Access-Control-Allow-Credentials', 'true')
            }
            return response
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
                                content: c.content.slice(0, 200),
                            }))
                        } : null,
                    }
                })
                const chatbotOwner = await prisma.user.findUnique({
                    where: { id: chatbot.userId },
                    select: {
                        email: true,
                        name: true,
                        emailNotifications: true,      // ← YENİ
                        notificationEmail: true        // ← YENİ
                    }
                })

                if (chatbotOwner?.emailNotifications) {  // ← Kontrol ekle
                    const emailTo = chatbotOwner.notificationEmail || chatbotOwner.email

                    if (emailTo) {
                        await sendNewMessageNotification({
                            to: emailTo,
                            chatbotName: chatbot.name,
                            visitorId,
                            message: userPrompt,
                            conversationId: conversation.id
                        }).catch(err => console.error('Email failed:', err))
                    }
                }
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
                        totalMessages: { increment: 2 },
                    }
                })
            }
        })

        // CORS headers ekle
        const response = result.toTextStreamResponse()
        response.headers.set('X-Conversation-Id', conversation.id)

        // Origin'e göre CORS header ekle
        if (origin) {
            response.headers.set('Access-Control-Allow-Origin', origin)
            response.headers.set('Access-Control-Allow-Credentials', 'true')
        }

        return response

    } catch (error) {
        console.error('Public chat error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin')

    const response = new NextResponse(null, { status: 200 })

    if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.set('Access-Control-Allow-Credentials', 'true')
        response.headers.set('Access-Control-Max-Age', '86400')
    }

    return response
}