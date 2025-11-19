// SCHOLARSHIP APPLICATION SUBMIT API - Handle submissions with validation
// src/app/api/student/scholarship-applications/[id]/submit/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// POST /api/student/scholarship-applications/[id]/submit - Submit application
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const applicationId = params.id

        // Get application with scholarship details
        const application = await prisma.scholarshipApplication.findFirst({
            where: {
                id: applicationId,
                userId: session.user.id
            },
            include: {
                scholarship: true
            }
        })

        if (!application) {
            return NextResponse.json({
                success: false,
                error: 'Application not found'
            }, { status: 404 })
        }

        // Check if already submitted
        if (application.status !== 'draft') {
            return NextResponse.json({
                success: false,
                error: 'Application has already been submitted'
            }, { status: 400 })
        }

        // Check if scholarship is still active
        if (!application.scholarship.isActive) {
            return NextResponse.json({
                success: false,
                error: 'This scholarship is no longer active'
            }, { status: 400 })
        }

        // Check if deadline has passed
        const now = new Date()
        if (application.scholarship.deadline < now) {
            return NextResponse.json({
                success: false,
                error: 'Application deadline has passed'
            }, { status: 400 })
        }

        // Validate required fields
        const validationErrors = []

        if (!application.personalStatement?.trim()) {
            validationErrors.push('Personal statement is required')
        }

        if (!application.contactEmail?.trim()) {
            validationErrors.push('Contact email is required')
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (application.contactEmail && !emailRegex.test(application.contactEmail)) {
            validationErrors.push('Valid contact email is required')
        }

        if (validationErrors.length > 0) {
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: validationErrors
            }, { status: 400 })
        }

        // Update application status to submitted
        const currentMilestones = application.milestones as any[] || []
        currentMilestones.push({
            date: new Date().toISOString(),
            event: 'Application submitted',
            status: 'completed',
            note: 'Application successfully submitted for review'
        })

        // Calculate next reminder dates
        const reminderDates = []
        const submissionDate = new Date()

        // Follow-up reminder in 2 weeks
        const followUpDate = new Date(submissionDate)
        followUpDate.setDate(followUpDate.getDate() + 14)
        reminderDates.push({
            date: followUpDate.toISOString(),
            type: 'follow_up',
            message: 'Consider following up on your scholarship application'
        })

        // Decision reminder 1 week before deadline (if deadline is far)
        const deadlineDate = new Date(application.scholarship.deadline)
        const oneWeekBefore = new Date(deadlineDate)
        oneWeekBefore.setDate(oneWeekBefore.getDate() - 7)

        if (oneWeekBefore > submissionDate) {
            reminderDates.push({
                date: oneWeekBefore.toISOString(),
                type: 'decision_reminder',
                message: 'Scholarship decision deadline is approaching'
            })
        }

        // Update the application
        const submittedApplication = await prisma.scholarshipApplication.update({
            where: { id: applicationId },
            data: {
                status: 'submitted',
                appliedAt: submissionDate,
                milestones: currentMilestones,
                reminders: reminderDates
            },
            include: {
                scholarship: {
                    select: {
                        title: true,
                        provider: true,
                        deadline: true,
                        applicationUrl: true
                    }
                }
            }
        })

        // Create system reminders in the database
        for (const reminder of reminderDates) {
            await prisma.applicationReminder.create({
                data: {
                    userId: session.user.id,
                    type: 'scholarship',
                    referenceId: applicationId,
                    reminderDate: new Date(reminder.date),
                    message: reminder.message
                }
            })
        }

        return NextResponse.json({
            success: true,
            data: submittedApplication,
            message: 'Application submitted successfully!',
            nextSteps: [
                'Your application has been submitted for review',
                'You will receive email confirmations if provided by the scholarship provider',
                'Check back for updates on your application status',
                'Consider applying to additional scholarships to increase your chances'
            ]
        })

    } catch (error) {
        console.error('❌ Submit application error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to submit application'
        }, { status: 500 })
    }
}