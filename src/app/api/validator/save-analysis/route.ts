import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { createAuditLog } from '@/lib/services/audit'

// Optionally import Supabase client if you want to store the exact PDF
// For now, we store the data in Postgres to render the Vault History
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('pdf') as File | null
        const fileName = formData.get('fileName') as string
        const participantName = formData.get('participantName') as string || 'Unknown Participant'
        const complianceScore = parseFloat(formData.get('complianceScore') as string || '0')

        // Parse JSON strings back to objects
        const warningsStr = formData.get('warnings') as string
        const remediationsStr = formData.get('remediations') as string
        const warnings = warningsStr ? JSON.parse(warningsStr) : []
        const remediations = remediationsStr ? JSON.parse(remediationsStr) : null

        let pdfUrl = null

        // If a Supabase bucket exists and a file was provided, upload it
        if (file && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            )

            const buffer = Buffer.from(await file.arrayBuffer())
            const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
            const storagePath = `analyses/${session.user.id}/${Date.now()}_${safeFileName}`

            const { data, error } = await supabase.storage
                .from('sovereign-vault') // Ensure this bucket exists in Supabase
                .upload(storagePath, buffer, {
                    contentType: 'application/pdf',
                    upsert: false
                })

            if (!error && data) {
                const { data: publicUrlData } = supabase.storage
                    .from('sovereign-vault')
                    .getPublicUrl(storagePath)
                pdfUrl = publicUrlData?.publicUrl
            } else {
                console.warn("Supabase Storage upload failed, proceeding without PDF URL:", error)
                // Fallback: Proceed to just save the DB record without URL if bucket is missing
            }
        }

        // Save Analysis to Prisma Document Vault
        const analysisRecord = await prisma.analysis.create({
            data: {
                userId: session.user.id,
                fileName: fileName || 'Unknown Document',
                participantName,
                complianceScore,
                warnings: warnings, // Prisma handles JSON serialization
                remediationText: remediations,
                pdfUrl,
                region: 'ap-southeast-2' // Fixed sovereign region
            }
        })

        // Log to Audit Trail
        await createAuditLog({
            action: 'ANALYSIS_SAVED_TO_VAULT',
            actorId: session.user.id,
            resourceId: analysisRecord.id,
            resourceType: 'Analysis',
            metadata: {
                fileName,
                complianceScore,
                storage: pdfUrl ? 'Supabase' : 'Database Only',
                region: 'ap-southeast-2'
            }
        })

        return NextResponse.json({ success: true, id: analysisRecord.id, pdfUrl }, { status: 200 })
    } catch (error: any) {
        console.error('Save Analysis API Error:', error)
        return NextResponse.json(
            { error: 'Failed to save analysis to Document Vault' },
            { status: 500 }
        )
    }
}
