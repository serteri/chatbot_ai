import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

/**
 * Metni OpenAI embedding'e çevir
 */
export async function getEmbedding(text: string): Promise<number[]> {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        })

        return response.data[0].embedding
    } catch (error) {
        console.error('Embedding error:', error)
        throw error
    }
}

/**
 * Cosine similarity hesapla (0-1 arası)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error('Vectors must have the same length')
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
 * Programları embedding'e çevir
 */
export async function createProgramEmbeddings(programs: string[]): Promise<Record<string, number[]>> {
    const embeddings: Record<string, number[]> = {}

    for (const program of programs) {
        embeddings[program] = await getEmbedding(program)
        // Rate limit için bekle
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    return embeddings
}