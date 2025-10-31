import { prisma } from '@/lib/db/prisma'
import { openai } from '@/lib/ai/openai'

/**
 * Query için embedding oluştur ve benzer chunk'ları bul
 */
export async function searchSimilarChunks(
    chatbotId: string,
    query: string,
    limit: number = 3
) {
    try {
        // Query için embedding oluştur
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: query,
        })

        const queryEmbedding = embeddingResponse.data[0].embedding

        // Chatbot'a ait tüm chunk'ları al
        const chunks = await prisma.documentChunk.findMany({
            where: {
                document: {
                    chatbotId,
                    status: 'ready'
                }
            },
            include: {
                document: {
                    select: {
                        name: true,
                        id: true
                    }
                }
            }
        })

        if (chunks.length === 0) {
            return {
                chunks: [],
                avgSimilarity: 0
            }
        }

        // Her chunk için cosine similarity hesapla
        const scoredChunks = chunks.map(chunk => {
            // Buffer'dan Float32Array'e çevir
            const chunkEmbedding = new Float32Array(
                (chunk.embedding as Buffer).buffer,
                (chunk.embedding as Buffer).byteOffset,
                (chunk.embedding as Buffer).length / 4
            )

            const similarity = cosineSimilarity(queryEmbedding, Array.from(chunkEmbedding))

            return {
                documentId: chunk.document.id,
                documentName: chunk.document.name,
                content: chunk.content,
                similarity,
                chunkIndex: chunk.chunkIndex
            }
        })

        // Similarity'e göre sırala ve en iyi sonuçları al
        const topChunks = scoredChunks
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .filter(c => c.similarity > 0.3) // Minimum threshold

        const avgSimilarity = topChunks.length > 0
            ? topChunks.reduce((sum, c) => sum + c.similarity, 0) / topChunks.length
            : 0

        return {
            chunks: topChunks,
            avgSimilarity
        }

    } catch (error) {
        console.error('Search similar chunks error:', error)
        return {
            chunks: [],
            avgSimilarity: 0
        }
    }
}

/**
 * RAG context oluştur
 */
export function buildRAGContext(chunks: Array<{ documentName: string; content: string; similarity: number }>) {
    if (chunks.length === 0) return ''

    return chunks.map((chunk, i) =>
        `[Doküman: ${chunk.documentName}]\n${chunk.content}\n`
    ).join('\n---\n\n')
}

/**
 * Confidence score hesapla
 */
export function calculateConfidence(avgSimilarity: number): number {
    // 0.3 - 1.0 arası similarity'i 0-100 arası confidence'a çevir
    if (avgSimilarity < 0.3) return 0
    if (avgSimilarity > 0.9) return 100

    return Math.round(((avgSimilarity - 0.3) / 0.6) * 100)
}

/**
 * Cosine similarity hesapla
 */
function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error('Vectors must have same length')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Basit text-based search (fallback - embedding yoksa)
 */
export async function searchDocuments(
    chatbotId: string,
    query: string,
    limit: number = 3
) {
    try {
        const documents = await prisma.document.findMany({
            where: {
                chatbotId,
                status: 'ready'
            },
            select: {
                id: true,
                name: true,
                rawContent: true,
            }
        })

        if (documents.length === 0) {
            return []
        }

        const queryWords = query.toLowerCase().split(/\s+/)

        const scoredDocs = documents.map(doc => {
            const content = (doc.rawContent || '').toLowerCase()
            let score = 0

            for (const word of queryWords) {
                const occurrences = (content.match(new RegExp(word, 'g')) || []).length
                score += occurrences
            }

            return {
                id: doc.id,
                name: doc.name,
                content: doc.rawContent || '',
                score
            }
        })

        return scoredDocs
            .filter(doc => doc.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)

    } catch (error) {
        console.error('Document search error:', error)
        return []
    }
}