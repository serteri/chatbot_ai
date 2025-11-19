// SCHOLARSHIP APPLICATION TRACKING API - Complete Implementation
// src/app/api/student/scholarship-applications/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/student/scholarship-applications - List user's scholarship applications
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') // draft, submitted, under_review, accepted, rejected
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const sortBy = searchParams.get('sortBy') || 'updatedAt'
        const sortOrder = searchParams.get('sortOrder') || 'desc'

        const skip = (page - 1) * limit

        // Build where clause
        const whereClause: any = {
            userId: session.user.id
        }

        if (status && status !== 'all') {
            whereClause.status = status
        }

        // Get applications with scholarship details
        const applications = await prisma.scholarshipApplication.findMany({
            where: whereClause,
            include: {
                scholarship: {
                    select: {
                        id: true,
                        title: true,
                        provider: true,
                        amount: true,
                        currency: true,
                        deadline: true,
                        country: true,
                        isActive: true
                    }
                }
            },
            orderBy: {
                [sortBy]: sortOrder
            },
            skip,
            take: limit
        })

        // Get total count for pagination
        const totalApplications = await prisma.scholarshipApplication.count({
            where: whereClause
        })

        // Get status summary
        const statusSummary = await prisma.scholarshipApplication.groupBy({
            by: ['status'],
            where: { userId: session.user.id },
            _count: { id: true }
        })

        const summary = statusSummary.reduce((acc, item) => {
            acc[item.status] = item._count.id
            return acc
        }, {} as Record<string, number>)

        return NextResponse.json({
            success: true,
            data: {
                applications,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalApplications / limit),
                    totalItems: totalApplications,
                    itemsPerPage: limit
                },
                summary: {
                    total: totalApplications,
                    byStatus: summary
                }
            }
        })

    } catch (error) {
        console.error('❌ Get applications error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch applications'
        }, { status: 500 })
    }
}

// POST /api/student/scholarship-applications - Create new application
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            scholarshipId,
            personalStatement,
            essayQuestions,
            contactEmail,
            contactPhone,
            currentInstitution,
            currentProgram,
            graduationDate,
            gpa,
            financialNeed,
            familyIncome
        } = body

        // Check if application already exists
        const existingApplication = await prisma.scholarshipApplication.findUnique({
            where: {
                userId_scholarshipId: {
                    userId: session.user.id,
                    scholarshipId
                }
            }
        })

        if (existingApplication) {
            return NextResponse.json({
                success: false,
                error: 'Application already exists for this scholarship'
            }, { status: 409 })
        }

        // Verify scholarship exists and is active
        const scholarship = await prisma.scholarship.findFirst({
            where: {
                id: scholarshipId,
                isActive: true
            }
        })

        if (!scholarship) {
            return NextResponse.json({
                success: false,
                error: 'Scholarship not found or inactive'
            }, { status: 404 })
        }

        // Create the application
        const application = await prisma.scholarshipApplication.create({
            data: {
                userId: session.user.id,
                scholarshipId,
                personalStatement,
                essayQuestions,
                contactEmail,
                contactPhone,
                currentInstitution,
                currentProgram,
                graduationDate: graduationDate ? new Date(graduationDate) : null,
                gpa,
                financialNeed,
                familyIncome,
                milestones: [
                    {
                        date: new Date().toISOString(),
                        event: 'Application created',
                        status: 'completed'
                    }
                ]
            },
            include: {
                scholarship: {
                    select: {
                        title: true,
                        provider: true,
                        deadline: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: application,
            message: 'Scholarship application created successfully'
        })

    } catch (error) {
        console.error('❌ Create application error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to create application'
        }, { status: 500 })
    }
}

// PUT /api/student/scholarship-applications - Update existing application
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            applicationId,
            personalStatement,
            essayQuestions,
            contactEmail,
            contactPhone,
            currentInstitution,
            currentProgram,
            graduationDate,
            gpa,
            financialNeed,
            familyIncome,
            status,
            notes
        } = body

        // Check if application exists and belongs to user
        const existingApplication = await prisma.scholarshipApplication.findFirst({
            where: {
                id: applicationId,
                userId: session.user.id
            }
        })

        if (!existingApplication) {
            return NextResponse.json({
                success: false,
                error: 'Application not found'
            }, { status: 404 })
        }

        // Prepare update data
        const updateData: any = {}

        if (personalStatement !== undefined) updateData.personalStatement = personalStatement
        if (essayQuestions !== undefined) updateData.essayQuestions = essayQuestions
        if (contactEmail !== undefined) updateData.contactEmail = contactEmail
        if (contactPhone !== undefined) updateData.contactPhone = contactPhone
        if (currentInstitution !== undefined) updateData.currentInstitution = currentInstitution
        if (currentProgram !== undefined) updateData.currentProgram = currentProgram
        if (graduationDate !== undefined) updateData.graduationDate = graduationDate ? new Date(graduationDate) : null
        if (gpa !== undefined) updateData.gpa = gpa
        if (financialNeed !== undefined) updateData.financialNeed = financialNeed
        if (familyIncome !== undefined) updateData.familyIncome = familyIncome
        if (notes !== undefined) updateData.notes = notes

        // Handle status changes
        if (status && status !== existingApplication.status) {
            updateData.status = status

            // Add milestone for status change
            const currentMilestones = existingApplication.milestones as any[] || []
            currentMilestones.push({
                date: new Date().toISOString(),
                event: `Status changed to ${status}`,
                status: 'completed'
            })
            updateData.milestones = currentMilestones

            // Set appliedAt if status is submitted
            if (status === 'submitted' && !existingApplication.appliedAt) {
                updateData.appliedAt = new Date()
            }
        }

        // Update the application
        const updatedApplication = await prisma.scholarshipApplication.update({
            where: { id: applicationId },
            data: updateData,
            include: {
                scholarship: {
                    select: {
                        title: true,
                        provider: true,
                        deadline: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: updatedApplication,
            message: 'Application updated successfully'
        })

    } catch (error) {
        console.error('❌ Update application error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to update application'
        }, { status: 500 })
    }
}

// DELETE /api/student/scholarship-applications - Delete application
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const applicationId = searchParams.get('id')

        if (!applicationId) {
            return NextResponse.json({
                success: false,
                error: 'Application ID is required'
            }, { status: 400 })
        }

        // Check if application exists and belongs to user
        const application = await prisma.scholarshipApplication.findFirst({
            where: {
                id: applicationId,
                userId: session.user.id
            }
        })

        if (!application) {
            return NextResponse.json({
                success: false,
                error: 'Application not found'
            }, { status: 404 })
        }

        // Only allow deletion if status is draft
        if (application.status !== 'draft') {
            return NextResponse.json({
                success: false,
                error: 'Cannot delete submitted applications'
            }, { status: 400 })
        }

        // Delete the application
        await prisma.scholarshipApplication.delete({
            where: { id: applicationId }
        })

        return NextResponse.json({
            success: true,
            message: 'Application deleted successfully'
        })

    } catch (error) {
        console.error('❌ Delete application error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to delete application'
        }, { status: 500 })
    }
}