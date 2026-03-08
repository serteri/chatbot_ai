import { NextRequest, NextResponse } from 'next/server'
import { getAzureOpenAIClient, extractTextFromPDF, SYSTEM_PROMPT } from '@/app/api/validator/analyze/route'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
        }
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json({ error: 'Only PDF files are accepted.' }, { status: 400 })
        }
        if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json({ error: 'File exceeds 20MB limit.' }, { status: 400 })
        }

        let extractedText: string
        try {
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            extractedText = await extractTextFromPDF(buffer)
        } catch (err: any) {
            return NextResponse.json(
                { error: 'Failed to extract text from this document format.' },
                { status: 500 }
            )
        }

        if (!extractedText || extractedText.trim().length < 50) {
            return NextResponse.json(
                { error: 'The PDF appears to be empty or contains only images. Please upload a text-based PDF.' },
                { status: 422 }
            )
        }

        const truncatedText = extractedText.slice(0, 60000)
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
        if (!aiResponse) {
            return NextResponse.json({ error: 'AI analysis failed.' }, { status: 500 })
        }

        let analysis: Record<string, unknown>
        try {
            analysis = JSON.parse(aiResponse)
        } catch {
            return NextResponse.json({ error: 'AI returned malformed data.' }, { status: 500 })
        }

        // Return the full analysis, client will filter to show only 1 gap
        return NextResponse.json({
            success: true,
            fileName: file.name,
            fileSize: file.size,
            analysis,
            analyzedAt: new Date().toISOString()
        })
    } catch (error) {
        console.error('[Demo Validator API] Unexpected error:', error)
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
    }
}
