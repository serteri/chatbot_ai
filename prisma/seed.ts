import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Prisma Client'ı başlat
const prisma = new PrismaClient()

// İsimleri eşleştirme için temizleyen fonksiyon (JSON'daki ile aynı)
function normalizeName(name: string): string {
    if (!name) return ''
    return name.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '')
}

async function updateRankings() {
    console.log("🚀 Ranking güncelleme script'i başladı...")

    // 1. ADIM: Ranking JSON dosyasını OKU
    console.log("📚 Ranking dosyası okunuyor... (prisma/top-university-rankings.json)")
    let normalizedRankMap: Record<string, number> = {}
    try {
        const dataPath = path.join(process.cwd(), 'prisma', 'top-university-rankings.json')
        const fileContents = fs.readFileSync(dataPath, 'utf-8')
        const topUniversityRankings = JSON.parse(fileContents)

        for (const [key, rank] of Object.entries(topUniversityRankings)) {
            // JSON'daki 'key' (normalize edilmiş isim) ve 'rank' (sayı) alınıyor
            normalizedRankMap[key] = rank as number
        }
        console.log(`✅ ${Object.keys(normalizedRankMap).length} üniversite ranking bilgisi hafızaya alındı.`)

    } catch (e: any) {
        console.error("❌ HATA: 'prisma/top-university-rankings.json' dosyası okunamadı.", e.message)
        console.log("Lütfen JSON dosyasının 'prisma' klasöründe olduğundan emin ol.")
        return // Script'i durdur
    }

    // 2. ADIM: Veritabanındaki TÜM üniversiteleri çek
    console.log("📚 Veritabanından mevcut üniversiteler çekiliyor...")
    const allDbUniversities = await prisma.university.findMany({
        // Sadece 'id' ve 'name' alanlarını çekmek yeterli (daha verimli)
        select: { id: true, name: true, ranking: true }
    })
    console.log(`✅ ${allDbUniversities.length} üniversite kaydı bulundu.`)

    // 3. ADIM: Eşleştir ve GÜNCELLE
    console.log("⚙️ Ranking'ler eşleştiriliyor ve güncelleniyor... (Bu işlem uzun sürebilir)")
    let updatedCount = 0
    let alreadyHadRankCount = 0
    let notFoundCount = 0

    // Veritabanındaki her üniversite için döngü başlat
    for (const uni of allDbUniversities) {
        // Veritabanındaki adı da aynı yöntemle temizle
        const cleanDbName = normalizeName(uni.name)

        // Temizlenmiş adı, hafızadaki ranking haritasında ara
        const newRanking = normalizedRankMap[cleanDbName] || null

        if (newRanking !== null) {
            // EŞLEŞME BULUNDU
            if (uni.ranking !== newRanking) {
                // ve ranking veritabanında farklıysa (veya null ise), güncelle
                await prisma.university.update({
                    where: { id: uni.id }, // Kaydı 'id' ile güncelle
                    data: { ranking: newRanking }
                })
                updatedCount++
            } else {
                // Eşleşme bulundu ama ranking zaten doğruymuş
                alreadyHadRankCount++
            }
        } else {
            // Eşleşme bulunamadı
            notFoundCount++
        }
    }

    // 4. ADIM: Sonuçları raporla
    console.log("\n" + "=".repeat(40))
    console.log("🎉 GÜNCELLEME TAMAMLANDI!")
    console.log("=".repeat(40))
    console.log(`🔄 ${updatedCount} üniversitenin ranking bilgisi güncellendi.`)
    console.log(`👍 ${alreadyHadRankCount} üniversitenin ranking bilgisi zaten doğruydu.`)
    console.log(`🤷 ${notFoundCount} üniversite için JSON'da eşleşen ranking bulunamadı (null olarak kaldı).`)
    console.log(`📚 Toplam işlenen kayıt: ${allDbUniversities.length}`)
}

// Script'i çalıştır
updateRankings()
    .catch(err => {
        console.error("❌ BİR HATA OLDU:", err)
    })
    .finally(async () => {
        // Hata olsa da olmasa da Prisma bağlantısını sonlandır
        await prisma.$disconnect()
    })