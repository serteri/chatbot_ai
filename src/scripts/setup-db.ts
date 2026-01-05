const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🔌 Veritabanı kurulumu başlıyor...')

    try {
        // 1. pgvector eklentisini aktif et
        await prisma.$executeRawUnsafe`CREATE EXTENSION IF NOT EXISTS vector;`
        console.log('✅ "vector" eklentisi başarıyla aktif edildi.')

        // 2. DocumentChunk tablosundaki embedding sütununu vector tipine dönüştür
        // NOT: Bu adım, eğer embedding sütunu daha önce 'Bytea' veya başka bir tipteyse gereklidir.
        // Eğer tablo boşsa veya hata alırsanız, bu adımı geçebilirsiniz.
        try {
            // OpenAI text-embedding-3-small boyutu 1536'dır.
            await prisma.$executeRawUnsafe`
            ALTER TABLE "DocumentChunk" 
            ALTER COLUMN "embedding" TYPE vector(1536) 
            USING "embedding"::vector(1536);
        `
            console.log('✅ "DocumentChunk" tablosu vektör tipine güncellendi.')
        } catch (alterError) {
            console.log('ℹ️ Tablo güncellemesi atlandı (Zaten güncel olabilir veya tablo boş değil):', alterError.message)
        }

        // 3. Vektör aramayı hızlandırmak için Index oluştur (Opsiyonel ama önerilir)
        try {
            await prisma.$executeRawUnsafe`
            CREATE INDEX IF NOT EXISTS "document_chunk_embedding_idx" 
            ON "DocumentChunk" 
            USING hnsw ("embedding" vector_cosine_ops);
        `
            console.log('✅ HNSW İndeksi oluşturuldu (Arama hızı artırıldı).')
        } catch (indexError) {
            console.log('ℹ️ İndex oluşturulamadı:', indexError.message)
        }

    } catch (error) {
        console.error('❌ Bir hata oluştu:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()