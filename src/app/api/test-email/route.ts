import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/helpers'
import { auth } from '@/lib/auth/auth'

export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const result = await sendWelcomeEmail({
            to: session.user.email!,
            userName: session.user.name || 'Kullanıcı'
        })

        return NextResponse.json({
            success: result.success,
            message: result.success ? 'Email gönderildi!' : 'Email gönderilemedi',
            data: result.data,
            error: result.error
        })

    } catch (error) {
        console.error('Test email error:', error)
        return NextResponse.json({
            error: 'Bir hata oluştu',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}