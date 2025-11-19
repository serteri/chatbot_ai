// QUICK DEBUG ENDPOINT
// src/app/api/admin/debug-stats/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const now = new Date()
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        // Get detailed counts
        const counts = {
            total: await prisma.scholarship.count({ where: { isActive: true } }),

            expired: await prisma.scholarship.count({
                where: {
                    deadline: { lt: now },
                    isActive: true
                }
            }),

            urgent: await prisma.scholarship.count({
                where: {
                    deadline: { gte: now, lte: sevenDaysFromNow }
                }
            }),

            upcoming: await prisma.scholarship.count({
                where: {
                    deadline: { gte: sevenDaysFromNow, lte: thirtyDaysFromNow }
                }
            }),

            farFuture: await prisma.scholarship.count({
                where: {
                    deadline: { gt: thirtyDaysFromNow }
                }
            })
        }

        // Sample expired scholarships
        const expiredSamples = await prisma.scholarship.findMany({
            where: {
                deadline: { lt: now },
                isActive: true
            },
            select: {
                id: true,
                title: true,
                deadline: true,
                country: true
            },
            take: 5
        })

        // Sample urgent scholarships
        const urgentSamples = await prisma.scholarship.findMany({
            where: {
                deadline: { gte: now, lte: sevenDaysFromNow }
            },
            select: {
                id: true,
                title: true,
                deadline: true,
                country: true
            },
            take: 5
        })

        return NextResponse.json({
            timestamp: now.toISOString(),
            counts,
            thresholds: {
                expired: 'deadline < now',
                urgent: 'deadline in next 7 days',
                upcoming: 'deadline 7-30 days',
                farFuture: 'deadline > 30 days'
            },
            samples: {
                expired: expiredSamples,
                urgent: urgentSamples
            },
            needsUpdateLogic: {
                current: counts.expired > 5 || counts.urgent > 50,
                expiredThreshold: 5,
                urgentThreshold: 50,
                actualExpired: counts.expired,
                actualUrgent: counts.urgent
            }
        })

    } catch (error) {
        return NextResponse.json({
            error: error.message
        }, { status: 500 })
    }
}