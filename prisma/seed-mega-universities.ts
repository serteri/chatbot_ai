import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

// Tüm dünya ülkeleri listesi
const COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Spain",
    "Italy", "Netherlands", "Sweden", "Norway", "Denmark", "Finland", "Switzerland",
    "Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru",
    "Turkey", "Russia", "China", "Japan", "South Korea", "India", "Pakistan",
    "Malaysia", "Singapore", "Vietnam", "Thailand", "Philippines", "Indonesia",
    "Saudi Arabia", "UAE", "Qatar", "Kuwait", "Oman", "Jordan", "Lebanon", "Israel",
    "Egypt", "South Africa", "Nigeria", "Kenya",
    "New Zealand", "Ireland", "Belgium", "Austria", "Poland", "Portugal", "Greece",
    "Czech Republic", "Hungary", "Romania", "Bulgaria", "Serbia", "Croatia",
    "Slovenia", "Slovakia", "Lithuania", "Latvia", "Estonia", "Iceland",
    "Luxembourg", "Malta", "Cyprus"
]

// Senin mega top 600 üniversite ranking map'in
const topUniversityRankings = require('./top-university-rankings.json')
// → Tavsiye: Bu dev ranking map’ini **ayrı bir JSON dosyasına çıkar**, TS dosyasını şişirme.

interface UniversityData {
    name: string
    country: string
    'state-province': string | null
    web_pages: string[]
    domains: string[]
}

// API’den tüm üniversiteleri çek
async function fetchAllUniversities() {
    const all: UniversityData[] = []

    for (const country of COUNTRIES) {
        try {
            const url = `https://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`
            const { data } = await axios.get(url)
            all.push(...data)
        } catch (err) {
            console.error(`❌ API hatası → ${country}`, err.message)
        }
    }

    return all
}

function normalize(name: string) {
    return name.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '')
}

async function main() {
    console.log("🌍 Tüm üniversiteler çekiliyor...")
    const universities = await fetchAllUniversities()
    console.log(`📚 Toplam bulunan üniversite: ${universities.length}`)

    const normalizedRankMap: Record<string, number> = {}
    for (const key of Object.keys(topUniversityRankings)) {
        normalizedRankMap[normalize(key)] = topUniversityRankings[key]
    }

    let count = 0

    for (const uni of universities) {
        const cleanName = normalize(uni.name)
        const ranking = normalizedRankMap[cleanName] ?? null

        await prisma.university.create({
            data: {
                name: uni.name,
                country: uni.country,
                state: uni['state-province'],
                website: uni.web_pages[0] ?? null,
                domain: uni.domains[0] ?? null,
                ranking
            }
        })

        count++
        if (count % 200 === 0) console.log(`✔ ${count} üniversite işlendi...`)
    }

    console.log("🎉 SEED TAMAMLANDI!")
    console.log(`Toplam eklenen üniversite: ${count}`)
}

main()
    .catch(err => console.error(err))
    .finally(() => prisma.$disconnect())
