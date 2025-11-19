// ADMIN AUTHENTICATION API
// src/app/api/admin/auth/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()

        // ✅ ENV VARIABLE'DAN ŞIFRE OKU
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2024' // Fallback

        console.log('🔐 Admin auth attempt...')

        if (password === ADMIN_PASSWORD) {
            console.log('✅ Admin authentication successful')

            return NextResponse.json({
                success: true,
                message: 'Authentication successful'
            })
        } else {
            console.log('❌ Admin authentication failed')

            return NextResponse.json({
                success: false,
                message: 'Invalid password'
            }, { status: 401 })
        }

    } catch (error) {
        console.error('❌ Admin auth error:', error)
        return NextResponse.json({
            success: false,
            error: 'Authentication error'
        }, { status: 500 })
    }
}