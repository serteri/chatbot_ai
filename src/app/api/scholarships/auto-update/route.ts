// API ROUTES FOR PRODUCTION AUTO-UPDATE
// src/app/api/scholarships/auto-update/route.ts

import { NextRequest, NextResponse } from 'next/server'
import ProductionScholarshipAutoUpdate from '@/lib/scholarship-sync/production-auto-update'

// POST /api/scholarships/auto-update - Refresh expired deadlines
export async function POST(request: NextRequest) {
    try {
        console.log('🔄 API: Auto-updating scholarships...')

        const result = await ProductionScholarshipAutoUpdate.refreshExpiredDeadlines()

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

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

// GET /api/scholarships/auto-update - Get stats
export async function GET() {
    try {
        const result = await ProductionScholarshipAutoUpdate.getStats()

        if (result.success) {
            return NextResponse.json({
                success: true,
                stats: result.stats
            })
        } else {
            return NextResponse.json({
                success: false,
                error: result.error
            }, { status: 500 })
        }

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}