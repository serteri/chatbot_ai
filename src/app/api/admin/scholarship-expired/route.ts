// Admin API for managing expired scholarships
// src/app/api/admin/scholarship-expired/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: List expired scholarships with pagination
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const currentTime = new Date()

        // Get expired scholarships
        const [expired, total] = await Promise.all([
            prisma.scholarship.findMany({
                where: {
                    deadline: { lt: currentTime },
                    isActive: true
                },
                select: {
                    id: true,
                    title: true,
                    provider: true,
                    country: true,
                    deadline: true,
                    amount: true,
                    currency: true
                },
                orderBy: { deadline: 'asc' },
                skip,
                take: limit
            }),
            prisma.scholarship.count({
                where: {
                    deadline: { lt: currentTime },
                    isActive: true
                }
            })
        ])

        // Calculate how long each has been expired
        const expiredWithInfo = expired.map(s => ({
            ...s,
            expiredSince: Math.floor((currentTime.getTime() - s.deadline.getTime()) / (1000 * 60 * 60 * 24)), // days
            deadlineFormatted: s.deadline.toISOString().split('T')[0]
        }))

        return NextResponse.json({
            success: true,
            scholarships: expiredWithInfo,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error: any) {
        console.error('❌ GET expired Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

// DELETE: Delete all expired scholarships or specific ones
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (id) {
            // Delete single scholarship
            await prisma.scholarship.delete({
                where: { id }
            })

            return NextResponse.json({
                success: true,
                message: 'Scholarship deleted',
                deletedId: id
            })
        } else {
            // Delete ALL expired
            const currentTime = new Date()
            const result = await prisma.scholarship.deleteMany({
                where: {
                    deadline: { lt: currentTime },
                    isActive: true
                }
            })

            return NextResponse.json({
                success: true,
                message: `Deleted ${result.count} expired scholarships`,
                deletedCount: result.count
            })
        }

    } catch (error: any) {
        console.error('❌ DELETE expired Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

// PATCH: Update expired scholarships with new deadlines
export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const currentTime = new Date()

        // Generate future deadline (4-10 months ahead)
        const generateFutureDeadline = () => {
            const monthsAhead = Math.floor(Math.random() * 7) + 4
            const futureDate = new Date(currentTime)
            futureDate.setMonth(currentTime.getMonth() + monthsAhead)
            futureDate.setDate(Math.floor(Math.random() * 28) + 1)
            return futureDate
        }

        if (id) {
            // Update single scholarship
            const newDeadline = generateFutureDeadline()

            const updated = await prisma.scholarship.update({
                where: { id },
                data: {
                    deadline: newDeadline,
                    lastSynced: new Date(),
                    isActive: true
                }
            })

            return NextResponse.json({
                success: true,
                message: 'Scholarship deadline updated',
                scholarship: {
                    id: updated.id,
                    title: updated.title,
                    newDeadline: newDeadline.toISOString()
                }
            })
        } else {
            // Update ALL expired with new deadlines
            const expiredScholarships = await prisma.scholarship.findMany({
                where: {
                    deadline: { lt: currentTime },
                    isActive: true
                },
                select: { id: true }
            })

            // Batch update with Promise.all
            const batchSize = 50
            let updatedCount = 0

            for (let i = 0; i < expiredScholarships.length; i += batchSize) {
                const batch = expiredScholarships.slice(i, i + batchSize)

                const updatePromises = batch.map(scholarship => {
                    const newDeadline = generateFutureDeadline()
                    return prisma.scholarship.update({
                        where: { id: scholarship.id },
                        data: {
                            deadline: newDeadline,
                            lastSynced: new Date(),
                            isActive: true
                        }
                    })
                })

                await Promise.all(updatePromises)
                updatedCount += batch.length
            }

            return NextResponse.json({
                success: true,
                message: `Updated ${updatedCount} expired scholarships with new deadlines`,
                updatedCount
            })
        }

    } catch (error: any) {
        console.error('❌ PATCH expired Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
