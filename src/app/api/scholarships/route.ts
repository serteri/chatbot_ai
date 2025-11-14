// src/app/api/scholarships/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)

        // Pagination
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Filters
        const country = searchParams.get('country')
        const studyLevel = searchParams.get('studyLevel')
        const provider = searchParams.get('provider')
        const search = searchParams.get('search')
        const minAmount = searchParams.get('minAmount')
        const maxAmount = searchParams.get('maxAmount')

        // Build where clause
        const where: any = {
            isActive: true,
            deadline: {
                gte: new Date() // Only future deadlines
            }
        }

        if (country) where.country = country
        if (studyLevel) where.studyLevel = { has: studyLevel }
        if (provider) where.provider = provider

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { provider: { contains: search, mode: 'insensitive' } }
            ]
        }

        // Get scholarships
        const [scholarships, total] = await Promise.all([
            prisma.scholarship.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { deadline: 'asc' },
                    { createdAt: 'desc' }
                ]
            }),
            prisma.scholarship.count({ where })
        ])

        // Calculate pagination
        const totalPages = Math.ceil(total / limit)
        const hasNext = page < totalPages
        const hasPrev = page > 1

        return NextResponse.json({
            scholarships,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext,
                hasPrev
            }
        })

    } catch (error) {
        console.error('Scholarship search error:', error)
        return NextResponse.json(
            { error: 'Burs arama hatası' },
            { status: 500 }
        )
    }
}

// Create new scholarship (admin only)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Validate required fields
        const { title, description, provider, amount, deadline, country } = body
        if (!title || !description || !provider || !amount || !deadline || !country) {
            return NextResponse.json(
                { error: 'Eksik bilgiler' },
                { status: 400 }
            )
        }

        // Create scholarship
        const scholarship = await prisma.scholarship.create({
            data: {
                title,
                description,
                provider,
                amount,
                currency: body.currency || 'USD',
                minGPA: body.minGPA ? parseFloat(body.minGPA) : null,
                maxAge: body.maxAge ? parseInt(body.maxAge) : null,
                nationality: body.nationality || [],
                studyLevel: body.studyLevel || [],
                fieldOfStudy: body.fieldOfStudy || [],
                deadline: new Date(deadline),
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null,
                applicationUrl: body.applicationUrl,
                requirements: body.requirements || [],
                country,
                city: body.city,
                universities: body.universities || [],
                tags: body.tags || []
            }
        })

        return NextResponse.json({ scholarship })

    } catch (error) {
        console.error('Scholarship creation error:', error)
        return NextResponse.json(
            { error: 'Burs oluşturma hatası' },
            { status: 500 }
        )
    }
}