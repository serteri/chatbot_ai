import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { processDocument, getDocumentType } from '@/lib/document/processor'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 saniye timeout

export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File
        const chatbotId = formData.get('chatbotId') as string

        if (!file) {
            return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
        }

        if (!chatbotId) {
            return NextResponse.json({ error: 'Chatbot ID gerekli' }, { status: 400 })
        }

        // Chatbot kontrolü
        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId },
            include: {
                user: {
                    include: { subscription: true }
                }
            }
        })

        if (!chatbot || chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Chatbot bulunamadı' }, { status: 404 })
        }

        // Dosya tipi kontrolü
        const docType = getDocumentType(file.name)
        if (docType === 'unknown') {
            return NextResponse.json(
                { error: 'Desteklenmeyen dosya tipi. Sadece PDF, DOCX, TXT desteklenir.' },
                { status: 400 }
            )
        }

        // Dosya boyutu kontrolü (10MB)
        const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'Dosya çok büyük. Maksimum 10MB.' },
                { status: 400 }
            )
        }

        // Doküman limiti kontrolü
        const documentCount = await prisma.document.count({
            where: { chatbotId }
        })

        const subscription = chatbot.user.subscription
        if (subscription) {
            if (subscription.maxDocuments !== -1 && documentCount >= subscription.maxDocuments) {
                return NextResponse.json(
                    { error: `Maksimum ${subscription.maxDocuments} doküman yükleyebilirsiniz. Plan yükseltin.` },
                    { status: 403 }
                )
            }
        }

        // Dosyayı buffer'a çevir
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Database'e önce kaydet (processing durumu)
        const document = await prisma.document.create({
            data: {
                chatbotId,
                name: file.name,
                type: docType,
                size: file.size,
                status: 'processing',
            }
        })

        // Background'da process et (async)
        processDocumentAsync(document.id, buffer, file.name, chatbotId)

        return NextResponse.json(
            {
                success: true,
                document: {
                    id: document.id,
                    name: document.name,
                    status: 'processing',
                },
                message: 'Doküman yüklendi, işleniyor...'
            },
            { status: 201 }
        )

    } catch (error) {
        console.error('Document upload error:', error)
        return NextResponse.json(
            { error: 'Dosya yüklenirken bir hata oluştu' },
            { status: 500 }
        )
    }
}

/**
 * Dokümanı arka planda işle
 */
async function processDocumentAsync(
    documentId: string,
    buffer: Buffer,
    filename: string,
    chatbotId: string
) {
    try {
        console.log(`Processing document ${documentId}...`)

        // Dokümanı işle
        const result = await processDocument(buffer, filename)

        // Chunks'ları database'e kaydet
        const chunks = result.chunks.map((chunk, index) => ({
            documentId,
            content: chunk,
            embedding: Buffer.from(new Float32Array(result.embeddings[index]).buffer),
            chunkIndex: index,
            tokenCount: Math.ceil(chunk.length / 4),
        }))

        // Transaction ile kaydet
        await prisma.$transaction([
            // Document'i güncelle
            prisma.document.update({
                where: { id: documentId },
                data: {
                    status: 'ready',
                    rawContent: result.text,
                    totalChunks: result.chunks.length,
                    totalTokens: result.tokenCount,
                }
            }),
            // Chunks'ları kaydet
            prisma.documentChunk.createMany({
                data: chunks
            })
        ])

        // Chatbot'un doküman sayısını güncelle
        await prisma.chatbot.update({
            where: { id: chatbotId },
            data: {
                updatedAt: new Date()
            }
        })

        console.log(`Document ${documentId} processed successfully!`)

    } catch (error) {
        console.error(`Document processing failed for ${documentId}:`, error)

        // Hata durumunda document'i güncelle
        await prisma.document.update({
            where: { id: documentId },
            data: {
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : 'İşleme hatası',
            }
        })
    }
}