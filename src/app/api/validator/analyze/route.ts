import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createAuditLog } from '@/lib/services/audit'
import OpenAI from 'openai'

// Polyfill for DOMMatrix (Needed for pdf-parse in Node/Server environments)
if (typeof global.DOMMatrix === 'undefined') {
    global.DOMMatrix = class DOMMatrix {
        matrix: any;
        constructor(arg?: any) { this.matrix = arg; }
    } as any;
}

// ---------------------------------------------------------------------------
// NDIS Service Agreement Analyzer — Azure OpenAI Sydney
// POST /api/validator/analyze
// Infrastructure: Azure OpenAI (ap-southeast-2, Sydney)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are an NDIS Support Coordinator. Analyze the text of this Service Agreement.

Return a JSON object containing:
- "participantName": string or null (the participant's full name)
- "totalFunding": number (total plan funding in AUD)
- "startDate": string (plan start date, e.g. "2025-07-01")
- "endDate": string (plan end date, e.g. "2026-06-30")
- "lineItems": array of objects, each with:
  - "code": string (NDIS line item code, e.g. "04_590_0125_6_1")
  - "description": string (what the line item covers)
  - "budget": number (allocated budget in AUD)
- "complianceScore": number between 0 and 100 (based on required clauses present)
- "warnings": array of strings (each warning describes a missing or non-compliant element)
- "summary": string (2-3 sentence overview of the agreement)

Check for these common compliance issues and add them to "warnings":
- Missing cancellation policy (required under NDIS Terms of Business)
- Missing incident reporting procedures
- Missing consent clauses for data collection
- Pricing exceeding NDIS Price Guide 2025/26 limits
- Missing ABN or provider registration number
- Missing participant goals or outcomes
- Missing nominated representative details

If the document is NOT an NDIS Service Agreement, return:
{ "error": "This document does not appear to be an NDIS Service Agreement.", "complianceScore": 0 }

Be thorough and precise. Australian NDIS providers rely on your analysis for audit readiness.`

// ---------------------------------------------------------------------------
// Azure OpenAI Client (Sydney — ap-southeast-2)
// ---------------------------------------------------------------------------

function getAzureOpenAIClient(): OpenAI {
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME

    if (!apiKey || !endpoint || !deploymentName) {
        throw new Error(
            'Azure OpenAI environment variables are not configured. ' +
            'Set AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT_NAME.'
        )
    }

    // Remove trailing slash from endpoint if present
    const cleanEndpoint = endpoint.replace(/\/+$/, '')

    return new OpenAI({
        apiKey,
        baseURL: `${cleanEndpoint}/openai/deployments/${deploymentName}`,
        defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview' },
        defaultHeaders: { 'api-key': apiKey },
    })
}

// ---------------------------------------------------------------------------
// PDF Text Extraction
// ---------------------------------------------------------------------------

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    return data.text
}

// ---------------------------------------------------------------------------
// POST Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
    try {
        // ── Auth ──
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            )
        }

        // ── Parse FormData ──
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided.' },
                { status: 400 }
            )
        }

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json(
                { error: 'Only PDF files are accepted.' },
                { status: 400 }
            )
        }

        if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File exceeds 20MB limit.' },
                { status: 400 }
            )
        }

        console.log('File received:', { name: file.name, size: file.size, type: file.type })

        // ── Extract PDF Text ──
        let extractedText: string

        try {
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            extractedText = await extractTextFromPDF(buffer)
        } catch (err: any) {
            console.error('PDF Parsing Error:', err?.message || err)
            return NextResponse.json(
                { error: `Failed to read PDF. ${err?.message || 'The file may be corrupted or password-protected.'}` },
                { status: 422 }
            )
        }

        if (!extractedText || extractedText.trim().length < 50) {
            return NextResponse.json(
                { error: 'The PDF appears to be empty or contains only images. Please upload a text-based PDF.' },
                { status: 422 }
            )
        }

        // ── Truncate for token limits ──
        const truncatedText = extractedText.slice(0, 60000)

        // ── Call Azure OpenAI (Sydney) ──
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
            return NextResponse.json(
                { error: 'AI analysis failed to return a response.' },
                { status: 500 }
            )
        }

        // ── Parse AI JSON ──
        let analysis: Record<string, unknown>
        try {
            analysis = JSON.parse(aiResponse)
        } catch {
            return NextResponse.json(
                { error: 'AI returned malformed data. Please try again.' },
                { status: 500 }
            )
        }

        // ── Audit Log ──
        await createAuditLog({
            action: 'DOCUMENT_ANALYZED',
            actorId: session.user.id,
            metadata: {
                fileName: file.name,
                fileSize: file.size,
                complianceScore: analysis.complianceScore,
                warningsCount: Array.isArray(analysis.warnings) ? analysis.warnings.length : 0,
                region: 'Sydney (ap-southeast-2)',
                provider: 'Azure OpenAI',
                deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
            },
        })

        // ── Return ──
        return NextResponse.json({
            success: true,
            fileName: file.name,
            fileSize: file.size,
            analysis,
            analyzedAt: new Date().toISOString(),
            infrastructure: {
                provider: 'Azure OpenAI',
                region: 'Australia East (Sydney)',
                dataResidency: 'ap-southeast-2',
            },
        })
    } catch (error) {
        console.error('[Validator API] Unexpected error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred during analysis. Please try again.' },
            { status: 500 }
        )
    }
}
