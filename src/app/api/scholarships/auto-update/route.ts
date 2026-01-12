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

// GET /api/scholarships/auto-update - Get stats
export async function GET() {
    try {
        const stats = await UnifiedScholarshipManager.getStats()
        return NextResponse.json({
            success: true,
            stats
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}