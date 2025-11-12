import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeDatabase() {
    console.log('📊 Analyzing University Database...\n')

    // Toplam üniversite sayısı
    const totalCount = await prisma.university.count()
    console.log(`📚 Total Universities: ${totalCount}`)

    // Ülke sayısı
    const countries = await prisma.university.findMany({
        select: { country: true },
        distinct: ['country']
    })
    console.log(`🌍 Total Countries: ${countries.length}`)

    // En çok üniversiteye sahip ülkeler
    const countryStats = await prisma.university.groupBy({
        by: ['country'],
        _count: true,
        orderBy: {
            _count: {
                country: 'desc'
            }
        },
        take: 15
    })

    console.log('\n🏆 Top 15 Countries by University Count:')
    countryStats.forEach((stat, index) => {
        console.log(`  ${index + 1}. ${stat.country}: ${stat._count} universities`)
    })

    // Özel ülkeleri kontrol et
    console.log('\n🔍 Checking Specific Countries:')
    const checkCountries = ['United States', 'Turkey', 'United Kingdom', 'Germany', 'Canada', 'Japan', 'China', 'India']

    for (const country of checkCountries) {
        const count = await prisma.university.count({
            where: { country }
        })
        console.log(`  ${country}: ${count} universities`)
    }

    // Tip dağılımı
    const typeStats = await prisma.university.groupBy({
        by: ['type'],
        _count: true
    })

    console.log('\n🎓 University Types:')
    typeStats.forEach(stat => {
        console.log(`  ${stat.type}: ${stat._count} universities`)
    })

    // Ranking olan üniversiteler
    const withRanking = await prisma.university.count({
        where: {
            ranking: { not: null }
        }
    })
    console.log(`\n🏆 Universities with Ranking: ${withRanking}`)

    // Top 10 ranked üniversiteler
    const topRanked = await prisma.university.findMany({
        where: {
            ranking: { not: null }
        },
        orderBy: {
            ranking: 'asc'
        },
        take: 10
    })

    console.log('\n🥇 Top 10 Ranked Universities:')
    topRanked.forEach(uni => {
        console.log(`  ${uni.ranking}. ${uni.name} (${uni.country})`)
    })

    // Website olmayan üniversiteler
    const noWebsite = await prisma.university.count({
        where: {
            OR: [
                { website: null },
                { website: '' }
            ]
        }
    })
    console.log(`\n⚠️ Universities without website: ${noWebsite}`)

    // Şehir bilgisi eksik olanlar
    const noCity = await prisma.university.count({
        where: {
            OR: [
                { city: null },
                { city: '' },
                { city: { equals: prisma.university.fields.country } }
            ]
        }
    })
    console.log(`⚠️ Universities with missing/default city: ${noCity}`)

    console.log('\n✅ Analysis complete!')
}

analyzeDatabase()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })