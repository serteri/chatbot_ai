import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { SYSTEM_PROMPT, getAzureOpenAIClient, extractTextFromPDF } from '@/app/api/validator/analyze/route'
import { downloadBlobAsBuffer } from '@/lib/azure-storage'

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
            console.log(`[Bulk Process] Starting task ${taskId} for file: ${task.fileName}`)
            console.log(`[Bulk Process] Attempting to securely download blob from Azure Storage URL: ${task.fileUrl}`)

            // Extract the exact exact blob path for the SDK
            const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'ndis-vault'
            const urlParts = new URL(task.fileUrl!)
            const blobName = decodeURIComponent(urlParts.pathname.substring(`/${AZURE_STORAGE_CONTAINER_NAME}/`.length))

            console.log(`[Bulk Process] Extracted BlobName target: "${blobName}"`)

            // Call our secure Azure SDK downloader:
            const buffer = await downloadBlobAsBuffer(blobName)
            if (!buffer) {
                console.error(`[Bulk Process] Azure SDK download returned null for BlobName: "${blobName}"`)
                throw new Error('Failed to fetch file from Azure Sovereign Storage')
            }

            console.log(`[Bulk Process] Successfully downloaded ${buffer.length} bytes. Extracting text...`)

            // 1. Extract Text
            const extractedText = await extractTextFromPDF(buffer)
            if (!extractedText || extractedText.trim().length < 50) {
                throw new Error('The PDF appears to be empty or contains only images. Please upload a text-based PDF.')
            }

            // 2. Truncate for token limits
            const truncatedText = extractedText.slice(0, 60000)

            console.log(`[Bulk Process] Text extracted (${truncatedText.length} chars). Calling Azure OpenAI...`)

            // 3. Call Azure OpenAI (Sydney)
            const azureClient = getAzureOpenAIClient()
            const completion = await azureClient.chat.completions.create({
                model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'pylonchat-v1',
                temperature: 0.1,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: `Analyze this NDIS Service Agreement:\n\n---\n${truncatedText}\n---`,
                    },
                ],
            })

            const aiResponse = completion.choices[0]?.message?.content
            if (!aiResponse) throw new Error('AI analysis failed to return a response.')

            let analysisResult: Record<string, any>
            try {
                analysisResult = JSON.parse(aiResponse)
            } catch {
                throw new Error('AI returned malformed data. Please try again.')
            }

            console.log(`[Bulk Process] Completed AI Analysis for ${task.fileName}. Saving to DB...`)

            // 4. After AI extraction, save the result to the main vault Analysis DB.
            const newAnalysis = await prisma.analysis.create({
                data: {
                    userId: session.user.id,
                    fileName: task.fileName,
                    participantName: analysisResult.participantName || 'Unknown',
                    complianceScore: analysisResult.complianceScore || 0,
                    warnings: analysisResult.warnings || [],
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
