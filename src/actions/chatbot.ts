'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteChatbot(chatbotId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { error: 'Yetkisiz işlem' }
        }

        // Sahiplik kontrolü
        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId }
        })

        if (!chatbot || chatbot.userId !== session.user.id) {
            return { error: 'Chatbot bulunamadı veya yetkiniz yok' }
        }

        // Silme işlemi (Dokümanlar ve konuşmalar cascade ile silinir varsayıyoruz, değilse manuel silinmeli)
        await prisma.chatbot.delete({
            where: { id: chatbotId }
        })

        // Sayfayı yenile
        revalidatePath('/dashboard/chatbots')
        revalidatePath('/dashboard/education/chatbots')
        revalidatePath('/dashboard/ecommerce/chatbots')

        return { success: true }
    } catch (error) {
        console.error('Delete error:', error)
        return { error: 'Silme işlemi sırasında bir hata oluştu' }
    }
}