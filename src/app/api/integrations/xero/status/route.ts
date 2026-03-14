import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

/**
 * GET /api/integrations/xero/status
 * Returns the Xero connection state for the authenticated user.
 */
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = await prisma.xeroToken.findUnique({
        where: { userId: session.user.id },
        select: { tenantName: true, tenantId: true, expiresAt: true },
    })

    if (!token) {
        return NextResponse.json({ connected: false })
    }

    return NextResponse.json({
        connected: true,
        tenantName: token.tenantName,
        tenantId: token.tenantId,
        expiresAt: token.expiresAt,
    })
}
