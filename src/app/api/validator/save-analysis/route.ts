import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { createAuditLog } from '@/lib/services/audit'

// Azure Blob Storage for sovereign vault storage
import { uploadPdfToAzure, generateUniqueName } from '@/lib/azure-storage'
import { normalizeToISO } from '@/lib/utils/dateNormalizer'

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
        const documentStartDate = normalizeToISO(formData.get('documentStartDate') as string)
        const documentEndDate = normalizeToISO(formData.get('documentEndDate') as string)
        const complianceScore = parseFloat(formData.get('complianceScore') as string || '0')
        const taskId = formData.get('taskId') as string | null

        // Parse JSON strings back to objects
        const warningsStr = formData.get('warnings') as string
        const remediationsStr = formData.get('remediations') as string
        const warnings = warningsStr ? JSON.parse(warningsStr) : []
        const remediations = remediationsStr ? JSON.parse(remediationsStr) : null

        let pdfUrl = null

        // If an Azure Storage bucket exists and a file was provided, upload it
        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const uniqueName = generateUniqueName(fileName)
            const storagePath = `analyses/${session.user.id}/${uniqueName}`

            pdfUrl = await uploadPdfToAzure(buffer, storagePath)
        }

        // Save Analysis to Prisma Document Vault
        const analysisRecord = await prisma.analysis.create({
            data: {
                userId: session.user.id,
                fileName: fileName || 'Unknown Document',
                participantName,
                documentStartDate,
                documentEndDate,
                complianceScore,
                warnings: warnings, // Prisma handles JSON serialization
                remediationText: remediations,
                pdfUrl,
                region: 'ap-southeast-2' // Fixed sovereign region
            }
        })

        // ── Sync manually-entered dates back to the AnalysisTask ──
        if (taskId) {
            try {
                await prisma.analysisTask.update({
                    where: { id: taskId },
                    data: {
                        participantName,
                        documentStartDate,
                        documentEndDate,
                        complianceScore,
                        analysisId: analysisRecord.id,
                    }
                })
                console.log(`[Save Analysis] Synced dates back to AnalysisTask ${taskId}`)
            } catch (syncErr) {
                console.warn(`[Save Analysis] Could not sync to AnalysisTask ${taskId}:`, syncErr)
            }
        }

        // Log to Audit Trail
        await createAuditLog({
            action: 'ANALYSIS_SAVED_TO_VAULT',
            actorId: session.user.id,
            resourceId: analysisRecord.id,
            resourceType: 'Analysis',
            metadata: {
                fileName,
                complianceScore,
                storage: pdfUrl ? 'Azure Blob Storage' : 'Database Only',
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
