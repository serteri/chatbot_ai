import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Cron Job: Her ayın 1'inde Free kullanıcıların dönemlerini sıfırla
 * Schedule: 0 0 1 * * (Her ayın 1'i 00:00 UTC)
 * 
 * Bu endpoint Vercel Cron tarafından otomatik çağrılır.
 * Manuel test için: curl -X GET /api/cron/reset-free-subscriptions -H "Authorization: Bearer CRON_SECRET"
 */
export async function GET(req: NextRequest) {
    try {
        // Güvenlik: Cron secret kontrolü
        const authHeader = req.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        // Vercel Cron otomatik olarak CRON_SECRET header'ı gönderir
        // veya manuel test için Authorization: Bearer CRON_SECRET
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            // Vercel'in kendi cron çağrılarında farklı header kullanabilir
            // Eğer CRON_SECRET tanımlıysa ve eşleşmiyorsa, Vercel'in x-vercel-cron-signature'ı kontrol et
            const vercelSignature = req.headers.get('x-vercel-cron-signature')
            if (!vercelSignature) {
                console.log('🚫 Unauthorized cron access attempt')
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        console.log('🔄 Starting monthly free subscription reset...')
        const now = new Date()

        // Bu ayın 1'i ve gelecek ayın 1'ini hesapla
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)

        // Free kullanıcıların dönemlerini güncelle
        const result = await prisma.subscription.updateMany({
            where: {
                planType: 'free',
                OR: [
                    { currentPeriodEnd: { lt: now } }, // Süresi geçmiş
                    { currentPeriodEnd: null }         // Hiç ayarlanmamış
                ]
            },
            data: {
                currentPeriodStart: currentMonthStart,
                currentPeriodEnd: nextMonthStart,
                conversationsUsed: 0 // Yeni dönem için sıfırla
            }
        })

        console.log(`✅ Reset ${result.count} free subscriptions`)
        console.log(`   Period: ${currentMonthStart.toISOString()} -> ${nextMonthStart.toISOString()}`)

        return NextResponse.json({
            success: true,
            message: `Reset ${result.count} free subscriptions`,
            period: {
                start: currentMonthStart.toISOString(),
                end: nextMonthStart.toISOString()
            },
            timestamp: now.toISOString()
        })

    } catch (error) {
        console.error('❌ Cron job error:', error)
        return NextResponse.json(
            { error: 'Cron job failed', details: String(error) },
            { status: 500 }
        )
    }
}
