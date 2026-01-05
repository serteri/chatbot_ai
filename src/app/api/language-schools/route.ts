import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const country = searchParams.get('country')
        const city = searchParams.get('city')
        const language = searchParams.get('language')

        console.log('🏫 Language Schools API called:', { country, city, language })

        let schools: any[] = []

        // Try database first
        try {
            const { prisma } = await import('@/lib/db/prisma')
            console.log('✅ Prisma imported successfully')

            // Build filter conditions
            const whereConditions: any = {}

            if (country) {
                whereConditions.country = {
                    contains: country,
                    mode: 'insensitive'
                }
            }

            if (city) {
                whereConditions.city = {
                    contains: city,
                    mode: 'insensitive'
                }
            }

            if (language) {
                whereConditions.languages = {
                    has: language
                }
            }

            // Fetch from database
            schools = await prisma.languageSchool.findMany({
                where: whereConditions,
                orderBy: [
                    { country: 'asc' },
                    { pricePerWeek: 'asc' }
                ],
                select: {
                    id: true,
                    name: true,
                    country: true,
                    city: true,
                    languages: true,
                    courseDuration: true,
                    pricePerWeek: true,
                    intensity: true,
                    accommodation: true,
                    certifications: true,
                    website: true,
                    description: true,
                    multiLanguage: true
                }
            })

            console.log(`✅ Found ${schools.length} language schools in database`)

            // Add verified flag for database schools
            schools = schools.map(school => ({
                ...school,
                source: 'database',
                verified: true
            }))

        } catch (dbError) {
            console.error('❌ Database error, using fallback data:', dbError)

            // Fallback mock data
            schools = [
                {
                    id: 'ef_usa_new_york',
                    name: 'EF Education First New York',
                    country: 'USA',
                    city: 'New York',
                    languages: ['English'],
                    courseDuration: '2-52 weeks',
                    pricePerWeek: 450,
                    intensity: 'Intensive (30 hours/week)',
                    accommodation: true,
                    certifications: ['IELTS', 'TOEFL', 'Cambridge'],
                    website: 'https://www.ef.com',
                    description: 'Global leader in international education.',
                    source: 'fallback',
                    verified: true,
                    multiLanguage: { tr: { name: 'EF Education First New York', description: 'New York\'ta uluslararası eğitim' } }
                },
                {
                    id: 'kaplan_uk_london',
                    name: 'Kaplan International London',
                    country: 'UK',
                    city: 'London',
                    languages: ['English'],
                    courseDuration: '1-52 weeks',
                    pricePerWeek: 380,
                    intensity: 'Semi-Intensive (20 hours/week)',
                    accommodation: true,
                    certifications: ['IELTS', 'Cambridge', 'TOEFL'],
                    website: 'https://www.kaplaninternational.com',
                    description: 'Premium English language education.',
                    source: 'fallback',
                    verified: true,
                    multiLanguage: { tr: { name: 'Kaplan International London', description: 'Londra\'da premium İngilizce' } }
                },
                {
                    id: 'ec_malta_st_julians',
                    name: 'EC English Malta',
                    country: 'Malta',
                    city: 'St. Julians',
                    languages: ['English'],
                    courseDuration: '1-52 weeks',
                    pricePerWeek: 250,
                    intensity: 'General (20 hours/week)',
                    accommodation: true,
                    certifications: ['Cambridge', 'IELTS'],
                    website: 'https://www.ecenglish.com',
                    description: 'Affordable English education in Mediterranean.',
                    source: 'fallback',
                    verified: true,
                    multiLanguage: { tr: { name: 'EC English Malta', description: 'Malta\'da uygun İngilizce' } }
                },
                {
                    id: 'ilac_canada_toronto',
                    name: 'ILAC Toronto',
                    country: 'Canada',
                    city: 'Toronto',
                    languages: ['English', 'French'],
                    courseDuration: '2-52 weeks',
                    pricePerWeek: 350,
                    intensity: 'Intensive (30 hours/week)',
                    accommodation: true,
                    certifications: ['IELTS', 'TOEFL', 'University Pathway'],
                    website: 'https://www.ilac.com',
                    description: 'Leading Canadian language school.',
                    source: 'fallback',
                    verified: true,
                    multiLanguage: { tr: { name: 'ILAC Toronto', description: 'Kanada\'da lider dil okulu' } }
                },
                {
                    id: 'goethe_germany_berlin',
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
                    description: 'Official German language institute.',
                    source: 'fallback',
                    verified: true,
                    multiLanguage: { tr: { name: 'Goethe Enstitüsü Berlin', description: 'Resmi Almanca enstitüsü' } }
                }
            ]
        }

        // Apply filters to the schools array
        if (country && schools.length > 0) {
            schools = schools.filter(school =>
                school.country.toLowerCase().includes(country.toLowerCase())
            )
        }

        if (city && schools.length > 0) {
            schools = schools.filter(school =>
                school.city.toLowerCase().includes(city.toLowerCase())
            )
        }

        if (language && schools.length > 0) {
            schools = schools.filter(school =>
                school.languages.some((lang: string) =>
                    lang.toLowerCase().includes(language.toLowerCase())
                )
            )
        }

        // Calculate statistics
        const validPrices = schools.filter(s => s.pricePerWeek !== null && s.pricePerWeek !== undefined).map(s => s.pricePerWeek!)
        const stats = {
            total: schools.length,
            averagePrice: validPrices.length > 0 ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : 0,
            minPrice: validPrices.length > 0 ? Math.min(...validPrices) : 0,
            maxPrice: validPrices.length > 0 ? Math.max(...validPrices) : 0,
            schoolsWithPrice: validPrices.length
        }

        // Country breakdown
        const countryStats: Record<string, number> = {}
        schools.forEach(school => {
            countryStats[school.country] = (countryStats[school.country] || 0) + 1
        })

        // Language breakdown
        const languageStats: Record<string, number> = {}
        schools.forEach(school => {
            school.languages.forEach((lang: string) => {
                languageStats[lang] = (languageStats[lang] || 0) + 1
            })
        })

        // Price range breakdown
        const priceRanges = {
            budget: schools.filter(s => s.pricePerWeek && s.pricePerWeek <= 300).length,
            mid: schools.filter(s => s.pricePerWeek && s.pricePerWeek > 300 && s.pricePerWeek <= 400).length,
            premium: schools.filter(s => s.pricePerWeek && s.pricePerWeek > 400).length
        }

        console.log(`✅ Returning ${schools.length} language schools`)

        return NextResponse.json({
            success: true,
            schools,
            stats,
            breakdown: {
                countries: countryStats,
                languages: languageStats,
                priceRanges
            },
            meta: {
                total: schools.length,
                filtered: { country, city, language },
                timestamp: new Date().toISOString(),
                source: schools.length > 0 ? schools[0].source : 'none'
            }
        })

    } catch (error) {
        console.error('❌ Language Schools API error:', error)

        return NextResponse.json({
            success: false,
            error: 'Failed to fetch language schools',
            details: error instanceof Error ? error.message : 'Unknown error',
            schools: [],
            stats: { total: 0, averagePrice: 0, minPrice: 0, maxPrice: 0, schoolsWithPrice: 0 },
            breakdown: {
                countries: {},
                languages: {},
                priceRanges: { budget: 0, mid: 0, premium: 0 }
            }
        }, { status: 500 })
    }
}

// POST endpoint for adding new language school
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            name,
            country,
            city,
            languages,
            courseDuration,
            pricePerWeek,
            intensity,
            accommodation,
            certifications,
            website,
            description,
            multiLanguage
        } = body

        console.log('➕ Adding new language school:', { name, country, city })

        // Validation
        if (!name || !country || !city || !languages || !courseDuration || !intensity) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 })
        }

        try {
            const { prisma } = await import('@/lib/db/prisma')

            // Create new school record
            const newSchool = await prisma.languageSchool.create({
                data: {
                    name,
                    country,
                    city,
                    languages: Array.isArray(languages) ? languages : [languages],
                    courseDuration,
                    pricePerWeek: pricePerWeek ? parseInt(pricePerWeek) : null,
                    intensity,
                    accommodation: accommodation === true || accommodation === 'true',
                    certifications: Array.isArray(certifications) ? certifications : (certifications ? [certifications] : []),
                    website,
                    description,
                    multiLanguage: multiLanguage || {}
                }
            })

            console.log('✅ Created new language school:', newSchool.id)

            return NextResponse.json({
                success: true,
                school: newSchool,
                message: `Language school ${name} in ${city}, ${country} created successfully`
            })
        } catch (dbError) {
            return NextResponse.json({
                success: false,
                error: 'Database not available for school creation',
                details: dbError instanceof Error ? dbError.message : 'Unknown error'
            }, { status: 503 })
        }

    } catch (error) {
        console.error('❌ Language school creation error:', error)

        return NextResponse.json({
            success: false,
            error: 'Failed to create language school',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}