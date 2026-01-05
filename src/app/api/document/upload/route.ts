import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { processDocument, getDocumentType } from '@/lib/document/processor'
import crypto from 'crypto' // ID oluşturmak için gerekli

export const runtime = 'nodejs'
export const maxDuration = 60

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

        // Background'da process et (await kullanmıyoruz, asenkron devam etsin)
        processDocumentAsync(document.id, buffer, file.name, chatbotId)

        return NextResponse.json(
            {
                success: true,
                documentId: document.id, // Frontend polling için ID dönüyoruz
                message: 'Doküman yüklendi, işleniyor...'
            },
            { status: 201 }
        )

    } catch (error) {
        console.error('Document upload error:', error)
        return NextResponse.json({ error: 'Dosya yüklenirken bir hata oluştu' }, { status: 500 })
    }
}

/**
 * Dokümanı arka planda işle ve Vektör Veritabanına kaydet
 */
async function processDocumentAsync(
    documentId: string,
    buffer: Buffer,
    filename: string,
    chatbotId: string
) {
    try {
        console.log(`Processing document ${documentId}...`)

        console.time('AI_Processing_Time');
        const result = await processDocument(buffer, filename)
        console.timeEnd('AI_Processing_Time');

        // ✅ DÜZELTME: Raw SQL için Insert Sorgularını Hazırla
        // createMany yerine $executeRaw kullanıyoruz çünkü 'Unsupported' tipi standart create ile çalışmaz.

        const chunkInserts = result.chunks.map((chunk, index) => {
            const chunkId = crypto.randomUUID(); // Manuel ID oluşturuyoruz
            const embeddingArray = result.embeddings[index];
            const tokenCount = Math.ceil(chunk.length / 4);

            // Vektörü string formatına çevir: "[0.123, 0.456, ...]"
            const embeddingString = `[${embeddingArray.join(',')}]`;

            // SQL Sorgusu: Vektör tipine cast ediyoruz (::vector)
            return prisma.$executeRaw`
                INSERT INTO "DocumentChunk" ("id", "documentId", "content", "chunkIndex", "tokenCount", "embedding", "createdAt")
                VALUES (${chunkId}, ${documentId}, ${chunk}, ${index}, ${tokenCount}, ${embeddingString}::vector, NOW())
            `;
        });

        console.time('DB_Transaction_Time');

        // Transaction ile hem durumu güncelle hem de parçaları ekle
        await prisma.$transaction([
            // 1. Doküman durumunu güncelle
            prisma.document.update({
                where: { id: documentId },
                data: {
                    status: 'ready',
                    rawContent: result.text,
                    totalChunks: result.chunks.length,
                    totalTokens: result.tokenCount,
                }
            }),
            // 2. Hazırlanan tüm INSERT sorgularını çalıştır
            ...chunkInserts
        ]);

        console.timeEnd('DB_Transaction_Time');

        // Chatbot güncellenme tarihini yenile
        await prisma.chatbot.update({
            where: { id: chatbotId },
            data: { updatedAt: new Date() }
        })

        console.log(`Document ${documentId} processed successfully!`)

    } catch (error) {
        console.error(`Document processing failed for ${documentId}:`, error)

        await prisma.document.update({
            where: { id: documentId },
            data: {
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : 'İşleme hatası',
            }
        })
    }
}