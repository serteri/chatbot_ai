import pdf from 'pdf-parse-fork'
import mammoth from 'mammoth'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { OpenAIEmbeddings } from '@langchain/openai'

/**
 * PDF'ten text çıkar
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
        const data = await pdf(buffer)
        return data.text
    } catch (error) {
        console.error('PDF parse error:', error)
        throw new Error('PDF dosyası işlenemedi')
    }
}

/**
 * DOCX'ten text çıkar
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ buffer })
        return result.value
    } catch (error) {
        console.error('DOCX parse error:', error)
        throw new Error('DOCX dosyası işlenemedi')
    }
}

/**
 * Text'i chunks'lara böl
 */
export async function splitTextIntoChunks(
    text: string,
    chunkSize: number = 1000,
    chunkOverlap: number = 200
): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
    })

    const chunks = await splitter.splitText(text)
    return chunks
}

/**
 * OpenAI Embeddings oluştur
 */
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY bulunamadı')
    }

    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-3-small', // Ucuz ve hızlı
    })

    const vectors = await embeddings.embedDocuments(texts)
    return vectors
}

/**
 * Cosine similarity hesapla (vector search için)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))

    if (magnitudeA === 0 || magnitudeB === 0) return 0

    return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * Token sayısını tahmin et (yaklaşık)
 */
export function estimateTokenCount(text: string): number {
    // Basit tahmin: ~4 karakter = 1 token
    return Math.ceil(text.length / 4)
}

/**
 * Doküman tipi kontrolü
 */
export function getDocumentType(filename: string): 'pdf' | 'docx' | 'txt' | 'unknown' {
    const extension = filename.split('.').pop()?.toLowerCase()

    switch (extension) {
        case 'pdf':
            return 'pdf'
        case 'doc':
        case 'docx':
            return 'docx'
        case 'txt':
            return 'txt'
        default:
            return 'unknown'
    }
}

/**
 * Tam doküman processing pipeline
 */
export async function processDocument(
    buffer: Buffer,
    filename: string
): Promise<{
    text: string
    chunks: string[]
    embeddings: number[][]
    tokenCount: number
}> {
    // 1. Text extraction
    const docType = getDocumentType(filename)
    let text: string

    switch (docType) {
        case 'pdf':
            text = await extractTextFromPDF(buffer)
            break
        case 'docx':
            text = await extractTextFromDOCX(buffer)
            break
        case 'txt':
            text = buffer.toString('utf-8')
            break
        default:
            throw new Error('Desteklenmeyen dosya tipi')
    }

    // Boş kontrolü
    if (!text || text.trim().length < 10) {
        throw new Error('Doküman çok kısa veya boş')
    }

    // 2. Chunking
    const chunks = await splitTextIntoChunks(text)

    // 3. Embeddings
    const embeddings = await createEmbeddings(chunks)

    // 4. Token count
    const tokenCount = estimateTokenCount(text)

    return {
        text,
        chunks,
        embeddings,
        tokenCount,
    }
}