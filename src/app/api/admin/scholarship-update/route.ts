// COMPLETE ADMIN API WITH GET + POST + DETAILED LOGGING
// src/app/api/admin/scholarship-update/route.ts (REPLACE ENTIRE FILE)

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ⏱️ RATE LIMITING
let lastUpdateTime = 0
const UPDATE_COOLDOWN = 30000 // 30 seconds

export async function POST(request: NextRequest) {
    try {
        const now = Date.now()

        console.log('🔧 POST UPDATE - Starting...')
        console.log(`🔧 POST UPDATE - Current time: ${new Date().toISOString()}`)

        // ⏱️ RATE LIMIT CHECK
        if (now - lastUpdateTime < UPDATE_COOLDOWN) {
            const remainingSeconds = Math.ceil((UPDATE_COOLDOWN - (now - lastUpdateTime)) / 1000)
            return NextResponse.json({
                success: false,
                error: `Çok hızlı! ${remainingSeconds} saniye bekleyin.`,
                cooldown: remainingSeconds
            }, { status: 429 })
        }

        console.log('🔧 OPTIMIZED scholarship update started...')

        const currentTime = new Date()

        // 🔍 DETAILED EXPIRED CHECK BEFORE DELETE
        const expiredQuery = {
            deadline: { lt: currentTime },
            isActive: true
        }

        console.log('🔧 POST UPDATE - Expired query:', JSON.stringify(expiredQuery))
        console.log('🔧 POST UPDATE - Current timestamp:', currentTime.getTime())

        // Count before delete
        const expiredCountBefore = await prisma.scholarship.count({
            where: expiredQuery
        })

        console.log(`🔧 POST UPDATE - Found ${expiredCountBefore} expired scholarships to delete`)

        // Get samples before delete
        const aboutToDelete = await prisma.scholarship.findMany({
            where: expiredQuery,
            select: {
                id: true,
                title: true,
                deadline: true,
                country: true
            },
            take: 5
        })

        console.log('🔧 POST UPDATE - About to delete samples:', aboutToDelete.map(s => ({
            title: s.title,
            deadline: s.deadline.toISOString(),
            hoursAgo: Math.floor((currentTime.getTime() - s.deadline.getTime()) / (1000 * 60 * 60))
        })))

        // 1. 🗑️ DELETE ALL EXPIRED
        const allExpired = await prisma.scholarship.deleteMany({
            where: expiredQuery
        })

        console.log(`🗑️ Deleted ${allExpired.count} ALL expired scholarships`)

        // 2. 📅 UPDATE URGENT ONES (deadline < 30 days)
        const urgentBatchSize = 50 // Reduced from 75 to prevent timeout
        const urgentScholarships = await prisma.scholarship.findMany({
            where: {
                deadline: {
                    gte: currentTime, // Still active
                    lte: new Date(currentTime.getTime() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
                },
                isActive: true
            },
            take: urgentBatchSize
        })

        // Optimized: Use Promise.all for parallel updates instead of serial for loop
        const updatePromises = urgentScholarships.map(scholarship => {
            const newDeadline = generateFarFutureDeadline()
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
        const updated = updatePromises.length

        console.log(`📅 Updated ${updated} upcoming scholarship deadlines`)

        // 3. 📊 GET FINAL STATS
        const total = await prisma.scholarship.count({
            where: { isActive: true }
        })

        const stillExpired = await prisma.scholarship.count({
            where: {
                deadline: { lt: new Date() },
                isActive: true
            }
        })

        const upcomingDeadlines = await prisma.scholarship.count({
            where: {
                deadline: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                }
            }
        })

        // ⏱️ UPDATE COOLDOWN
        lastUpdateTime = now

        return NextResponse.json({
            success: true,
            message: 'Scholarship update completed successfully',
            stats: {
                expiredDeleted: allExpired.count,
                deadlinesUpdated: updated,
                totalActive: total,
                stillExpired,
                upcomingDeadlines
            },
            debug: {
                beforeDeleteCount: expiredCountBefore,
                actualDeletedCount: allExpired.count,
                samplesDeleted: aboutToDelete.length
            }
        })

    } catch (error) {
        console.error('❌ POST UPDATE Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

// ✅ GET FUNCTION FOR STATS - WITH DETAILED LOGGING
export async function GET() {
    try {
        console.log('📊 GET STATS - Starting...')
        console.log(`📊 GET STATS - Current time: ${new Date().toISOString()}`)

        const currentTime = new Date()
        console.log('📊 GET STATS - Timestamp:', currentTime.getTime())

        const total = await prisma.scholarship.count({ where: { isActive: true } })

        // 🔍 DETAILED EXPIRED CHECK
        const expiredQuery = {
            deadline: { lt: currentTime },
            isActive: true
        }

        console.log('📊 GET STATS - Expired query:', JSON.stringify(expiredQuery))

        const expired = await prisma.scholarship.count({
            where: expiredQuery
        })

        console.log(`📊 GET STATS - Found ${expired} expired scholarships`)

        // Get some samples for debugging
        const expiredSamples = await prisma.scholarship.findMany({
            where: expiredQuery,
            select: {
                id: true,
                title: true,
                deadline: true,
                country: true
            },
            take: 3
        })

        console.log('📊 GET STATS - Expired samples:', expiredSamples.map(s => ({
            title: s.title,
            deadline: s.deadline.toISOString(),
            hoursAgo: Math.floor((currentTime.getTime() - s.deadline.getTime()) / (1000 * 60 * 60))
        })))

        const urgentlyExpiring = await prisma.scholarship.count({
            where: {
                deadline: {
                    gte: currentTime,
                    lte: new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
                }
            }
        })

        const upcomingSoon = await prisma.scholarship.count({
            where: {
                deadline: {
                    gte: new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000),
                    lte: new Date(currentTime.getTime() + 30 * 24 * 60 * 60 * 1000)
                }
            }
        })

        // 🧠 ADAPTIVE THRESHOLDS
        const expiredThreshold = Math.max(15, Math.floor(total * 0.01)) // 1% of total
        const urgentThreshold = Math.max(60, Math.floor(total * 0.06))  // 6% of total

        const needsUpdate = expired > expiredThreshold || urgentlyExpiring > urgentThreshold

        const topCountries = await prisma.scholarship.groupBy({
            by: ['country'],
            _count: { id: true },
            where: { isActive: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        })

        console.log('📊 GET STATS - Final results:')
        console.log(`   Total: ${total}`)
        console.log(`   Expired: ${expired} (threshold: ${expiredThreshold})`)
        console.log(`   Urgent: ${urgentlyExpiring} (threshold: ${urgentThreshold})`)
        console.log(`   Needs Update: ${needsUpdate}`)

        return NextResponse.json({
            success: true,
            stats: {
                total,
                expired,
                urgentlyExpiring,
                upcomingSoon,
                needsUpdate,
                topCountries: topCountries.map(c => ({
                    country: c.country,
                    count: c._count.id
                }))
            },
            debug: {
                timestamp: currentTime.toISOString(),
                expiredSamplesFound: expiredSamples.length,
                thresholds: {
                    expiredLimit: expiredThreshold,
                    urgentLimit: urgentThreshold
                }
            }
        })

    } catch (error) {
        console.error('❌ GET STATS Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

// 🎯 FAR FUTURE DEADLINE GENERATOR
function generateFarFutureDeadline(): Date {
    const currentDate = new Date()
    const monthsAhead = Math.floor(Math.random() * 7) + 4 // 4 to 10 months
    const futureDate = new Date(currentDate)
    futureDate.setMonth(currentDate.getMonth() + monthsAhead)
    futureDate.setDate(Math.floor(Math.random() * 28) + 1)
    return futureDate
}