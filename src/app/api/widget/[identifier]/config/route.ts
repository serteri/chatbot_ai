import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ identifier: string }> }
) {
    try {
        const { identifier } = await params

        // Chatbot'u identifier ile bul
        const chatbot = await prisma.chatbot.findUnique({
            where: { identifier },
            select: {
                id: true,
                name: true,
                botName: true,
                welcomeMessage: true,
                fallbackMessage: true,
                language: true,
                isActive: true,
                widgetPrimaryColor: true,
                widgetButtonColor: true,
                widgetTextColor: true,
                widgetPosition: true,
                widgetSize: true,
                widgetLogoUrl: true,
                widgetBubbleIcon: true,
            }
        })

        if (!chatbot) {
            return NextResponse.json(
                { error: 'Chatbot not found' },
                { status: 404 }
            )
        }

        if (!chatbot.isActive) {
            return NextResponse.json(
                { error: 'Chatbot is not active' },
                { status: 403 }
            )
        }

        // Widget config'i döndür
        return NextResponse.json({
            id: chatbot.id,
            botName: chatbot.botName,
            welcomeMessage: chatbot.welcomeMessage,
            fallbackMessage: chatbot.fallbackMessage,
            language: chatbot.language,
            theme: {
                primaryColor: chatbot.widgetPrimaryColor,
                buttonColor: chatbot.widgetButtonColor,
                textColor: chatbot.widgetTextColor,
                position: chatbot.widgetPosition,
                size: chatbot.widgetSize,
                logoUrl: chatbot.widgetLogoUrl,
                bubbleIcon: chatbot.widgetBubbleIcon
            }
        })

    } catch (error) {
        console.error('Widget config error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}