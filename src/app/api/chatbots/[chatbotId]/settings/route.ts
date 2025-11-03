import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(
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

        const data = await request.json()

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

        // Ayarları güncelle
        const updatedChatbot = await prisma.chatbot.update({
            where: { id: chatbotId },
            data: {
                name: data.name,
                botName: data.botName,
                welcomeMessage: data.welcomeMessage,
                fallbackMessage: data.fallbackMessage,
                aiModel: data.aiModel,
                temperature: data.temperature,
                language: data.language
            }
        })

        return NextResponse.json({
            success: true,
            chatbot: updatedChatbot
        })

    } catch (error) {
        console.error('Settings update error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}