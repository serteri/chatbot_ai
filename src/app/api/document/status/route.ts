import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const documentId = searchParams.get('documentId')

        if (!documentId) {
            return NextResponse.json({ error: 'Document ID gerekli' }, { status: 400 })
        }

        // Dokümanı veritabanından bul
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            select: { status: true } // Sadece durumu çekiyoruz
        })

        if (!document) {
            // Eğer doküman bulunamazsa (silinmiş olabilir), bunu 'failed' olarak işaretleyebiliriz
            return NextResponse.json({ status: 'failed', message: 'Doküman bulunamadı.' }, { status: 404 })
        }

        // Doküman durumunu döndür (ready, processing, failed)
        return NextResponse.json({
            success: true,
            status: document.status
        })

    } catch (error) {
        console.error('Document status check error:', error)
        return NextResponse.json(
            { status: 'failed', error: 'Sunucu hatası.' },
            { status: 500 }
        )
    }
}