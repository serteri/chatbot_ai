// MAIN SCHOLARSHIPS API ROUTE
// src/app/api/scholarships/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/scholarships - Basic list without filtering
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        const offset = (page - 1) * limit

        // Basic query - get all active scholarships
        const [scholarships, total] = await Promise.all([
            prisma.scholarship.findMany({
                where: {
                    isActive: true,
                    deadline: {
                        gte: new Date() // Only future deadlines
                    }
                },
                orderBy: { deadline: 'asc' },
                skip: offset,
                take: limit
            }),
            prisma.scholarship.count({
                where: {
                    isActive: true,
                    deadline: {
                        gte: new Date()
                    }
                }
            })
        ])

        console.log(`📊 Basic list: ${scholarships.length} scholarships (${total} total)`)

        return NextResponse.json({
            scholarships,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        })

    } catch (error) {
        console.error('❌ Basic scholarship list failed:', error)
        return NextResponse.json({
            error: 'Failed to fetch scholarships',
            details: error.message
        }, { status: 500 })
    }
}

// POST /api/scholarships - Create new scholarship
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate required fields
        const { title, description, provider, amount, currency, deadline, country } = body

        if (!title || !description || !provider || !amount || !deadline || !country) {
            return NextResponse.json({
                error: 'Missing required fields',
                required: ['title', 'description', 'provider', 'amount', 'deadline', 'country']
            }, { status: 400 })
        }

        const scholarship = await prisma.scholarship.create({
            data: {
                ...body,
                deadline: new Date(deadline),
                isActive: true,
                lastSynced: new Date()
            }
        })

        console.log(`✅ Created scholarship: ${scholarship.title}`)

        return NextResponse.json({
            success: true,
            scholarship
        }, { status: 201 })

    } catch (error) {
        console.error('❌ Scholarship creation failed:', error)
        return NextResponse.json({
            error: 'Failed to create scholarship',
            details: error.message
        }, { status: 500 })
    }
}

// GET Statistics endpoint
export async function HEAD() {
    try {
        const stats = await prisma.scholarship.groupBy({
            by: ['country'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        })

        const total = await prisma.scholarship.count({
            where: { isActive: true }
        })

        return NextResponse.json({
            total,
            topCountries: stats.map(s => ({
                country: s.country,
                count: s._count.id
            }))
        })

    } catch (error) {
        return NextResponse.json({
            error: 'Failed to get statistics'
        }, { status: 500 })
    }
}