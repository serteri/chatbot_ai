import { prisma } from '@/lib/db/prisma'
import { getEmbedding, cosineSimilarity } from '@/lib/utils/embedding'

/**
 * Program field için en benzer üniversiteleri bul
 */
export async function findSimilarUniversities(
    country?: string,
    field?: string,
    limit: number = 5
) {
    // 1. Ülkeye göre filtrele (varsa)
    const universities = await prisma.university.findMany({
        where: country ? {
            country: { contains: country, mode: 'insensitive' }
        } : {},
        orderBy: { ranking: 'asc' }
    })

    // Field yoksa direkt dön
    if (!field || universities.length === 0) {
        return universities.slice(0, limit)
    }

    // 2. Field için embedding oluştur
    console.log(`🔍 Creating embedding for field: "${field}"`)
    const fieldEmbedding = await getEmbedding(field)

    // 3. Her üniversite için en yüksek similarity'yi hesapla
    const universitiesWithScores = universities.map(uni => {
        let maxSimilarity = 0

        if (uni.programEmbeddings && typeof uni.programEmbeddings === 'object') {
            const embeddings = uni.programEmbeddings as Record<string, number[]>

            // Her program için similarity hesapla
            for (const [programName, programEmbedding] of Object.entries(embeddings)) {
                if (Array.isArray(programEmbedding)) {
                    const similarity = cosineSimilarity(fieldEmbedding, programEmbedding)

                    if (similarity > maxSimilarity) {
                        maxSimilarity = similarity
                        console.log(`  📊 ${uni.name} - ${programName}: ${(similarity * 100).toFixed(1)}%`)
                    }
                }
            }
        }

        return {
            university: uni,
            similarity: maxSimilarity
        }
    })

    // 4. Similarity'ye göre sırala ve filtrele (min %60)
    const filtered = universitiesWithScores
        .filter(item => item.similarity >= 0.60)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)

    console.log(`✅ Found ${filtered.length} universities with similarity >= 60%`)

    return filtered.map(item => item.university)
}