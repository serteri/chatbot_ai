import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ chatbotId: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { chatbotId } = await params

        // Verify ownership
        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId }
        })

        if (!chatbot) {
            return NextResponse.json(
                { error: 'Chatbot not found' },
                { status: 404 }
            )
        }

        if (chatbot.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'You do not have permission to delete this chatbot' },
                { status: 403 }
            )
        }

        // Delete related records first (cascade)
        await prisma.$transaction([
            // Delete all conversations and messages
            prisma.message.deleteMany({
                where: {
                    conversation: {
                        chatbotId: chatbotId
                    }
                }
            }),
            prisma.conversation.deleteMany({
                where: { chatbotId: chatbotId }
            }),
            // Delete documents
            prisma.document.deleteMany({
                where: { chatbotId: chatbotId }
            }),
            // Delete allowed domains
            prisma.allowedDomain.deleteMany({
                where: { chatbotId: chatbotId }
            }),
            // Finally delete the chatbot
            prisma.chatbot.delete({
                where: { id: chatbotId }
            })
        ])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete chatbot error:', error)
        return NextResponse.json(
            { error: 'Failed to delete chatbot' },
            { status: 500 }
        )
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ chatbotId: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { chatbotId } = await params

        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId },
            include: {
                _count: {
                    select: {
                        documents: true,
                        conversations: true
                    }
                }
            }
        })

        if (!chatbot) {
            return NextResponse.json(
                { error: 'Chatbot not found' },
                { status: 404 }
            )
        }

        if (chatbot.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        return NextResponse.json(chatbot)
    } catch (error) {
        console.error('Get chatbot error:', error)
        return NextResponse.json(
            { error: 'Failed to get chatbot' },
            { status: 500 }
        )
    }
}
