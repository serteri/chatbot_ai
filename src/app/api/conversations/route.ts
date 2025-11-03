import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Query params
        const searchParams = req.nextUrl.searchParams
        const chatbotId = searchParams.get('chatbotId')
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        // Filter oluştur
        const where: any = {
            chatbot: {
                userId: session.user.id  // Sadece kendi konuşmaları
            }
        }

        if (chatbotId) {
            where.chatbotId = chatbotId
        }

        if (status) {
            where.status = status
        }

        // Konuşmaları getir
        const conversations = await prisma.conversation.findMany({
            where,
            include: {
                chatbot: {
                    select: {
                        name: true,
                        botName: true
                    }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: { messages: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        })

        // Toplam sayı
        const total = await prisma.conversation.count({ where })

        return NextResponse.json({
            conversations: conversations.map(conv => ({
                id: conv.id,
                chatbotName: conv.chatbot.name,
                visitorId: conv.visitorId,
                status: conv.status,
                messageCount: conv._count.messages,
                lastMessage: conv.messages[0]?.content.substring(0, 100) || '',
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Conversations error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}