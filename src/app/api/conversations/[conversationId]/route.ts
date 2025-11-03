import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const session = await auth()
        const { conversationId } = await params

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Konuşmayı getir
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                chatbot: {
                    select: {
                        id: true,
                        name: true,
                        botName: true,
                        userId: true
                    }
                },
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        })

        if (!conversation) {
            return NextResponse.json(
                { error: 'Konuşma bulunamadı' },
                { status: 404 }
            )
        }

        // Sahiplik kontrolü
        if (conversation.chatbot.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu konuşmaya erişim yetkiniz yok' },
                { status: 403 }
            )
        }

        return NextResponse.json({
            conversation: {
                id: conversation.id,
                chatbotId: conversation.chatbotId,
                chatbotName: conversation.chatbot.name,
                botName: conversation.chatbot.botName,
                visitorId: conversation.visitorId,
                status: conversation.status,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt,
                messages: conversation.messages.map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    confidence: msg.confidence,
                    sources: msg.sources,
                    createdAt: msg.createdAt
                }))
            }
        })

    } catch (error) {
        console.error('Conversation detail error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}