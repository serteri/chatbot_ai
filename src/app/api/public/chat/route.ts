import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { searchSimilarChunks, buildRAGContext, calculateConfidence } from '@/lib/document/search'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { sendNewMessageNotification } from '@/lib/email/helpers'
import {
    detectIntent,
    buildUniversityPrompt,
    buildScholarshipPrompt,
    buildLiveSupportMessage,
    buildVisaPrompt,
    buildLanguageSchoolPrompt,    // 🔥 EKLE
    buildCostOfLivingPrompt,      // 🔥 EKLE
    buildApplicationGuidePrompt   // 🔥 EKLE
} from '@/lib/services/intent-detection'
import { findSimilarUniversities } from '@/lib/services/university-search'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * Domain kontrolü fonksiyonu
 */
function isDomainAllowed(origin: string | null, allowedDomains: string[]): boolean {
    if (process.env.NODE_ENV === 'development') {
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return true
        }
    }

    if (!origin) return false

    try {
        const url = new URL(origin)
        const hostname = url.hostname

        if (allowedDomains.length === 0) return true

        return allowedDomains.some(allowed => {
            if (hostname === allowed) return true
            if (allowed.startsWith('*.')) {
                const domain = allowed.slice(2)
                return hostname.endsWith(domain)
            }
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

        // Domain kontrolü
        if (!isDomainAllowed(origin, chatbot.allowedDomains)) {
            console.log(`❌ Domain rejected: ${origin}`)
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

        // Conversation var mı kontrol et
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

        // 🎯 INTENT DETECTION (Sadece education industry için)
        let intentResult
        let specializedContext = ''

        if (chatbot.industry === 'education') {
            intentResult = await detectIntent(message)
            console.log('🎯 Intent detected:', intentResult)

            // Düşük confidence veya canlı destek talebi
            if (intentResult.needsLiveSupport || intentResult.intent === 'live_support_request') {
                const liveSupportMsg = buildLiveSupportMessage(
                    chatbot.whatsappNumber,
                    chatbot.supportEmail,
                    chatbot.liveSupportUrl
                )

                // Database'e kaydet
                await prisma.conversationMessage.create({
                    data: {
                        conversationId: conversation.id,
                        role: 'assistant',
                        content: liveSupportMsg,
                        aiModel: chatbot.aiModel,
                        confidence: intentResult.confidence,
                    }
                })

                // Canlı destek talebi oluştur
                await prisma.liveSupportRequest.create({
                    data: {
                        chatbotId: chatbot.id,
                        conversationId: conversation.id,
                        visitorId,
                        message: message,
                        status: 'pending',
                        priority: 'normal'
                    }
                })

                // Stats güncelle
                await updateStats(chatbot.id, conversation.id, subscription, chatbot.userId)

                const response = new NextResponse(liveSupportMsg)
                response.headers.set('X-Conversation-Id', conversation.id)
                if (origin) {
                    response.headers.set('Access-Control-Allow-Origin', origin)
                    response.headers.set('Access-Control-Allow-Credentials', 'true')
                }
                return response
            }

            // Üniversite önerisi
            if (intentResult.intent === 'university_recommendation') {
                const universities = await findSimilarUniversities(
                    intentResult.entities.country,
                    intentResult.entities.field,
                    5
                )

                console.log('📋 Universities found:', universities.length)

                if (universities.length > 0) {
                    const uniContext = universities.map(u =>
                        `${u.name} (${u.city}, ${u.country}) - Ranking: #${u.ranking}, Tuition: $${u.tuitionMin}-${u.tuitionMax}/year, Programs: ${u.programs.join(', ')}`
                    ).join('\n')

                    specializedContext = buildUniversityPrompt(intentResult.entities, uniContext)
                    console.log('🎓 Specialized context created')
                }
            }

            // Burs sorusu
            if (intentResult.intent === 'scholarship_inquiry') {
                const scholarships = await prisma.scholarship.findMany({
                    where: {
                        ...(intentResult.entities.country && {
                            country: { contains: intentResult.entities.country, mode: 'insensitive' }
                        }),
                    },
                    include: { university: true },
                    take: 5,
                    orderBy: { amount: 'desc' }
                })

                if (scholarships.length > 0) {
                    const scholarshipContext = scholarships.map(s =>
                        `${s.name} - ${s.university?.name || s.country}, Amount: ${s.amount ? '$' + s.amount : s.percentage + '%'}, Deadline: ${s.deadline?.toLocaleDateString()}, Type: ${s.type}`
                    ).join('\n')

                    specializedContext = buildScholarshipPrompt(intentResult.entities, scholarshipContext)
                }
            }
        }
// Vize bilgisi
        if (intentResult.intent === 'visa_information') {
            const visaInfo = await prisma.visaInfo.findMany({
                where: {
                    ...(intentResult.entities.country && {
                        country: { contains: intentResult.entities.country, mode: 'insensitive' }
                    })
                },
                take: 3
            })

            console.log('🛂 Visa info found:', visaInfo.length)

            if (visaInfo.length > 0) {
                const visaContext = visaInfo.map(v =>
                    `${v.country} - ${v.visaType}\nCost: $${v.cost}, Processing: ${v.processingTime}\nDuration: ${v.duration}\nWebsite: ${v.website}`
                ).join('\n\n')

                specializedContext = buildVisaPrompt(intentResult.entities, visaContext)
                console.log('🛂 Visa context created')
            }
        }

        // Dil okulu önerisi
        if (intentResult.intent === 'language_school_inquiry') {
            let cityQuery = intentResult.entities.city
            if (cityQuery) {
                const cityMap: Record<string, string> = {
                    'münich': 'Munich',
                    'münih': 'Munich',
                    'munich': 'Munich',
                    'new york': 'New York',
                    'toronto': 'Toronto'
                }
                cityQuery = cityMap[cityQuery.toLowerCase()] || cityQuery
            }

            const languageSchools = await prisma.languageSchool.findMany({
                where: {
                    ...(intentResult.entities.country && {
                        country: { contains: intentResult.entities.country, mode: 'insensitive' }
                    }),
                    ...(intentResult.entities.city && {
                        city: { contains: intentResult.entities.city, mode: 'insensitive' }
                    }),
                    ...(intentResult.entities.language && {
                        languages: { has: intentResult.entities.language }
                    })
                },
                take: 5
            })

            console.log('🗣️ Language schools found:', languageSchools.length)

            if (languageSchools.length > 0) {
                const schoolContext = languageSchools.map(s =>
                    `${s.name} (${s.city}, ${s.country})\nLanguages: ${s.languages.join(', ')}\nDuration: ${s.courseDuration}, Price: $${s.pricePerWeek}/week\nCertifications: ${s.certifications.join(', ')}\nWebsite: ${s.website}`
                ).join('\n\n')

                specializedContext = buildLanguageSchoolPrompt(intentResult.entities, schoolContext)
                console.log('🗣️ Language school context created')
            }
        }

        // Yaşam maliyeti
        if (intentResult.intent === 'cost_of_living') {
            const costData = await prisma.costOfLiving.findMany({
                where: {
                    ...(intentResult.entities.country && {
                        country: { contains: intentResult.entities.country, mode: 'insensitive' }
                    }),
                    ...(intentResult.entities.city && {
                        city: { contains: intentResult.entities.city, mode: 'insensitive' }
                    })
                },
                take: 3
            })

            console.log('💰 Cost of living data found:', costData.length)

            if (costData.length > 0) {
                const costContext = costData.map(c =>
                    `${c.city}, ${c.country}\nRent: ${c.currency} ${c.rent}/month, Food: ${c.currency} ${c.food}/month\nTransport: ${c.currency} ${c.transport}/month, Utilities: ${c.currency} ${c.utilities}/month\nInsurance: ${c.currency} ${c.insurance}/month, Misc: ${c.currency} ${c.miscellaneous}/month\nTotal: ${c.currency} ${c.total}/month`
                ).join('\n\n')

                specializedContext = buildCostOfLivingPrompt(intentResult.entities, costContext)
                console.log('💰 Cost of living context created')
            }
        }

        // Başvuru rehberi
        if (intentResult.intent === 'application_guide') {
            const guides = await prisma.applicationGuide.findMany({
                where: {
                    ...(intentResult.entities.country && {
                        country: { contains: intentResult.entities.country, mode: 'insensitive' }
                    })
                },
                take: 2
            })

            console.log('📝 Application guides found:', guides.length)

            if (guides.length > 0) {
                const guideContext = guides.map(g =>
                    `${g.title} (${g.country})\nTimeline: ${g.timeline}\nRequired Documents: ${g.documents.join(', ')}\nTips: ${g.tips.join('; ')}\nSteps: ${JSON.stringify(g.steps)}`
                ).join('\n\n')

                specializedContext = buildApplicationGuidePrompt(intentResult.entities, guideContext)
                console.log('📝 Application guide context created')
            }
        }
        // RAG: Dokümanlardan benzer içerik bul
        const searchResults = await searchSimilarChunks(chatbot.id, message, 3)
        const hasRelevantDocs = searchResults.chunks.length > 0 && searchResults.avgSimilarity > 0.68

        console.log('🔍 Search:', {
            query: message,
            chunks: searchResults.chunks.length,
            similarity: searchResults.avgSimilarity,
            hasRelevant: hasRelevantDocs
        })

        // System prompt oluştur
        let systemPrompt = specializedContext || `Sen ${chatbot.botName} adlı bir AI asistanısın. ${chatbot.welcomeMessage}

Kullanıcılara yardımcı ol, ${chatbot.language} dilinde cevap ver.`

        let userPrompt = message

        if (hasRelevantDocs) {
            const context = buildRAGContext(searchResults.chunks)
            systemPrompt += `\n\n📚 DOKÜMAN BİLGİLERİ:\n${context}\n\n⚠️ KURALAR:
1. Eğer soru dokümanlarla DOĞRUDAN İLGİLİyse, doküman bilgisini kullan
2. Eğer soru dokümanlarla İLGİLİ DEĞİLse veya dokümanlar yetersizse, fallback mesajı ver: "${chatbot.fallbackMessage}"
3. Genel bilgi VERME, sadece doküman bilgisi ver`
        }

        // Hiçbir kaynak yoksa fallback
        const hasAnySource = hasRelevantDocs || (specializedContext && specializedContext.length > 0)

        if (!hasAnySource) {
            const fallbackText = chatbot.fallbackMessage || 'Üzgünüm, bu konuda yardımcı olamıyorum.'

            await prisma.conversationMessage.create({
                data: {
                    conversationId: conversation.id,
                    role: 'assistant',
                    content: fallbackText,
                    aiModel: chatbot.aiModel,
                    confidence: 0,
                }
            })

            await updateStats(chatbot.id, conversation.id, subscription, chatbot.userId)

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
                        confidence: hasRelevantDocs ? calculateConfidence(searchResults.avgSimilarity) : intentResult?.confidence || 0.8,
                        sources: hasRelevantDocs ? {
                            chunks: searchResults.chunks.map(c => ({
                                documentName: c.documentName,
                                similarity: c.similarity,
                                content: c.content.slice(0, 200),
                            }))
                        } : null,
                    }
                })

                // Email notification
                const chatbotOwner = await prisma.user.findUnique({
                    where: { id: chatbot.userId },
                    select: {
                        email: true,
                        name: true,
                        emailNotifications: true,
                        notificationEmail: true
                    }
                })

                if (chatbotOwner?.emailNotifications) {
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

                await updateStats(chatbot.id, conversation.id, subscription, chatbot.userId)
            }
        })

        // CORS headers ekle
        const response = result.toTextStreamResponse()
        response.headers.set('X-Conversation-Id', conversation.id)

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

// Helper: Stats güncelle
async function updateStats(chatbotId: string, conversationId: string, subscription: any, userId: string) {
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
    })

    if (subscription && subscription.maxConversations !== -1) {
        await prisma.subscription.update({
            where: { userId },
            data: {
                conversationsUsed: { increment: 1 }
            }
        })
    }

    await prisma.chatbot.update({
        where: { id: chatbotId },
        data: {
            totalMessages: { increment: 2 },
        }
    })
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