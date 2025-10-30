import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ documentId: string }> }
) {
    try {
        const { documentId } = await params
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: {
                chatbot: true
            }
        })

        if (!document) {
            return NextResponse.json({ error: 'Doküman bulunamadı' }, { status: 404 })
        }

        if (document.chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
        }

        // Dokümanı ve chunk'ları sil (cascade delete)
        await prisma.document.delete({
            where: { id: documentId }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Document delete error:', error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
    }
}