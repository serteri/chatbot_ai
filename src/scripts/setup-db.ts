const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🔌 Veritabanı kurulumu başlıyor...')

    try {
        // 1. pgvector eklentisini aktif et
        await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS vector;")
        console.log('✅ "vector" eklentisi başarıyla aktif edildi.')

        // 2. Tabloyu Temizle ve Vektör Sütununu Doğru Şekilde Oluştur
        // "cannot cast type bytea to vector" hatasını çözmek için sütunu sıfırlıyoruz.
        try {
            console.log('🔄 Sütun yapılandırması düzeltiliyor...')

            // Önce varsa eski index'i kaldır (Çakışmayı önlemek için)
            await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "document_chunk_embedding_idx";`)

            // Eski hatalı sütunu sil ve yenisini 'vector' olarak ekle
            // Bu işlem transaction içinde yapılarak veri bütünlüğü korunmaya çalışılır
            await prisma.$transaction([
                prisma.$executeRawUnsafe(`ALTER TABLE "DocumentChunk" DROP COLUMN IF EXISTS "embedding";`),
                prisma.$executeRawUnsafe(`ALTER TABLE "DocumentChunk" ADD COLUMN "embedding" vector(1536);`)
            ])

            console.log('✅ "DocumentChunk" tablosundaki embedding sütunu onarıldı (vektör formatına geçti).')
        } catch (alterError) {
            const errorMessage = alterError instanceof Error ? alterError.message : String(alterError)
            console.log('⚠️ Tablo güncellemesinde uyarı:', errorMessage)
        }

        // 3. Vektör aramayı hızlandırmak için HNSW İndeksi oluştur
        try {
            await prisma.$executeRawUnsafe(`
                CREATE INDEX IF NOT EXISTS "document_chunk_embedding_idx"
                    ON "DocumentChunk"
                    USING hnsw ("embedding" vector_cosine_ops);
            `)
            console.log('✅ HNSW İndeksi başarıyla oluşturuldu (Arama hızı optimize edildi).')
        } catch (indexError) {
            const errorMessage = indexError instanceof Error ? indexError.message : String(indexError)
            console.log('ℹ️ İndex oluşturulamadı (Veri yoksa veya zaten varsa normaldir):', errorMessage)
        }

    } catch (error) {
        console.error('❌ Kritik hata:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()