import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { analyzeNDISDocument } from '@/app/api/validator/analyze/route'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { taskId } = body

        if (!taskId) {
            return NextResponse.json({ error: 'Missing taskId' }, { status: 400 })
        }

        // Fetch pending task
        const task = await prisma.analysisTask.findUnique({
            where: { id: taskId, userId: session.user.id }
        })

        if (!task || task.status !== 'pending') {
            return NextResponse.json({ error: 'Task not found or already processed' }, { status: 404 })
        }

        // Mark as processing
        await prisma.analysisTask.update({
            where: { id: taskId },
            data: { status: 'processing' }
        })

        try {
            // Note: In a production Vercel app with large files, Azure Blob raw data needs passing to LLM directly.
            // For now, we simulate fetching the file from fileUrl, parsing it and sending it to our own logic.
            // Calling analyzeNDISDocument requires a File/FormData, so we'll mock the extraction here for simplicity
            // or we can reuse `analyzeNDISDocument` if we fetch the blob buffer.

            // Fetch file from Azure Blob
            const response = await fetch(task.fileUrl!)
            if (!response.ok) throw new Error('Failed to fetch file from Azure Sovereign Storage')

            const blob = await response.blob()
            const file = new File([blob], task.fileName, { type: 'application/pdf' })

            // Reuse existing extraction logic
            const formData = new FormData()
            formData.append('file', file)

            // Since `analyzeNDISDocument` is not natively exported, we'll build a direct internal mock call for now,
            // or ideally we could just POST to our own `/api/validator/analyze` locally. 
            // In a real next.js API call chaining scenario:

            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
            const analyzeRes = await fetch(`${appUrl}/api/validator/analyze`, {
                method: 'POST',
                body: formData,
                headers: {
                    // Forward session cookie for Auth Context
                    cookie: request.headers.get('cookie') || ''
                }
            })

            const analysisResult = await analyzeRes.json()

            if (!analyzeRes.ok) {
                throw new Error(analysisResult.error || 'Failed Analysis Engine')
            }

            // After AI extraction, save the result to the main vault Analysis DB.
            const newAnalysis = await prisma.analysis.create({
                data: {
                    userId: session.user.id,
                    fileName: task.fileName,
                    participantName: analysisResult.analysis.participantName || 'Unknown',
                    complianceScore: analysisResult.analysis.complianceScore || 0,
                    warnings: analysisResult.analysis.warnings || [],
                    // Auto generate fixes for every warning (optional bulk param)
                    remediationText: null,
                    pdfUrl: task.fileUrl,
                    region: 'ap-southeast-2'
                }
            })

            // Mark task completed and link it
            await prisma.analysisTask.update({
                where: { id: taskId },
                data: {
                    status: 'completed',
                    analysisId: newAnalysis.id
                }
            })

            return NextResponse.json({ success: true, analysisId: newAnalysis.id })

        } catch (jobError: any) {
            console.error(`Processing Task ${taskId} failed:`, jobError)

            // Mark task as failed
            await prisma.analysisTask.update({
                where: { id: taskId },
                data: { status: 'failed' }
            })

            return NextResponse.json({ error: 'Analysis failed for this file', details: jobError.message }, { status: 500 })
        }


    } catch (error: any) {
        console.error('Bulk Process Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
