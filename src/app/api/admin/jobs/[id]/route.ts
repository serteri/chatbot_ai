import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET - Fetch single job posting
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const job = await prisma.jobPosting.findUnique({
            where: { id }
        })

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        return NextResponse.json({ job })
    } catch (error) {
        console.error('Error fetching job:', error)
        return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
    }
}

// PUT - Update job posting
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const data = await request.json()

        // Check if job exists
        const existingJob = await prisma.jobPosting.findUnique({
            where: { id }
        })

        if (!existingJob) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        // If publishing for the first time, set publishedAt
        let publishedAt = existingJob.publishedAt
        if (data.isPublished && !existingJob.publishedAt) {
            publishedAt = new Date()
        }

        const job = await prisma.jobPosting.update({
            where: { id },
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
                publishedAt: publishedAt,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            }
        })

        return NextResponse.json({ success: true, job })
    } catch (error) {
        console.error('Error updating job:', error)
        return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
    }
}

// DELETE - Delete job posting
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.jobPosting.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting job:', error)
        return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
    }
}
