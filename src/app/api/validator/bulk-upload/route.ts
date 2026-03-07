import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { uploadPdfToAzure, generateUniqueName } from '@/lib/azure-storage'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const fileName = file.name
        const uniqueName = generateUniqueName(fileName)
        const storagePath = `bulk-analyses/${session.user.id}/${uniqueName}`

        // 1. Upload the raw PDF to Azure Blob Storage
        const buffer = Buffer.from(await file.arrayBuffer())
        const fileUrl = await uploadPdfToAzure(buffer, storagePath)

        if (!fileUrl) {
            return NextResponse.json({ error: 'Failed to securely store file in Azure' }, { status: 500 })
        }

        // 2. Create the pending 'AnalysisTask' in Neon DB
        const task = await prisma.analysisTask.create({
            data: {
                userId: session.user.id,
                fileName: fileName,
                status: 'pending',
                fileUrl: fileUrl,
            }
        })

        return NextResponse.json({ success: true, taskId: task.id }, { status: 200 })

    } catch (error: any) {
        console.error('Bulk Upload Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error during Bulk Upload' },
            { status: 500 }
        )
    }
}
