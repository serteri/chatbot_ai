import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '100')
        const country = searchParams.get('country')

        const universities = await prisma.university.findMany({
            where: country ? { country } : undefined,
            take: limit,
            orderBy: { ranking: 'asc' },
            select: {
                id: true,
                name: true,
                country: true,
                city: true,
                ranking: true,
                programs: true,
                tuitionMin: true,
                tuitionMax: true
            }
        })

        return NextResponse.json({ universities })
    } catch (error) {
        console.error('Universities fetch error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}