import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { BlobServiceClient } from '@azure/storage-blob'
import crypto from 'crypto'

// ---------------------------------------------------------------------------
// POST /api/user/branding — Upload logo to Azure 'branding-assets' container
// ---------------------------------------------------------------------------

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || ''
const BRANDING_CONTAINER = 'branding-assets'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('logo') as File | null
        const companyName = formData.get('companyName') as string | null

        // Update companyName if provided
        if (companyName !== null) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { companyName: companyName.trim() || null }
            })
        }

        // Upload logo if provided
        if (file && file.size > 0) {
            // Validate
            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
            }
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({ error: 'Logo must be under 5MB' }, { status: 400 })
            }

            const buffer = Buffer.from(await file.arrayBuffer())
            const ext = file.name.split('.').pop() || 'png'
            const uniqueName = `${session.user.id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`

            const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
            const containerClient = blobServiceClient.getContainerClient(BRANDING_CONTAINER)
            await containerClient.createIfNotExists()

            const blockBlobClient = containerClient.getBlockBlobClient(uniqueName)
            await blockBlobClient.uploadData(buffer, {
                blobHTTPHeaders: { blobContentType: file.type },
                metadata: { userId: session.user.id, region: 'ap-southeast-2' }
            })

            const logoUrl = blockBlobClient.url

            // Save to user record
            await prisma.user.update({
                where: { id: session.user.id },
                data: { logoUrl }
            })

            console.log(`[Branding] Uploaded logo for user ${session.user.id}: ${uniqueName}`)

            return NextResponse.json({
                success: true,
                logoUrl,
                companyName: companyName?.trim() || null
            })
        }

        return NextResponse.json({ success: true, companyName: companyName?.trim() || null })
    } catch (error: any) {
        console.error('Branding API Error:', error)
        return NextResponse.json({ error: 'Failed to save branding' }, { status: 500 })
    }
}

// GET: Fetch current branding data
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { companyName: true, logoUrl: true }
        })

        return NextResponse.json({
            companyName: user?.companyName || null,
            logoUrl: user?.logoUrl || null
        })
    } catch (error: any) {
        console.error('Branding GET Error:', error)
        return NextResponse.json({ error: 'Failed to fetch branding' }, { status: 500 })
    }
}
