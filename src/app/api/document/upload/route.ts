import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { processDocument, getDocumentType } from '@/lib/document/processor'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 dakika - Pro plan için maksimum

export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File
        const chatbotId = formData.get('chatbotId') as string

        if (!file || !chatbotId) {
            return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
        }

        // Chatbot kontrolü
        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId },
            include: { user: { include: { subscription: true } } }
        })

        if (!chatbot || chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Chatbot bulunamadı' }, { status: 404 })
        }

        const docType = getDocumentType(file.name)
        if (docType === 'unknown') {
            return NextResponse.json({ error: 'Desteklenmeyen dosya tipi.' }, { status: 400 })
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

        // ✅ DÜZELTME: İşlemeyi senkron olarak yap
        // Vercel serverless'da background job çalışmaz
        // Bu yüzden işlemeyi await ile beklemeliyiz
        try {
            await processDocumentSync(document.id, buffer, file.name, chatbotId)

            return NextResponse.json(
                {
                    success: true,
                    documentId: document.id,
                    status: 'ready',
                    message: 'Doküman başarıyla işlendi!'
                },
                { status: 201 }
            )
        } catch (processingError) {
            console.error('Processing error:', processingError)
            return NextResponse.json(
                {
                    success: true,
                    documentId: document.id,
                    status: 'failed',
                    message: 'Doküman yüklendi ancak işleme başarısız oldu.'
                },
                { status: 201 }
            )
        }

    } catch (error) {
        console.error('Document upload error:', error)
        return NextResponse.json({ error: 'Dosya yüklenirken bir hata oluştu' }, { status: 500 })
    }
}

/**
 * Dokümanı senkron olarak işle ve Vektör Veritabanına kaydet
 */
async function processDocumentSync(
    documentId: string,
    buffer: Buffer,
    filename: string,
    chatbotId: string
) {
    const startTime = Date.now()
    console.log(`[DOC] Processing document ${documentId} (${filename})...`)

    try {
        // 1. Dokümanı işle (text çıkar, chunk'la, embedding oluştur)
        console.log(`[DOC] Step 1: Extracting text and creating embeddings...`)
        const result = await processDocument(buffer, filename)

        const extractTime = Date.now() - startTime
        console.log(`[DOC] Step 1 completed in ${extractTime}ms - ${result.chunks.length} chunks created`)

        // 2. Chunk'ları veritabanına kaydet
        console.log(`[DOC] Step 2: Saving ${result.chunks.length} chunks to database...`)

        const chunkInserts = result.chunks.map((chunk, index) => {
            const chunkId = crypto.randomUUID();
            const embeddingArray = result.embeddings[index];
            const tokenCount = Math.ceil(chunk.length / 4);
            const embeddingString = `[${embeddingArray.join(',')}]`;

            return prisma.$executeRaw`
                INSERT INTO "DocumentChunk" ("id", "documentId", "content", "chunkIndex", "tokenCount", "embedding", "createdAt")
                VALUES (${chunkId}, ${documentId}, ${chunk}, ${index}, ${tokenCount}, ${embeddingString}::vector, NOW())
            `;
        });

        await prisma.$transaction([
            prisma.document.update({
                where: { id: documentId },
                data: {
                    status: 'ready',
                    rawContent: result.text,
                    totalChunks: result.chunks.length,
                    totalTokens: result.tokenCount,
                }
            }),
            ...chunkInserts
        ]);

        // 3. Chatbot'u güncelle
        await prisma.chatbot.update({
            where: { id: chatbotId },
            data: { updatedAt: new Date() }
        })

        const totalTime = Date.now() - startTime
        console.log(`[DOC] ✅ Document ${documentId} processed successfully in ${totalTime}ms!`)

    } catch (error) {
        console.error(`[DOC] ❌ Document processing failed for ${documentId}:`, error)

        await prisma.document.update({
            where: { id: documentId },
            data: {
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : 'İşleme hatası',
            }
        })

        throw error
    }
}