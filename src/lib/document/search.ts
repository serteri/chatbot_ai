import { prisma } from '@/lib/db/prisma'
import { OpenAIEmbeddings } from '@langchain/openai'
import { cosineSimilarity } from './processor'

/**
 * Kullanıcı sorusuna en yakın doküman chunk'larını bul (RAG)
 */
export async function searchSimilarChunks(
    chatbotId: string,
    query: string,
    topK: number = 3
): Promise<{
    chunks: Array<{
        content: string
        documentName: string
        similarity: number
    }>
    avgSimilarity: number
}> {
    try {
        // 1. Query'i embedding'e çevir
        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: 'text-embedding-3-small',
        })

        const queryVector = await embeddings.embedQuery(query)

        // 2. Chatbot'un tüm dokümanlarını ve chunk'larını al
        const documents = await prisma.document.findMany({
            where: {
                chatbotId,
                status: 'ready', // Sadece hazır dokümanlar
            },
            include: {
                chunks: true
            }
        })

        if (documents.length === 0) {
            return { chunks: [], avgSimilarity: 0 }
        }

        // 3. Her chunk için similarity hesapla
        const allChunks = documents.flatMap(doc =>
            doc.chunks.map(chunk => ({
                content: chunk.content,
                documentName: doc.name,
                embedding: chunk.embedding,
            }))
        )

        const chunksWithSimilarity = allChunks.map(chunk => {
            // Buffer'dan Float32Array'e çevir
            const chunkVector = Array.from(new Float32Array(chunk.embedding as any))
            const similarity = cosineSimilarity(queryVector, chunkVector)

            return {
                content: chunk.content,
                documentName: chunk.documentName,
                similarity,
            }
        })

        // 4. En yüksek similarity'e göre sırala ve topK kadar al
        const topChunks = chunksWithSimilarity
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK)

        // 5. Ortalama similarity hesapla
        const avgSimilarity = topChunks.length > 0
            ? topChunks.reduce((sum, c) => sum + c.similarity, 0) / topChunks.length
            : 0

        return {
            chunks: topChunks,
            avgSimilarity,
        }

    } catch (error) {
        console.error('RAG search error:', error)
        throw error
    }
}

/**
 * RAG context oluştur (AI'ya gönderilecek)
 */
export function buildRAGContext(
    chunks: Array<{ content: string; documentName: string; similarity: number }>
): string {
    if (chunks.length === 0) {
        return ''
    }

    const context = chunks
        .map((chunk, i) => {
            return `[Kaynak ${i + 1}: ${chunk.documentName}]\n${chunk.content}`
        })
        .join('\n\n---\n\n')

    return context
}

/**
 * Cevap için güven skoru hesapla
 */
export function calculateConfidence(avgSimilarity: number): number {
    // 0-1 arası normalize et
    // 0.8+ çok iyi
    // 0.6-0.8 iyi
    // 0.4-0.6 orta
    // 0.4- düşük

    return Math.min(avgSimilarity * 1.25, 1) // Biraz boost ver
}