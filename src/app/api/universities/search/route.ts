import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DÜZELTME 1: Güvenli bir şekilde sayıları ayrıştıran bir yardımcı fonksiyon ekledim.
// Bu fonksiyon null, "", "abc" gibi değerlere karşı koruma sağlar.
const getIntParam = (param: string | null, defaultValue: number): number => {
    if (param === null || param === '') {
        return defaultValue;
    }
    const num = parseInt(param);
    // Eğer sonuç NaN (Sayı Değil) ise, varsayılan değeri döndür.
    return isNaN(num) ? defaultValue : num;
};


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Extract query parameters
        const page = getIntParam(searchParams.get('page'), 1) // DÜZELTME 2: Artık güvenli fonksiyonu kullan
        const limit = getIntParam(searchParams.get('limit'), 12) // DÜZELTME 3: Artık güvenli fonksiyonu kullan

        const search = searchParams.get('search') || ''
        const country = searchParams.get('country') || ''
        const type = searchParams.get('type') || ''
        const field = searchParams.get('field') || ''
        const sort = searchParams.get('sort') || 'ranking'

        // DÜZELTME 4: Tüm parseInt işlemlerini güvenli hale getirdim.
        // Ranking filters
        const rankingMin = getIntParam(searchParams.get('rankingMin'), 1)
        const rankingMax = getIntParam(searchParams.get('rankingMax'), 1000)

        // Tuition filters
        const tuitionMin = getIntParam(searchParams.get('tuitionMin'), 0)
        const tuitionMax = getIntParam(searchParams.get('tuitionMax'), 100000)

        console.log('🔍 University search params:', {
            page, limit, search, country, type, field, sort,
            ranking: [rankingMin, rankingMax],
            tuition: [tuitionMin, tuitionMax]
        })

        // Build where clause
        const whereClause: any = {
            AND: []
        }

        // Text search (name, city, country)
        if (search) {
            whereClause.AND.push({
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { city: { contains: search, mode: 'insensitive' } },
                    { country: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            })
        }

        // Country filter
        if (country && country !== 'all') {
            whereClause.AND.push({
                country: { contains: country, mode: 'insensitive' }
            })
        }

        // University type filter
        if (type && type !== 'all') {
            whereClause.AND.push({
                type: { equals: type, mode: 'insensitive' }
            })
        }

        // Study field filter (search in programs array)
        if (field && field !== 'all') {
            whereClause.AND.push({
                programs: { has: field }
            })
        }

        // Ranking filter
        // DÜZELTME 5: `rankingMin` 1 olsa bile bu koşulun çalışması için >= 1 kullandım
        if (rankingMin >= 1 && rankingMax < 1000) {
            whereClause.AND.push({
                ranking: {
                    gte: rankingMin,
                    lte: rankingMax
                }
            })
        } else if (rankingMin > 1) { // Sadece min girilirse
            whereClause.AND.push({
                ranking: {
                    gte: rankingMin
                }
            })
        }


        // Tuition filter
        // DÜZELTME 6: `tuitionMin` 0 olsa bile bu koşulun çalışması için >= 0 kullandım
        if (tuitionMin >= 0 && tuitionMax < 100000) {
            whereClause.AND.push({
                OR: [
                    { // Ücret aralığında olanlar
                        AND: [
                            { tuitionMin: { gte: tuitionMin } },
                            { tuitionMax: { lte: tuitionMax } }
                        ]
                    },
                    { // Ücreti belirtilmemiş (null) olanlar (genelde ücretsiz veya devlettir)
                        AND: [
                            { tuitionMin: null },
                            { tuitionMax: null }
                        ]
                    }
                ]
            })
        } else if (tuitionMin > 0) { // Sadece min girilirse
            whereClause.AND.push({
                OR: [
                    {
                        tuitionMin: { gte: tuitionMin }
                    },
                    {
                        AND: [
                            { tuitionMin: null },
                            { tuitionMax: null }
                        ]
                    }
                ]
            })
        }

        // If no filters, remove empty AND array
        if (whereClause.AND.length === 0) {
            delete whereClause.AND
        }

        console.log('📊 Where clause:', JSON.stringify(whereClause, null, 2))

        // Build order by clause
        let orderBy: any = {}

        switch (sort) {
            case 'ranking':
                orderBy = [
                    { ranking: { sort: 'asc', nulls: 'last' } }
                ]
                break
            case 'name':
                orderBy = { name: 'asc' }
                break
            case 'country':
                orderBy = [
                    { country: 'asc' },
                    { name: 'asc' }
                ]
                break
            case 'tuition':
                orderBy = [
                    { tuitionMin: { sort: 'asc', nulls: 'last' } }
                ]
                break
            default:
                orderBy = [{ ranking: { sort: 'asc', nulls: 'last' } }]
        }

        // Calculate pagination
        const skip = (page - 1) * limit

        // Execute search with count
        const [universities, totalCount] = await Promise.all([
            prisma.university.findMany({
                where: whereClause,
                orderBy: orderBy,
                skip: skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    country: true,
                    city: true,
                    ranking: true,
                    tuitionMin: true,
                    tuitionMax: true,
                    programs: true,
                    type: true,
                    website: true,
                    description: true,
                    requirements: true
                }
            }),
            prisma.university.count({
                where: whereClause
            })
        ])

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit)
        const hasNext = page < totalPages
        const hasPrev = page > 1

        console.log(`✅ Found ${universities.length} universities (${totalCount} total)`)

        return NextResponse.json({
            success: true,
            data: universities,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages,
                hasNext,
                hasPrev
            }
        })

    } catch (error) {
        console.error('❌ University search error:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to search universities',
                // DÜZELTME 7: Hatayı string'e çevirerek daha okunaklı hale getirdim
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            },
            { status: 500 }
        )
    }
}

// Helper function (Bu fonksiyon şu an kullanılmıyor ama burada durabilir)
function normalizeCountryName(country: string): string {
    const countryMappings: Record<string, string> = {
        'United States': 'USA',
        'United Kingdom': 'UK',
        'United Arab Emirates': 'UAE',
        'South Korea': 'Korea',
        'South Africa': 'South Africa',
        // Add more mappings as needed
    }

    return countryMappings[country] || country
}

// Export for different HTTP methods if needed
export async function POST(request: NextRequest) {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    )
}