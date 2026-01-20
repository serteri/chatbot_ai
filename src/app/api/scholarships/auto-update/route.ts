// API ROUTES FOR SCHOLARSHIP SYNC & AUTO-UPDATE
// src/app/api/scholarships/auto-update/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { UnifiedScholarshipManager } from '@/lib/unified-scholarship-manager'

// POST /api/scholarships/auto-update
// Supports actions: 'refresh' (default) or 'full-sync'
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action') || 'refresh'

        if (action === 'full-sync') {
            console.log('🔄 API: Starting Full Scholarship Sync...')
            const result = await UnifiedScholarshipManager.syncAll()

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    message: 'Full sync completed successfully',
                })
            } else {
                return NextResponse.json({
                    success: false,
                    error: result.error
                }, { status: 500 })
            }
        } else {
            // Default: Refresh deadlines
            const result = await UnifiedScholarshipManager.refreshDeadlines()

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    message: `${result.updated} scholarship deadlines refreshed`,
                    updated: result.updated
                })
            } else {
                return NextResponse.json({
                    success: false,
                    error: result.error
                }, { status: 500 })
            }
        }

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

// GET /api/scholarships/auto-update - Vercel Cron calls this!
// This endpoint performs the actual auto-update (delete expired + refresh urgent)
export async function GET(request: NextRequest) {
    try {
        // Check if this is a Vercel Cron request
        const authHeader = request.headers.get('authorization')
        const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`
        const isCronRequest = request.headers.get('x-vercel-cron') === '1'

        console.log('📅 Auto-update GET called')
        console.log(`   Is Vercel Cron: ${isCronRequest}`)
        console.log(`   Time: ${new Date().toISOString()}`)

        // If this is a cron request OR there's no CRON_SECRET set, perform the update
        if (isCronRequest || isVercelCron || !process.env.CRON_SECRET) {
            console.log('🔄 Running automatic scholarship refresh...')

            const result = await UnifiedScholarshipManager.refreshDeadlines()

            if (result.success) {
                console.log(`✅ Auto-update completed: ${result.deleted} deleted, ${result.updated} updated`)
                return NextResponse.json({
                    success: true,
                    message: 'Auto-update completed',
                    deleted: result.deleted,
                    updated: result.updated,
                    timestamp: new Date().toISOString()
                })
            } else {
                console.error('❌ Auto-update failed:', result.error)
                return NextResponse.json({
                    success: false,
                    error: result.error
                }, { status: 500 })
            }
        } else {
            // Just return stats for regular GET requests
            const stats = await UnifiedScholarshipManager.getStats()
            return NextResponse.json({
                success: true,
                stats
            })
        }
    } catch (error: any) {
        console.error('❌ Auto-update error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}