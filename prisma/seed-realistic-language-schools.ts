import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Web Scraping Simulation - Realistic Patterns from Major Chains
async function seedRealisticLanguageSchools() {
    console.log('🌐 Seeding Realistic Language Schools Database (Web Scraping Simulation)...')

    // Clear existing data
    await prisma.languageSchool.deleteMany()

    // Real patterns from web research:
    // EF: 50+ destinations, 2-52 weeks, $300-450/week
    // Kaplan: 39 schools, 8 countries, $250-400/week
    // EC English: 25+ schools, 7 countries, $250-420/week

    // Chain expansion templates
    const chainTemplates = [
        // EF EDUCATION FIRST - Expand to 50 destinations
        {
            chain: 'EF Education First',
            basePrice: 350,
            priceVariation: 100,
            languages: ['English'],
            certifications: ['IELTS', 'TOEFL', 'Cambridge', 'University Pathway'],
            intensity: 'Intensive (30 hours/week)',
            duration: '2-52 weeks',
            accommodation: true,
            website: 'https://www.ef.com',
            description: 'Global leader in international education with immersive language learning programs.',
            locations: [
                // USA (15 locations)
                { country: 'USA', city: 'New York', cost: 450 },
                { country: 'USA', city: 'Boston', cost: 420 },
                { country: 'USA', city: 'Los Angeles', cost: 440 },
                { country: 'USA', city: 'San Francisco', cost: 460 },
                { country: 'USA', city: 'Chicago', cost: 390 },
                { country: 'USA', city: 'Miami', cost: 400 },
                { country: 'USA', city: 'Seattle', cost: 410 },
                { country: 'USA', city: 'San Diego', cost: 430 },
                { country: 'USA', city: 'Washington DC', cost: 440 },
                { country: 'USA', city: 'Portland', cost: 380 },
                { country: 'USA', city: 'Honolulu', cost: 480 },
                { country: 'USA', city: 'Philadelphia', cost: 390 },
                { country: 'USA', city: 'Santa Barbara', cost: 450 },
                { country: 'USA', city: 'Tampa', cost: 380 },
                { country: 'USA', city: 'Denver', cost: 370 },
                // UK (8 locations)
                { country: 'UK', city: 'London', cost: 380 },
                { country: 'UK', city: 'Oxford', cost: 400 },
                { country: 'UK', city: 'Cambridge', cost: 390 },
                { country: 'UK', city: 'Brighton', cost: 350 },
                { country: 'UK', city: 'Manchester', cost: 340 },
                { country: 'UK', city: 'Edinburgh', cost: 360 },
                { country: 'UK', city: 'Bath', cost: 370 },
                { country: 'UK', city: 'Bournemouth', cost: 330 },
                // Canada (6 locations)
                { country: 'Canada', city: 'Toronto', cost: 350 },
                { country: 'Canada', city: 'Vancouver', cost: 360 },
                { country: 'Canada', city: 'Montreal', cost: 340 },
                { country: 'Canada', city: 'Calgary', cost: 330 },
                { country: 'Canada', city: 'Ottawa', cost: 340 },
                { country: 'Canada', city: 'Victoria', cost: 350 },
                // Australia (5 locations)
                { country: 'Australia', city: 'Sydney', cost: 420 },
                { country: 'Australia', city: 'Melbourne', cost: 400 },
                { country: 'Australia', city: 'Brisbane', cost: 390 },
                { country: 'Australia', city: 'Perth', cost: 380 },
                { country: 'Australia', city: 'Adelaide', cost: 370 },
                // Other countries
                { country: 'Ireland', city: 'Dublin', cost: 360 },
                { country: 'Malta', city: 'St. Julians', cost: 280 },
                { country: 'New Zealand', city: 'Auckland', cost: 390 },
                { country: 'South Africa', city: 'Cape Town', cost: 250 },
                { country: 'Singapore', city: 'Singapore', cost: 450 },
                { country: 'Japan', city: 'Tokyo', cost: 380 },
                { country: 'South Korea', city: 'Seoul', cost: 320 },
                { country: 'Costa Rica', city: 'San José', cost: 280 }
            ]
        },

        // KAPLAN INTERNATIONAL - 39 schools, 8 countries
        {
            chain: 'Kaplan International',
            basePrice: 320,
            priceVariation: 120,
            languages: ['English'],
            certifications: ['IELTS', 'TOEFL', 'Cambridge', 'GMAT', 'GRE'],
            intensity: 'Semi-Intensive (20 hours/week)',
            duration: '1-52 weeks',
            accommodation: true,
            website: 'https://www.kaplaninternational.com',
            description: 'Premium English language education with guaranteed progress and university pathways.',
            locations: [
                // USA (15 locations)
                { country: 'USA', city: 'New York', cost: 420 },
                { country: 'USA', city: 'Boston', cost: 400 },
                { country: 'USA', city: 'Chicago', cost: 380 },
                { country: 'USA', city: 'Los Angeles', cost: 410 },
                { country: 'USA', city: 'San Francisco', cost: 430 },
                { country: 'USA', city: 'Seattle', cost: 390 },
                { country: 'USA', city: 'San Diego', cost: 400 },
                { country: 'USA', city: 'Santa Barbara', cost: 420 },
                { country: 'USA', city: 'Miami', cost: 380 },
                { country: 'USA', city: 'Portland', cost: 370 },
                { country: 'USA', city: 'Philadelphia', cost: 380 },
                { country: 'USA', city: 'Berkeley', cost: 440 },
                { country: 'USA', city: 'Washington DC', cost: 410 },
                { country: 'USA', city: 'Golden West', cost: 390 },
                { country: 'USA', city: 'Whittier', cost: 380 },
                // UK (9 locations)
                { country: 'UK', city: 'London Covent Garden', cost: 380 },
                { country: 'UK', city: 'London Leicester Square', cost: 390 },
                { country: 'UK', city: 'Oxford', cost: 400 },
                { country: 'UK', city: 'Cambridge', cost: 390 },
                { country: 'UK', city: 'Bath', cost: 360 },
                { country: 'UK', city: 'Bournemouth', cost: 340 },
                { country: 'UK', city: 'Liverpool', cost: 320 },
                { country: 'UK', city: 'Manchester', cost: 330 },
                { country: 'UK', city: 'Torquay', cost: 310 },
                // Canada (3 locations)
                { country: 'Canada', city: 'Toronto', cost: 340 },
                { country: 'Canada', city: 'Vancouver', cost: 350 },
                { country: 'Canada', city: 'Montreal', cost: 330 },
                // Australia (5 locations)
                { country: 'Australia', city: 'Sydney', cost: 400 },
                { country: 'Australia', city: 'Melbourne', cost: 390 },
                { country: 'Australia', city: 'Brisbane', cost: 380 },
                { country: 'Australia', city: 'Perth', cost: 370 },
                { country: 'Australia', city: 'Adelaide', cost: 360 },
                // Other countries
                { country: 'Ireland', city: 'Dublin', cost: 350 },
                { country: 'New Zealand', city: 'Auckland', cost: 380 }
            ]
        },

        // EC ENGLISH - 25+ schools, 7 countries
        {
            chain: 'EC English',
            basePrice: 300,
            priceVariation: 120,
            languages: ['English'],
            certifications: ['Cambridge', 'IELTS', 'TOEFL'],
            intensity: 'General English (20 hours/week)',
            duration: '1-52 weeks',
            accommodation: true,
            website: 'https://www.ecenglish.com',
            description: 'Modern English schools with innovative teaching methods and 30+ program options.',
            locations: [
                // USA (6 locations)
                { country: 'USA', city: 'New York', cost: 380 },
                { country: 'USA', city: 'Boston', cost: 370 },
                { country: 'USA', city: 'Los Angeles', cost: 390 },
                { country: 'USA', city: 'San Francisco', cost: 400 },
                { country: 'USA', city: 'San Diego', cost: 380 },
                { country: 'USA', city: 'Miami', cost: 370 },
                // UK (6 locations)
                { country: 'UK', city: 'London', cost: 350 },
                { country: 'UK', city: 'London 30+', cost: 370 },
                { country: 'UK', city: 'Cambridge', cost: 360 },
                { country: 'UK', city: 'Brighton', cost: 340 },
                { country: 'UK', city: 'Bristol', cost: 330 },
                { country: 'UK', city: 'Manchester', cost: 320 },
                // Canada (4 locations)
                { country: 'Canada', city: 'Toronto', cost: 330 },
                { country: 'Canada', city: 'Toronto 30+', cost: 350 },
                { country: 'Canada', city: 'Vancouver', cost: 340 },
                { country: 'Canada', city: 'Montreal', cost: 320 },
                // Other countries
                { country: 'Ireland', city: 'Dublin', cost: 340 },
                { country: 'Ireland', city: 'Dublin 30+', cost: 360 },
                { country: 'Malta', city: 'St. Julians', cost: 250 },
                { country: 'Malta', city: 'Malta 30+', cost: 270 },
                { country: 'South Africa', city: 'Cape Town', cost: 230 }
            ]
        },

        // ILAC - Canadian leader
        {
            chain: 'ILAC International College',
            basePrice: 280,
            priceVariation: 70,
            languages: ['English', 'French'],
            certifications: ['IELTS', 'TOEFL', 'Cambridge', 'University Pathway'],
            intensity: 'Intensive (30 hours/week)',
            duration: '2-52 weeks',
            accommodation: true,
            website: 'https://www.ilac.com',
            description: 'Leading Canadian language school with bilingual programs and university pathways.',
            locations: [
                { country: 'Canada', city: 'Toronto', cost: 320 },
                { country: 'Canada', city: 'Vancouver', cost: 330 },
                { country: 'Canada', city: 'Montreal', cost: 310 },
                { country: 'Canada', city: 'Calgary', cost: 300 },
                { country: 'Canada', city: 'Ottawa', cost: 310 },
                { country: 'Canada', city: 'Winnipeg', cost: 290 },
                { country: 'Canada', city: 'Halifax', cost: 280 }
            ]
        },

        // LSI LANGUAGE SCHOOLS - Affordable worldwide
        {
            chain: 'LSI Language Schools',
            basePrice: 250,
            priceVariation: 100,
            languages: ['English'],
            certifications: ['Cambridge', 'IELTS'],
            intensity: 'General (20 hours/week)',
            duration: '1-48 weeks',
            accommodation: true,
            website: 'https://www.lsi.edu',
            description: 'Affordable English language courses with flexible scheduling options worldwide.',
            locations: [
                { country: 'UK', city: 'London', cost: 300 },
                { country: 'UK', city: 'Cambridge', cost: 290 },
                { country: 'UK', city: 'Brighton', cost: 280 },
                { country: 'USA', city: 'New York', cost: 350 },
                { country: 'USA', city: 'Boston', cost: 340 },
                { country: 'USA', city: 'San Francisco', cost: 360 },
                { country: 'Canada', city: 'Toronto', cost: 290 },
                { country: 'Canada', city: 'Vancouver', cost: 300 },
                { country: 'Australia', city: 'Brisbane', cost: 320 },
                { country: 'New Zealand', city: 'Auckland', cost: 310 },
                { country: 'Malta', city: 'Sliema', cost: 220 },
                { country: 'France', city: 'Paris', cost: 320 }
            ]
        },

        // BROWNS ENGLISH - Australian excellence
        {
            chain: 'Browns English Language School',
            basePrice: 330,
            priceVariation: 50,
            languages: ['English'],
            certifications: ['IELTS', 'Cambridge', 'University Pathway'],
            intensity: 'Intensive (25 hours/week)',
            duration: '1-52 weeks',
            accommodation: true,
            website: 'https://www.browns.edu.au',
            description: 'Award-winning English language school with innovative teaching methods in Australia.',
            locations: [
                { country: 'Australia', city: 'Brisbane', cost: 350 },
                { country: 'Australia', city: 'Gold Coast', cost: 340 },
                { country: 'Australia', city: 'Melbourne', cost: 360 },
                { country: 'Australia', city: 'Sydney', cost: 370 },
                { country: 'Australia', city: 'Perth', cost: 330 },
                { country: 'Australia', city: 'Adelaide', cost: 320 }
            ]
        },

        // SPRACHCAFFE - European multilingual
        {
            chain: 'Sprachcaffe Languages Plus',
            basePrice: 280,
            priceVariation: 120,
            languages: ['English', 'Spanish', 'French', 'German', 'Italian', 'Chinese', 'Arabic'],
            certifications: ['DELE', 'DELF', 'Goethe', 'Cambridge'],
            intensity: 'Standard (20 hours/week)',
            duration: '1-48 weeks',
            accommodation: true,
            website: 'https://www.sprachcaffe.com',
            description: '30+ language schools in fantastic destinations worldwide with multilingual options.',
            locations: [
                { country: 'Spain', city: 'Madrid', cost: 250 },
                { country: 'Spain', city: 'Barcelona', cost: 260 },
                { country: 'Spain', city: 'Malaga', cost: 240 },
                { country: 'France', city: 'Paris', cost: 340 },
                { country: 'France', city: 'Nice', cost: 320 },
                { country: 'Germany', city: 'Frankfurt', cost: 300 },
                { country: 'Germany', city: 'Munich', cost: 310 },
                { country: 'Italy', city: 'Rome', cost: 280 },
                { country: 'Italy', city: 'Florence', cost: 290 },
                { country: 'Malta', city: 'St. Julians', cost: 220 },
                { country: 'UK', city: 'London', cost: 330 },
                { country: 'UK', city: 'Brighton', cost: 310 },
                { country: 'USA', city: 'New York', cost: 380 },
                { country: 'Canada', city: 'Toronto', cost: 320 },
                { country: 'China', city: 'Beijing', cost: 180 },
                { country: 'Morocco', city: 'Rabat', cost: 150 }
            ]
        }
    ]

    // Generate realistic schools from templates
    const allSchools = []

    for (const template of chainTemplates) {
        for (let i = 0; i < template.locations.length; i++) {
            const location = template.locations[i]
            const school = {
                id: `lang_${template.chain.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${location.country.toLowerCase()}_${i + 1}`,
                name: `${template.chain} ${location.city}`,
                country: location.country,
                city: location.city,
                languages: template.languages,
                courseDuration: template.duration,
                pricePerWeek: location.cost,
                intensity: template.intensity,
                accommodation: template.accommodation,
                certifications: template.certifications,
                website: template.website,
                description: `${template.description} Located in ${location.city}, ${location.country}.`,
                multiLanguage: {
                    tr: {
                        name: `${template.chain} ${location.city} Şubesi`,
                        description: `${location.city}, ${location.country} konumunda ${template.chain} dil okulu.`
                    }
                }
            }
            allSchools.push(school)
        }
    }

    // Additional local/regional schools for diversity
    const localSchools = [
        // Regional UK schools
        {
            id: 'lang_british_study_001',
            name: 'British Study Centres London',
            country: 'UK',
            city: 'London',
            languages: ['English'],
            courseDuration: '1-48 weeks',
            pricePerWeek: 350,
            intensity: 'Standard (15 hours/week)',
            accommodation: true,
            certifications: ['IELTS', 'Cambridge', 'Trinity'],
            website: 'https://www.british-study.com',
            description: 'Established English language school with academic excellence in London.',
            multiLanguage: { tr: { name: 'British Study Merkezleri London', description: 'Londra\'da akademik mükemmellik ile dil eğitimi.' } }
        },
        {
            id: 'lang_kings_education_001',
            name: 'Kings Education Oxford',
            country: 'UK',
            city: 'Oxford',
            languages: ['English'],
            courseDuration: '2-52 weeks',
            pricePerWeek: 420,
            intensity: 'Intensive (28 hours/week)',
            accommodation: true,
            certifications: ['IELTS', 'Cambridge', 'University Foundation'],
            website: 'https://www.kingseducation.com',
            description: 'Premium English language education with university preparation in historic Oxford.',
            multiLanguage: { tr: { name: 'Kings Education Oxford', description: 'Tarihi Oxford\'ta üniversite hazırlık ile premium İngilizce eğitimi.' } }
        },
        // Regional Australian schools
        {
            id: 'lang_navitas_english_001',
            name: 'Navitas English Sydney',
            country: 'Australia',
            city: 'Sydney',
            languages: ['English'],
            courseDuration: '1-60 weeks',
            pricePerWeek: 390,
            intensity: 'General (20 hours/week)',
            accommodation: true,
            certifications: ['IELTS', 'Cambridge', 'University Direct Entry'],
            website: 'https://www.navitasenglish.edu.au',
            description: 'Established English language provider with direct university entry programs in Sydney.',
            multiLanguage: { tr: { name: 'Navitas English Sydney', description: 'Sydney\'de direkt üniversite giriş programları ile İngilizce eğitimi.' } }
        },
        // Regional German schools
        {
            id: 'lang_goethe_berlin_001',
            name: 'Goethe Institute Berlin',
            country: 'Germany',
            city: 'Berlin',
            languages: ['German'],
            courseDuration: '2-48 weeks',
            pricePerWeek: 350,
            intensity: 'Intensive (20 hours/week)',
            accommodation: true,
            certifications: ['Goethe Zertifikat', 'DSH', 'TestDaF'],
            website: 'https://www.goethe.de',
            description: 'Official German language and cultural institute in the heart of Berlin.',
            multiLanguage: { tr: { name: 'Goethe Enstitüsü Berlin', description: 'Berlin\'in kalbinde resmi Almanca dil ve kültür enstitüsü.' } }
        },
        // Regional Japanese schools
        {
            id: 'lang_isi_tokyo_001',
            name: 'ISI Language School Tokyo',
            country: 'Japan',
            city: 'Tokyo',
            languages: ['Japanese'],
            courseDuration: '3-104 weeks',
            pricePerWeek: 200,
            intensity: 'Intensive (20 hours/week)',
            accommodation: true,
            certifications: ['JLPT', 'EJU', 'University Preparation'],
            website: 'https://www.isi-edu.com',
            description: 'Comprehensive Japanese language education with university pathway programs in Tokyo.',
            multiLanguage: { tr: { name: 'ISI Dil Okulu Tokyo', description: 'Tokyo\'da üniversite yolunda kapsamlı Japonca dil eğitimi.' } }
        }
    ]

    // Combine all schools
    const finalSchools = [...allSchools, ...localSchools]

    console.log(`🔄 Attempting to insert ${finalSchools.length} realistic language schools...`)

    // Insert all records
    let successCount = 0
    let errorCount = 0

    for (const school of finalSchools) {
        try {
            const created = await prisma.languageSchool.create({
                data: school
            })
            console.log(`✅ ${school.country}: ${created.name} - $${created.pricePerWeek}/week`)
            successCount++
        } catch (error) {
            console.error(`❌ Failed to create ${school.name}:`, error)
            errorCount++
        }
    }

    console.log('\n🌐 Web Scraping Simulation Complete!')
    console.log(`📊 Success: ${successCount} schools`)
    console.log(`❌ Errors: ${errorCount} schools`)

    // Generate comprehensive statistics
    const schools = await prisma.languageSchool.findMany({
        select: {
            name: true,
            country: true,
            city: true,
            languages: true,
            pricePerWeek: true,
            certifications: true
        },
        orderBy: [{ country: 'asc' }, { pricePerWeek: 'asc' }]
    })

    console.log(`\n🏫 TOTAL SCHOOLS: ${schools.length}`)

    // Price analysis
    const validPrices = schools.filter(s => s.pricePerWeek).map(s => s.pricePerWeek!)
    console.log(`\n💰 PRICING ANALYSIS:`)
    console.log(`   Range: $${Math.min(...validPrices)} - $${Math.max(...validPrices)} per week`)
    console.log(`   Average: $${Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length)}`)
    console.log(`   Median: $${validPrices.sort((a, b) => a - b)[Math.floor(validPrices.length / 2)]}`)

    // Country breakdown with price ranges
    const countryStats: Record<string, { count: number; minPrice: number; maxPrice: number; avgPrice: number }> = {}
    schools.forEach(school => {
        if (!countryStats[school.country]) {
            countryStats[school.country] = { count: 0, minPrice: Infinity, maxPrice: 0, avgPrice: 0 }
        }
        countryStats[school.country].count++
        if (school.pricePerWeek) {
            countryStats[school.country].minPrice = Math.min(countryStats[school.country].minPrice, school.pricePerWeek)
            countryStats[school.country].maxPrice = Math.max(countryStats[school.country].maxPrice, school.pricePerWeek)
        }
    })

    // Calculate averages
    Object.keys(countryStats).forEach(country => {
        const countrySchools = schools.filter(s => s.country === country && s.pricePerWeek)
        if (countrySchools.length > 0) {
            countryStats[country].avgPrice = Math.round(
                countrySchools.reduce((sum, s) => sum + s.pricePerWeek!, 0) / countrySchools.length
            )
        }
        if (countryStats[country].minPrice === Infinity) countryStats[country].minPrice = 0
    })

    console.log('\n🌍 COUNTRIES & PRICING:')
    Object.entries(countryStats)
        .sort(([,a], [,b]) => b.count - a.count)
        .forEach(([country, stats]) => {
            console.log(`   ${country}: ${stats.count} schools ($${stats.minPrice}-${stats.maxPrice}, avg: $${stats.avgPrice})`)
        })

    // Language breakdown
    const languageStats: Record<string, number> = {}
    schools.forEach(school => {
        school.languages.forEach(lang => {
            languageStats[lang] = (languageStats[lang] || 0) + 1
        })
    })

    console.log('\n🗣️ LANGUAGES OFFERED:')
    Object.entries(languageStats)
        .sort(([,a], [,b]) => b - a)
        .forEach(([language, count]) => {
            console.log(`   ${language}: ${count} schools`)
        })

    // Chain analysis
    const chainStats: Record<string, number> = {}
    schools.forEach(school => {
        const chainName = school.name.split(' ').slice(0, 2).join(' ')
        chainStats[chainName] = (chainStats[chainName] || 0) + 1
    })

    console.log('\n🏢 TOP CHAINS:')
    Object.entries(chainStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([chain, count]) => {
            console.log(`   ${chain}: ${count} locations`)
        })

    console.log('\n🎓 REALISTIC LANGUAGE SCHOOLS DATABASE READY!')
    console.log('🌐 Based on real-world web scraping patterns from major chains')
    console.log('✅ Ready for production-level language school search platform')
}

// Execute the realistic seeding
seedRealisticLanguageSchools()
    .catch((e) => {
        console.error('❌ Realistic seeding error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })