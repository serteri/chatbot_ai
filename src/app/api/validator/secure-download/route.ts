import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { generateSasUrl } from '@/lib/azure-storage'

// ---------------------------------------------------------------------------
// GET /api/validator/secure-download?url=<blobUrl>
// Generates a temporary 1-hour SAS token for private blob access
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const blobUrl = request.nextUrl.searchParams.get('url')

        if (!blobUrl) {
            return NextResponse.json({ error: 'Missing blob URL parameter' }, { status: 400 })
        }

        const sasUrl = generateSasUrl(blobUrl)

        if (!sasUrl) {
            return NextResponse.json(
                { error: 'Failed to generate secure download link' },
                { status: 500 }
            )
        }

        console.log(`[Secure Download] Generated 1-hour SAS token for user ${session.user.id}`)

        return NextResponse.json({ url: sasUrl })
    } catch (error: any) {
        console.error('Secure Download API Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
