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
        console.log('📝 Customize API Request:', { chatbotId, data });

        // Chatbot sahiplik kontrolü
        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId }
        })

        if (!chatbot || chatbot.userId !== session.user.id) {
            console.log('❌ Unauthorized or Chatbot not found:', { chatbotId, userId: session.user.id });
            return NextResponse.json(
                { error: 'Chatbot bulunamadı' },
                { status: 404 }
            )
        }

        // Widget ayarlarını güncelle
        const updatedChatbot = await prisma.chatbot.update({
            where: { id: chatbotId },
            data: {
                widgetPrimaryColor: data.widgetPrimaryColor,
                widgetButtonColor: data.widgetButtonColor,
                widgetTextColor: data.widgetTextColor,
                widgetPosition: data.widgetPosition,
                widgetSize: data.widgetSize,
                widgetLogoUrl: data.widgetLogoUrl,
                botName: data.botName,
                welcomeMessage: data.welcomeMessage,
                hideBranding: data.hideBranding ?? false
            }
        })

        console.log('✅ Chatbot updated successfully:', updatedChatbot.widgetPrimaryColor);

        return NextResponse.json({
            success: true,
            chatbot: updatedChatbot
        })

    } catch (error) {
        console.error('Customize error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}