import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET - Fetch all job postings
export async function GET() {
    try {
        const jobs = await prisma.jobPosting.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ jobs })
    } catch (error) {
        console.error('Error fetching jobs:', error)
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }
}

// POST - Create new job posting
export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        const job = await prisma.jobPosting.create({
            data: {
                title: data.title,
                department: data.department,
                location: data.location || '',
                locationType: data.locationType || 'remote',
                employmentType: data.employmentType || 'full-time',
                salaryMin: data.salaryMin || null,
                salaryMax: data.salaryMax || null,
                salaryCurrency: data.salaryCurrency || 'USD',
                salaryPeriod: data.salaryPeriod || 'yearly',
                showSalary: data.showSalary || false,
                description: data.description,
                responsibilities: data.responsibilities || null,
                requirements: data.requirements || null,
                niceToHave: data.niceToHave || null,
                benefits: data.benefits || null,
                applicationUrl: data.applicationUrl || null,
                applicationEmail: data.applicationEmail || null,
                language: data.language || 'en',
                isPublished: data.isPublished || false,
                isFeatured: data.isFeatured || false,
                publishedAt: data.isPublished ? new Date() : null,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            }
        })

        return NextResponse.json({ success: true, job })
    } catch (error) {
        console.error('Error creating job:', error)
        return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }
}
