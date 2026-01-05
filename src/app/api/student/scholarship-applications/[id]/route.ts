// INDIVIDUAL SCHOLARSHIP APPLICATION API - Get, Update, Submit
// src/app/api/student/scholarship-applications/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth/auth'

const prisma = new PrismaClient()

// GET /api/student/scholarship-applications/[id] - Get single application
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: applicationId } = await params

        const application = await prisma.scholarshipApplication.findFirst({
            where: {
                id: applicationId,
                userId: session.user.id
            },
            include: {
                scholarship: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        provider: true,
                        amount: true,
                        currency: true,
                        deadline: true,
                        country: true,
                        requirements: true,
                        applicationUrl: true,
                        isActive: true
                    }
                }
            }
        })

        if (!application) {
            return NextResponse.json({
                success: false,
                error: 'Application not found'
            }, { status: 404 })
        }

        // Parse JSON fields
        const formattedApplication = {
            ...application,
            scholarship: {
                ...application.scholarship,
                requirements: JSON.parse(application.scholarship.requirements || '[]')
            }
        }

        return NextResponse.json({
            success: true,
            data: formattedApplication
        })

    } catch (error) {
        console.error('❌ Get single application error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch application'
        }, { status: 500 })
    }
}

// PATCH /api/student/scholarship-applications/[id] - Update specific application
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: applicationId } = await params
        const body = await request.json()

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

        // Prepare update data (only update provided fields)
        const updateData: any = {}
        const allowedFields = [
            'personalStatement', 'essayQuestions', 'contactEmail', 'contactPhone',
            'currentInstitution', 'currentProgram', 'graduationDate', 'gpa',
            'financialNeed', 'familyIncome', 'notes', 'documents'
        ]

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                if (field === 'graduationDate' && body[field]) {
                    updateData[field] = new Date(body[field])
                } else {
                    updateData[field] = body[field]
                }
            }
        })

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