import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET - Search and list universities
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search') || ''
        const country = searchParams.get('country') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
                { country: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (country) {
            where.country = country
        }

        // Get universities
        const [universities, total] = await Promise.all([
            prisma.university.findMany({
                where,
                orderBy: { ranking: 'asc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    country: true,
                    city: true,
                    ranking: true,
                    logo: true,
                    type: true,
                    tuitionFee: true,
                    studentCount: true,
                    internationalStudents: true,
                    programs: true,
                    website: true
                }
            }),
            prisma.university.count({ where })
        ])

        // Get unique countries for filter
        const countries = await prisma.university.findMany({
            select: { country: true },
            distinct: ['country'],
            orderBy: { country: 'asc' }
        })

        return NextResponse.json({
            universities,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            countries: countries.map(c => c.country)
        })
    } catch (error) {
        console.error('Universities fetch error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}