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

        const { domains } = await request.json()

        if (!Array.isArray(domains)) {
            return NextResponse.json(
                { error: 'domains bir array olmalı' },
                { status: 400 }
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

        // Domain'leri güncelle
        const updatedChatbot = await prisma.chatbot.update({
            where: { id: chatbotId },
            data: {
                allowedDomains: domains
            }
        })

        return NextResponse.json({
            success: true,
            domains: updatedChatbot.allowedDomains
        })

    } catch (error) {
        console.error('Domain update error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}