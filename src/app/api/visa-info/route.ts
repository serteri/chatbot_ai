import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const country = searchParams.get('country')
        const region = searchParams.get('region')
        const minCost = searchParams.get('minCost')
        const maxCost = searchParams.get('maxCost')

        console.log('📊 Fetching visa information...')

        // Build filter conditions
        const whereConditions: any = {}

        if (country) {
            whereConditions.country = {
                contains: country,
                mode: 'insensitive'
            }
        }

        if (minCost || maxCost) {
            whereConditions.cost = {}
            if (minCost) whereConditions.cost.gte = parseInt(minCost)
            if (maxCost) whereConditions.cost.lte = parseInt(maxCost)
        }

        // Fetch visa information
        const visas = await prisma.visaInfo.findMany({
            where: whereConditions,
            orderBy: [
                { country: 'asc' },
                { cost: 'asc' }
            ],
            select: {
                id: true,
                country: true,
                visaType: true,
                duration: true,
                cost: true,
                requirements: true,
                processingTime: true,
                website: true,
                description: true,
                multiLanguage: true
            }
        })

        console.log(`✅ Found ${visas.length} visa records`)

        // Statistics
        const validCosts = visas.filter(v => v.cost !== null).map(v => v.cost!)
        const stats = {
            total: visas.length,
            averageCost: validCosts.length > 0 ? Math.round(validCosts.reduce((a, b) => a + b, 0) / validCosts.length) : 0,
            minCost: validCosts.length > 0 ? Math.min(...validCosts) : 0,
            maxCost: validCosts.length > 0 ? Math.max(...validCosts) : 0,
            countriesWithCost: validCosts.length
        }

        // Regional breakdown
        const regions = {
            'North America': ['USA', 'Canada', 'Mexico'],
                'Europe': [
                    'Germany', 'UK', 'France', 'Netherlands', 'Italy', 'Spain',
                    'Switzerland', 'Austria', 'Belgium', 'Portugal', 'Ireland',
                    'Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland',
                    'Poland', 'Czech Republic', 'Hungary', 'Slovakia', 'Slovenia',
                    'Romania', 'Bulgaria', 'Russia', 'Turkey'
                ],
            'Asia': [
                'Japan', 'South Korea', 'China', 'Taiwan', 'Hong Kong', 'Mongolia',
                'Singapore', 'Malaysia', 'Thailand', 'Philippines', 'Indonesia',
                'Vietnam', 'Cambodia', 'Myanmar', 'India', 'Nepal', 'Sri Lanka',
                'Bangladesh', 'Pakistan'
            ],
            'Middle East & Africa': [
                'Egypt', 'UAE', 'Qatar', 'Jordan', 'Lebanon', 'Israel',
                'South Africa', 'Morocco', 'Tunisia', 'Kenya'
            ],
            'Oceania': ['Australia', 'New Zealand', 'Fiji'],
            'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru']
        }

        const regionalStats = Object.entries(regions).map(([region, countries]) => {
            const regionVisas = visas.filter(v => countries.includes(v.country))
            const regionCosts = regionVisas.filter(v => v.cost !== null).map(v => v.cost!)

            return {
                region,
                count: regionVisas.length,
                averageCost: regionCosts.length > 0 ? Math.round(regionCosts.reduce((a, b) => a + b, 0) / regionCosts.length) : 0,
                countries: regionVisas.map(v => v.country)
            }
        }).filter(r => r.count > 0)

        return NextResponse.json({
            success: true,
            visas,
            stats,
            regionalStats,
            meta: {
                total: visas.length,
                filtered: whereConditions,
                timestamp: new Date().toISOString()
            }
        })

    } catch (error) {
        console.error('❌ Visa Info API error:', error)

        return NextResponse.json({
            success: false,
            error: 'Failed to fetch visa information',
            details: error instanceof Error ? error.message : 'Unknown error',
            visas: [],
            stats: { total: 0, averageCost: 0, minCost: 0, maxCost: 0, countriesWithCost: 0 },
            regionalStats: []
        }, { status: 500 })
    }
}

// POST endpoint for adding new visa information (admin only)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            country,
            visaType,
            duration,
            cost,
            requirements,
            processingTime,
            website,
            description,
            multiLanguage
        } = body

        console.log('➕ Adding new visa information:', { country, visaType })

        // Validation
        if (!country || !visaType || !duration || !requirements || !processingTime) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 })
        }

        // Create new visa record
        const newVisa = await prisma.visaInfo.create({
            data: {
                country,
                visaType,
                duration,
                cost: cost ? parseInt(cost) : null,
                requirements: Array.isArray(requirements) ? requirements : [requirements],
                processingTime,
                website,
                description,
                multiLanguage: multiLanguage || {}
            }
        })

        console.log('✅ Created new visa record:', newVisa.id)

        return NextResponse.json({
            success: true,
            visa: newVisa,
            message: `Visa information for ${country} created successfully`
        })

    } catch (error) {
        console.error('❌ Visa creation error:', error)

        return NextResponse.json({
            success: false,
            error: 'Failed to create visa information',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}