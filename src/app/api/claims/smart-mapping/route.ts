import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getSmartMappingSuggestion } from '@/lib/claims/smart-mapping'

/**
 * GET /api/claims/smart-mapping?ndisNumber=XXXXXXXXX
 *
 * Returns the most recent VERIFIED claim data for a participant,
 * used by the Edit Claim modal to display "✨ Based on previous history" hints.
 */
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ndisNumber = new URL(req.url).searchParams.get('ndisNumber') ?? ''
    if (!ndisNumber.trim()) {
        return NextResponse.json({ suggestion: null })
    }

    const suggestion = await getSmartMappingSuggestion(ndisNumber, session.user.id)
    return NextResponse.json({ suggestion })
}
