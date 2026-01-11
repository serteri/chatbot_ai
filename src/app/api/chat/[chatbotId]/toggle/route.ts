import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache' // Eklendi

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

        // Chatbot'u bul ve sahipliğini kontrol et
        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId }
        })

        if (!chatbot) {
            return NextResponse.json(
                { error: 'Chatbot bulunamadı' },
                { status: 404 }
            )
        }

        if (chatbot.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu chatbot\'a erişim yetkiniz yok' },
                { status: 403 }
            )
        }

        // Durumu değiştir
        const updatedChatbot = await prisma.chatbot.update({
            where: { id: chatbotId },
            data: { isActive: !chatbot.isActive }
        })

        // Sayfa cache'ini temizle ki UI güncellensin
        // Tüm diller için revalidate ediyoruz
        revalidatePath('/[locale]/dashboard/chatbots/[chatbotId]', 'page')

        return NextResponse.json({
            success: true,
            isActive: updatedChatbot.isActive
        })

    } catch (error) {
        console.error('Toggle chatbot error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}