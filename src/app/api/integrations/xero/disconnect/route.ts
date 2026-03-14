import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

/**
 * DELETE /api/integrations/xero/disconnect
 * Removes the stored Xero token, effectively disconnecting the integration.
 */
export async function DELETE() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        await prisma.xeroToken.delete({
            where: { userId: session.user.id },
        })
        return NextResponse.json({ success: true })
    } catch {
        // Token didn't exist — treat as already disconnected
        return NextResponse.json({ success: true })
    }
}
