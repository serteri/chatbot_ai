import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Çoğu üniversitede bulunan standart bölümler
const CORE_PROGRAMS = [
    "Business Administration",
    "Economics",
    "Social Sciences",
    "Psychology",
    "History",
    "Literature"
]

// Rastgele eklenebilecek diğer bölümler
const OPTIONAL_PROGRAMS = [
    "Biology",
    "Physics",
    "Mathematics",
    "Chemistry",
    "Philosophy",
    "Political Science",
    "Marketing",
    "Finance"
]

async function main() {
    console.log("🧠 Akıllı program atama işlemi başlıyor...")

    const universities = await prisma.university.findMany({
        select: { id: true, name: true }
    })

    console.log(`Toplam ${universities.length} üniversite işlenecek.`)

    let count = 0

    for (const uni of universities) {
        let programs: string[] = [...CORE_PROGRAMS] // Herkese standart paketi ver
        const nameLower = uni.name.toLowerCase()

        // 1. TEKNİK ÜNİVERSİTELER
        if (nameLower.includes('tech') || nameLower.includes('polytechnic') || nameLower.includes('engineering') || nameLower.includes('science')) {
            programs.push(
                "Computer Science",
                "Software Engineering",
                "Mechanical Engineering",
                "Civil Engineering",
                "Electrical Engineering",
                "Data Science",
                "Architecture"
            )
        }
        // 2. SAĞLIK/TIP ÜNİVERSİTELERİ
        else if (nameLower.includes('medic') || nameLower.includes('health') || nameLower.includes('clinic')) {
            programs.push(
                "Medicine",
                "Nursing",
                "Pharmacy",
                "Biology",
                "Genetics"
            )
        }
        // 3. SANAT VE TASARIM
        else if (nameLower.includes('art') || nameLower.includes('design') || nameLower.includes('music')) {
            programs.push(
                "Arts",
                "Fine Arts",
                "Graphic Design",
                "Architecture",
                "Music",
                "Theater"
            )
        }
        // 4. GENEL/DİĞER ÜNİVERSİTELER (Hepsinden biraz serp)
        else {
            programs.push("Computer Science") // Günümüzde her yerde var
            programs.push("Law")

            // Rastgele 3 tane opsiyonel bölüm ekle
            const shuffled = [...OPTIONAL_PROGRAMS].sort(() => 0.5 - Math.random())
            programs.push(...shuffled.slice(0, 3))
        }

        // Program listesini benzersiz yap (Tekrar edenleri sil)
        const uniquePrograms = [...new Set(programs)]

        // Veritabanını güncelle
        await prisma.university.update({
            where: { id: uni.id },
            data: { programs: uniquePrograms }
        })

        count++
        if (count % 500 === 0) console.log(`${count} üniversite güncellendi...`)
    }

    console.log("✅ İşlem tamamlandı! Filtreler artık mantıklı çalışacak.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })