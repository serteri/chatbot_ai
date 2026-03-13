import { NextRequest, NextResponse } from 'next/server'
import { AzureOpenAI } from 'openai'

// ---------------------------------------------------------------------------
// PUBLIC DEMO API — Limited Extraction (Returns 1 Gap)
// Security: Ratelimit via edge or simply omitting PII and returning only top gap
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a strict NDIS Compliance Auditor. Analyze the text of this Service Agreement snippet.
Return a STRICT JSON object containing:
- "complianceScore": number (0-100 estimate based on the text provided)
- "topWarning": string or null (Identify the single most critical compliance failure against NDIS 2025/26 guidelines. Emphasize missing cancellation policies, pricing caps, or undefined consent clauses. If it's perfect, return null)

Output ONLY valid JSON.`

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file || !file.name.toLowerCase().endsWith('.pdf') || file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'Please upload a PDF under 2MB for the demo.' }, { status: 400 })
        }

        // Basic Text extraction
        // To keep demo fast/lightweight, we'll extract the first few KB using buffer toString fallback if pdf-parse is heavy, 
        // but since we have pdf-parse-fork, we will use it safely.
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const pdfParse = (await import('pdf-parse-fork')).default
        const data = await pdfParse(buffer)

        const extractedText = data.text || ''
        if (extractedText.trim().length < 50) {
            return NextResponse.json({ error: 'Text extraction failed. Try a standard PDF.' }, { status: 422 })
        }

        // Cap analysis to first 10,000 characters for speed and cost
        const truncatedText = extractedText.slice(0, 10000)

        // Init Azure OpenAI
        const apiKey = process.env.AZURE_OPENAI_API_KEY
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT
        const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME

        if (!apiKey || !endpoint || !deploymentName) throw new Error('Azure Settings Missing')

        const azureClient = new AzureOpenAI({
            apiKey,
            endpoint,
            deployment: deploymentName,
            apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
        })

        const completion = await azureClient.chat.completions.create({
            model: deploymentName,
            temperature: 0.1,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Analyze this document snippet:\n\n---\n${truncatedText}\n---` },
            ],
        })

        const aiResponse = completion.choices[0]?.message?.content
        if (!aiResponse) throw new Error('Empty AI response')

        const result = JSON.parse(aiResponse)

        return NextResponse.json({
            success: true,
            score: result.complianceScore || 50,
            warning: result.topWarning || 'Missing clear NDIS 2025/26 cancellation policy.'
        })

    } catch (error: any) {
        console.error('Demo API Error:', error)
        return NextResponse.json({ error: 'Demo processing failed temporarily' }, { status: 500 })
    }
}
