import { openai } from '@/lib/ai/openai'

export type DocumentType = 'pdf' | 'docx' | 'txt' | 'unknown'

/**
 * Dosya tipini belirle
 */
export function getDocumentType(filename: string): DocumentType {
    const ext = filename.split('.').pop()?.toLowerCase()

    switch (ext) {
        case 'pdf':
            return 'pdf'
        case 'docx':
        case 'doc':
            return 'docx'
        case 'txt':
        case 'md':
            return 'txt'
        default:
            return 'unknown'
    }
}

/**
 * Dokümanı işle - text çıkar, chunk'la, embedding oluştur
 */
export async function processDocument(buffer: Buffer, filename: string) {
    const docType = getDocumentType(filename)

    // 1. Text'i çıkar
    let text = ''

    switch (docType) {
        case 'pdf':
            text = await extractPdfText(buffer)
            break
        case 'docx':
            text = await extractDocxText(buffer)
            break
        case 'txt':
            text = buffer.toString('utf-8')
            break
        default:
            throw new Error('Unsupported document type')
    }

    // 2. Text'i temizle
    text = cleanText(text)

    if (!text || text.trim().length < 50) {
        throw new Error('Doküman çok kısa veya boş')
    }

    // 3. Chunk'lara ayır
    const chunks = chunkText(text, 1000, 200) // 1000 char, 200 overlap

    // 4. Her chunk için embedding oluştur
    const embeddings = await createEmbeddings(chunks)

    // 5. Token sayısını hesapla
    const tokenCount = estimateTokenCount(text)

    return {
        text,
        chunks,
        embeddings,
        tokenCount
    }
}

/**
 * PDF'den text çıkar (Dynamic Import)
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
    try {
        // Dynamic import - sadece kullanılacağı zaman yükle
        const pdf = await import('pdf-parse')
        const data = await pdf.default(buffer)
        return data.text
    } catch (error) {
        console.error('PDF extraction error:', error)
        throw new Error('PDF işlenirken hata oluştu')
    }
}

/**
 * DOCX'den text çıkar (Dynamic Import)
 */
async function extractDocxText(buffer: Buffer): Promise<string> {
    try {
        // Dynamic import - sadece kullanılacağı zaman yükle
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ buffer })
        return result.value
    } catch (error) {
        console.error('DOCX extraction error:', error)
        throw new Error('DOCX işlenirken hata oluştu')
    }
}

/**
 * Text'i temizle
 */
function cleanText(text: string): string {
    return text
        .replace(/\r\n/g, '\n') // Windows line endings
        .replace(/\n{3,}/g, '\n\n') // Fazla boşlukları temizle
        .replace(/\t/g, ' ') // Tab'ları space'e çevir
        .replace(/[ ]{2,}/g, ' ') // Fazla boşlukları temizle
        .trim()
}

/**
 * Text'i chunk'lara ayır
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = []
    const sentences = text.split(/(?<=[.!?])\s+/)

    let currentChunk = ''

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > chunkSize) {
            if (currentChunk) {
                chunks.push(currentChunk.trim())

                // Overlap için son kısmı al
                const words = currentChunk.split(' ')
                const overlapWords = words.slice(-Math.floor(overlap / 5))
                currentChunk = overlapWords.join(' ') + ' ' + sentence
            } else {
                // Tek cümle çok uzunsa, olduğu gibi ekle
                chunks.push(sentence.trim())
                currentChunk = ''
            }
        } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim())
    }

    return chunks
}

/**
 * Chunk'lar için embedding oluştur
 */
async function createEmbeddings(chunks: string[]): Promise<number[][]> {
    try {
        // OpenAI batch embedding
        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: chunks,
        })

        return response.data.map(item => item.embedding)
    } catch (error) {
        console.error('Embedding creation error:', error)
        throw new Error('Embedding oluşturulurken hata oluştu')
    }
}

/**
 * Token sayısını tahmin et
 */
function estimateTokenCount(text: string): number {
    // Yaklaşık: 4 karakter = 1 token
    return Math.ceil(text.length / 4)
}

/**
 * Chunk preview oluştur
 */
export function createChunkPreview(content: string, maxLength: number = 200): string {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
}