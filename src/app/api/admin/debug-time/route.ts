// DEBUG TIME ZONE & STATS SYNC
// src/app/api/admin/debug-time/route.ts (YENİ DOSYA)

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const now = new Date()

        // Get current expired scholarships with details
        const currentExpired = await prisma.scholarship.findMany({
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
            take: 10
        })

        // Get statistics at this exact moment
        const stats = {
            currentTime: now.toISOString(),
            currentTimeLocal: now.toLocaleString('tr-TR'),
            currentTimeUTC: now.toUTCString(),

            totalCount: await prisma.scholarship.count({ where: { isActive: true } }),

            expiredCount: await prisma.scholarship.count({
                where: {
                    deadline: { lt: now },
                    isActive: true
                }
            }),

            // Check different time ranges
            expiredToday: await prisma.scholarship.count({
                where: {
                    deadline: {
                        lt: now,
                        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Today start
                    },
                    isActive: true
                }
            }),

            expiredYesterday: await prisma.scholarship.count({
                where: {
                    deadline: {
                        lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                        gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Yesterday
                    },
                    isActive: true
                }
            }),

            expiredLast7Days: await prisma.scholarship.count({
                where: {
                    deadline: {
                        lt: now,
                        gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    },
                    isActive: true
                }
            })
        }

        return NextResponse.json({
            debug: {
                serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timestamps: {
                    iso: now.toISOString(),
                    local: now.toLocaleString(),
                    utc: now.toUTCString(),
                    timestamp: now.getTime()
                }
            },
            stats,
            expiredSamples: currentExpired.map(s => ({
                ...s,
                deadline: s.deadline.toISOString(),
                deadlineLocal: s.deadline.toLocaleString('tr-TR'),
                isExpired: s.deadline < now,
                hoursAgo: Math.floor((now.getTime() - s.deadline.getTime()) / (1000 * 60 * 60))
            })),
            explanation: {
                question: "Panel neden 0 expired gösterdi ama API 5 sildi?",
                possibilities: [
                    "1. Panel cache'den eski stats gösteriyordu",
                    "2. Update sonrası panel refresh olmadı",
                    "3. Frontend/Backend time zone farkı",
                    "4. Stats calculation timing difference"
                ]
            }
        })

    } catch (error) {
        return NextResponse.json({
            error: error.message
        }, { status: 500 })
    }
}