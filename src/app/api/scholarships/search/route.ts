// SEARCH API ROUTE
// src/app/api/scholarships/search/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { translateCountryForDB } from '@/lib/utils/country-translation'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const country = searchParams.get('country') || ''
        const studyLevel = searchParams.get('studyLevel') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        const offset = (page - 1) * limit

        // BUILD WHERE CONDITIONS
        let whereConditions: any = {
            isActive: true,
            deadline: {
                gte: new Date() // Only future deadlines
            }
        }

        // TEXT SEARCH
        if (search) {
            whereConditions.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { provider: { contains: search, mode: 'insensitive' } }
            ]
        }

        // COUNTRY FILTER WITH TRANSLATION FIX
        if (country && country.trim() !== '') {
            // Translate Turkish country name to English for database search
            const englishCountry = translateCountryForDB(country)

            // Create separate country conditions
            const countryConditions = [
                { country: { contains: englishCountry, mode: 'insensitive' } },
                { country: { contains: country, mode: 'insensitive' } }, // Also try original
            ]

            // Add university search if different
            if (englishCountry !== country) {
                countryConditions.push(
                    { universities: { hasSome: [englishCountry] } },
                    { provider: { contains: englishCountry, mode: 'insensitive' } }
                )
            }

            // Merge with existing OR conditions
            if (whereConditions.OR && whereConditions.OR.length > 0) {
                // If we already have OR conditions (from text search), we need to combine them properly
                whereConditions.AND = [
                    { OR: whereConditions.OR }, // Existing text search conditions
                    { OR: countryConditions }   // Country conditions
                ]
                delete whereConditions.OR
            } else {
                // No existing OR conditions, just add country conditions
                whereConditions.OR = countryConditions
            }
        }

        // STUDY LEVEL FILTER
        if (studyLevel) {
            whereConditions.studyLevel = {
                hasSome: [studyLevel]
            }
        }

        // EXECUTE SEARCH
        const [scholarships, total] = await Promise.all([
            prisma.scholarship.findMany({
                where: whereConditions,
                orderBy: { deadline: 'asc' },
                skip: offset,
                take: limit
            }),
            prisma.scholarship.count({
                where: whereConditions
            })
        ])

        return NextResponse.json({
            success: true,
            data: scholarships,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            debug: {
                searchTerm: search,
                originalCountry: country,
                translatedCountry: country ? translateCountryForDB(country) : null,
                studyLevel,
                foundCount: scholarships.length
            }
        })

    } catch (error) {
        console.error('❌ Scholarship search failed:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

// QUICK TEST ENDPOINT
export async function POST(request: NextRequest) {
    try {
        const { testCountry } = await request.json()

        const englishCountry = translateCountryForDB(testCountry)

        // Test search with both original and translated
        const results = await prisma.scholarship.findMany({
            where: {
                OR: [
                    { country: { contains: englishCountry, mode: 'insensitive' } },
                    { country: { contains: testCountry, mode: 'insensitive' } }
                ]
            },
            take: 5
        })

        return NextResponse.json({
            success: true,
            testResults: {
                input: testCountry,
                translated: englishCountry,
                found: results.length,
                samples: results.map(s => ({
                    title: s.title,
                    country: s.country,
                    provider: s.provider
                }))
            }
        })

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}