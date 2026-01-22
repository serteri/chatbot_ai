import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET - Fetch published job postings (public API)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const jobId = searchParams.get('id')

        // If specific job ID requested, increment view count and return
        if (jobId) {
            const job = await prisma.jobPosting.update({
                where: {
                    id: jobId,
                    isPublished: true,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ]
                },
                data: {
                    viewCount: { increment: 1 }
                }
            })

            if (!job) {
                return NextResponse.json({ error: 'Job not found' }, { status: 404 })
            }

            return NextResponse.json({ job })
        }

        // Fetch all published and non-expired jobs
        const jobs = await prisma.jobPosting.findMany({
            where: {
                isPublished: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            orderBy: [
                { isFeatured: 'desc' },
                { publishedAt: 'desc' }
            ]
        })

        return NextResponse.json({ jobs })
    } catch (error) {
        console.error('Error fetching jobs:', error)
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }
}
