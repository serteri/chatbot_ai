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

        console.log('Delete chatbot request for ID:', chatbotId)

        // Verify ownership
        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId }
        })

        if (!chatbot) {
            console.log('Chatbot not found:', chatbotId)
            return NextResponse.json(
                { error: 'Chatbot not found' },
                { status: 404 }
            )
        }

        if (chatbot.userId !== session.user.id) {
            console.log('Permission denied for chatbot:', chatbotId, 'user:', session.user.id)
            return NextResponse.json(
                { error: 'You do not have permission to delete this chatbot' },
                { status: 403 }
            )
        }

        // Most relations have onDelete: Cascade, so just delete the chatbot
        // The database will automatically delete:
        // - Documents (and DocumentChunks via cascade)
        // - Conversations (and ConversationMessages via cascade)
        // - ChatbotAnalytics
        // - LiveSupportRequest
        // - TemplatePurchase (will be SetNull, not deleted)

        // Delete the chatbot - cascades will handle related records
        await prisma.chatbot.delete({
            where: { id: chatbotId }
        })

        console.log('Chatbot deleted successfully:', chatbotId)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete chatbot error:', error)
        return NextResponse.json(
            { error: 'Failed to delete chatbot', details: error instanceof Error ? error.message : 'Unknown error' },
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

export async function PATCH(
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
        const body = await req.json()

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
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        // Allowed fields to update
        const allowedUpdates = [
            'name', 'botName', 'welcomeMessage', 'fallbackMessage',
            'language', 'aiModel', 'temperature', 'widgetPosition',
            'widgetPrimaryColor', 'widgetButtonColor', 'widgetTextColor'
        ]

        const updates: any = {}
        for (const key of Object.keys(body)) {
            if (allowedUpdates.includes(key)) {
                updates[key] = body[key]
            }
        }

        // Update chatbot
        const updatedChatbot = await prisma.chatbot.update({
            where: { id: chatbotId },
            data: updates
        })

        return NextResponse.json(updatedChatbot)

    } catch (error) {
        console.error('Update chatbot error:', error)
        return NextResponse.json(
            { error: 'Failed to update chatbot' },
            { status: 500 }
        )
    }
}
