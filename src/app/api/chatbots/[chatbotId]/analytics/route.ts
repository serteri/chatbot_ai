import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatbotId: string }> }
) {
    try {
        const session = await auth()
        const { chatbotId } = await params

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Chatbot sahiplik kontrolü
        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId }
        })

        if (!chatbot || chatbot.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Chatbot bulunamadı' },
                { status: 404 }
            )
        }

        // Tarih aralıkları
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const last7Days = new Date(today)
        last7Days.setDate(last7Days.getDate() - 7)
        const last30Days = new Date(today)
        last30Days.setDate(last30Days.getDate() - 30)

        // 1. Genel İstatistikler
        const totalConversations = await prisma.conversation.count({
            where: { chatbotId }
        })

        const todayConversations = await prisma.conversation.count({
            where: {
                chatbotId,
                createdAt: { gte: today }
            }
        })

        const totalMessages = await prisma.conversationMessage.count({
            where: {
                conversation: { chatbotId }
            }
        })

        const avgMessagesPerConversation = totalConversations > 0
            ? Math.round(totalMessages / totalConversations)
            : 0

        // 2. Son 7 Gün Grafiği
        const last7DaysConversations = await prisma.conversation.findMany({
            where: {
                chatbotId,
                createdAt: { gte: last7Days }
            },
            select: {
                createdAt: true
            }
        })

        // Günlere göre grupla
        const dailyData: Record<string, number> = {}
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            dailyData[dateStr] = 0
        }

        last7DaysConversations.forEach(conv => {
            const dateStr = conv.createdAt.toISOString().split('T')[0]
            if (dailyData[dateStr] !== undefined) {
                dailyData[dateStr]++
            }
        })

        const chartData = Object.entries(dailyData).map(([date, count]) => ({
            date,
            conversations: count
        }))

        // 3. Saatlik Dağılım (bugün)
        const todayMessages = await prisma.conversationMessage.findMany({
            where: {
                conversation: { chatbotId },
                createdAt: { gte: today }
            },
            select: {
                createdAt: true
            }
        })

        const hourlyData: Record<number, number> = {}
        for (let i = 0; i < 24; i++) {
            hourlyData[i] = 0
        }

        todayMessages.forEach(msg => {
            const hour = msg.createdAt.getHours()
            hourlyData[hour]++
        })

        const hourlyChartData = Object.entries(hourlyData).map(([hour, count]) => ({
            hour: `${hour}:00`,
            messages: count
        }))

        // 4. En Çok Sorulan Sorular (son 30 gün)
        const recentMessages = await prisma.conversationMessage.findMany({
            where: {
                conversation: {
                    chatbotId,
                    createdAt: { gte: last30Days }
                },
                role: 'user'
            },
            select: {
                content: true
            },
            take: 100
        })

        // Kelime sıklığı analizi (basit)
        const wordCount: Record<string, number> = {}
        recentMessages.forEach(msg => {
            const words = msg.content.toLowerCase()
                .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, '')
                .split(/\s+/)
                .filter(w => w.length > 3) // 3 harften uzun kelimeler

            words.forEach(word => {
                wordCount[word] = (wordCount[word] || 0) + 1
            })
        })

        const topQueries = Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ query: word, count }))

        // 5. Son Konuşmalar
        const recentConversations = await prisma.conversation.findMany({
            where: { chatbotId },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: { messages: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        // 6. Performans Metrikleri
        const messagesWithConfidence = await prisma.conversationMessage.findMany({
            where: {
                conversation: { chatbotId },
                role: 'assistant',
                confidence: { not: null }
            },
            select: {
                confidence: true
            }
        })

        const avgConfidence = messagesWithConfidence.length > 0
            ? messagesWithConfidence.reduce((sum, m) => sum + (m.confidence || 0), 0) / messagesWithConfidence.length
            : 0

        const messagesWithSources = await prisma.conversationMessage.count({
            where: {
                conversation: { chatbotId },
                role: 'assistant',
                sources: { not: null }
            }
        })

        const documentUsageRate = totalMessages > 0
            ? Math.round((messagesWithSources / totalMessages) * 100)
            : 0

        // Response oluştur
        return NextResponse.json({
            overview: {
                totalConversations,
                todayConversations,
                totalMessages,
                avgMessagesPerConversation,
                avgConfidence: Math.round(avgConfidence * 100),
                documentUsageRate
            },
            charts: {
                daily: chartData,
                hourly: hourlyChartData
            },
            topQueries,
            recentConversations: recentConversations.map(conv => ({
                id: conv.id,
                visitorId: conv.visitorId,
                status: conv.status,
                messageCount: conv._count.messages,
                lastMessage: conv.messages[0]?.content.substring(0, 100) || '',
                createdAt: conv.createdAt
            }))
        })

    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json(
            { error: 'İstatistikler yüklenirken hata oluştu' },
            { status: 500 }
        )
    }
}