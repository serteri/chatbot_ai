import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
    try {
        // ── 1. Auth ───────────────────────────────────────────────────────
        const session = await auth()
        if (!session?.user?.id) {
            console.warn('[SETTINGS PATCH] 401 — no session')
            return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
        }
        const userId = session.user.id

        // ── 2. Parse body ─────────────────────────────────────────────────
        let body: Record<string, unknown>
        try {
            body = await req.json()
        } catch (parseErr) {
            console.error('[SETTINGS PATCH] Failed to parse request body:', parseErr)
            return NextResponse.json({ error: 'Geçersiz istek gövdesi.' }, { status: 400 })
        }

        const {
            name,
            abn,
            ndisProviderNumber,
            businessAddress,
            contactPhone,
            emailNotifications,
            // marketingEmails is not in the DB schema — stored client-side only for now
        } = body

        // ── 3. Build update payload — only fields that exist in schema ────
        const updateData: Record<string, unknown> = {}

        if (name              !== undefined) updateData.name              = name
        if (abn               !== undefined) updateData.abn               = abn
        if (ndisProviderNumber !== undefined) updateData.ndisProviderNumber = ndisProviderNumber
        if (businessAddress   !== undefined) updateData.businessAddress   = businessAddress
        if (contactPhone      !== undefined) updateData.contactPhone      = contactPhone
        if (typeof emailNotifications === 'boolean') {
            updateData.emailNotifications = emailNotifications
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: true, message: 'Değişiklik yok.' })
        }

        console.log('[SETTINGS PATCH] Updating user', userId, '| fields:', Object.keys(updateData).join(', '))

        // ── 4. DB update ──────────────────────────────────────────────────
        await prisma.user.update({
            where: { id: userId },
            data:  updateData,
        })

        console.log('[SETTINGS PATCH] Success for user', userId)
        return NextResponse.json({ success: true, message: 'Ayarlar güncellendi' })

    } catch (error: unknown) {
        // Detailed log — visible in Vercel Functions logs
        console.error('[SETTINGS PATCH] Unhandled error:', error)

        if (error instanceof Error) {
            console.error('[SETTINGS PATCH] name   :', error.name)
            console.error('[SETTINGS PATCH] message:', error.message)
            console.error('[SETTINGS PATCH] stack  :', error.stack)
        }

        return NextResponse.json(
            { error: 'Sunucu tarafında bir hata oluştu.', detail: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}

// ── GET — read current settings (used by Settings page on load) ──────────────
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where:  { id: session.user.id },
            select: {
                name:               true,
                email:              true,
                image:              true,
                abn:                true,
                ndisProviderNumber: true,
                businessAddress:    true,
                contactPhone:       true,
                emailNotifications: true,
                companyName:        true,
            },
        })

        return NextResponse.json({ user })

    } catch (error) {
        console.error('[SETTINGS GET] Error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
