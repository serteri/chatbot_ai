import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createAuditLog } from '@/lib/services/audit'
import OpenAI from 'openai'

// ---------------------------------------------------------------------------
// NDIS Service Agreement Analyzer — Azure OpenAI Sydney
// POST /api/validator/analyze
// Infrastructure: Azure OpenAI (ap-southeast-2, Sydney)
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT = `You are a Senior NDIS Compliance Officer. Analyze the provided Service Agreement strictly against the NDIS Practice Standards 2021 (updated 2025/26) and the NDIS Price Guide 2025/26.

Return a strict JSON object containing:
- "participantName": string or null (Extract the participant's full name from headers like 'About the Participant', 'Name', or 'Participant Details'. Do not use provider names.)
- "totalFunding": number (total plan funding in AUD)
- "startDate": string (plan start date, e.g. "2025-07-01". Look explicitly for 'Start Date' or 'Commencement')
- "endDate": string (plan end date, e.g. "2026-06-30". Look explicitly for 'End Date', 'Expiry', or 'Review Date')
- "lineItems": array of objects, each with:
  - "code": string (NDIS line item code, e.g. "04_590_0125_6_1")
  - "description": string (what the line item covers)
  - "budget": number (allocated budget in AUD)
- "complianceScore": number between 0 and 100 (based on required clauses present and strict NDIS Practice Standards adherence)
- "warnings": array of strings (backward-compat plain text summaries of each gap — one string per gap)
- "warningDetails": array of objects, one per compliance gap, each containing:
  - "text": string (clear, actionable description of the gap)
  - "confidenceScore": number 0-100 (your confidence that this gap genuinely exists in this document; use 90-100 when the clause is completely absent, 70-89 when present but inadequate, below 70 only for ambiguous cases)
  - "requiresManualReview": boolean (true if confidenceScore < 85)
  - "citation": string (the specific NDIS document, section, and clause — e.g. "NDIS Practice Standards 2021, Outcome 1.1 — Rights and Responsibilities" or "NDIS Price Guide 2025/26, Section 5.3 — Cancellation Policy")
- "summary": string (2-3 sentence overview of the agreement)

Check for these critical NDIS compliance issues:
- Missing or non-compliant cancellation policy (NDIS Price Guide 2025/26, Section 5.3)
- Missing incident management and reporting procedures (NDIS Practice Standards 2021, Outcome 2.4)
- Missing explicit consent clauses for data collection and sharing (NDIS Practice Standards 2021, Outcome 1.2)
- Pricing exceeding NDIS Price Guide 2025/26 maximum limits (NDIS Price Guide 2025/26, Support Catalogue)
- Missing ABN or NDIS provider registration number (NDIS Act 2013, s.73B)
- Missing explicit participant goals or outcomes (NDIS Practice Standards 2021, Outcome 1.4)
- Missing nominated representative or plan nominee details (NDIS Act 2013, s.86)

The "warnings" array must contain the same items as "warningDetails[].text" so that both fields remain in sync.

If the document is NOT an NDIS Service Agreement, return:
{ "error": "This document does not appear to be an NDIS Service Agreement.", "complianceScore": 0 }

Be extremely thorough and precise. Australian NDIS providers rely on your rigorous analysis for official government audit readiness.`

// ---------------------------------------------------------------------------
// Azure OpenAI Client (Sydney — ap-southeast-2)
// ---------------------------------------------------------------------------

export function getAzureOpenAIClient(): OpenAI {
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
// Text Extraction — PDF
// ---------------------------------------------------------------------------

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    const pdfParse = (await import('pdf-parse-fork')).default
    const data = await pdfParse(buffer)
    return data.text
}

// ---------------------------------------------------------------------------
// Text Extraction — DOCX (mammoth)
// ---------------------------------------------------------------------------

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
    const mammoth = (await import('mammoth')).default
    const result = await mammoth.extractRawText({ buffer })
    return result.value
}

// ---------------------------------------------------------------------------
// Dispatcher — picks extractor by MIME / extension
// ---------------------------------------------------------------------------

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export async function extractText(file: File, buffer: Buffer): Promise<string> {
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
    const isDocx = file.name.toLowerCase().endsWith('.docx') || file.type === DOCX_MIME
    if (isPdf) return extractTextFromPDF(buffer)
    if (isDocx) return extractTextFromDocx(buffer)
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.')
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

        const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
        const isDocx =
            file.name.toLowerCase().endsWith('.docx') ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

        if (!isPdf && !isDocx) {
            return NextResponse.json(
                { error: 'Only PDF and DOCX files are accepted.' },
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

        // ── Extract text (PDF or DOCX) ──
        let extractedText: string

        try {
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            extractedText = await extractText(file, buffer)
        } catch (err: any) {
            console.error('Text Extraction Error:', err?.message || err)
            return NextResponse.json(
                { error: `Text Extraction Error: ${err?.message || 'Failed to extract text from this document.'}` },
                { status: 500 }
            )
        }

        if (!extractedText || extractedText.trim().length < 50) {
            return NextResponse.json(
                { error: 'The document appears to be empty or scanned-image only. Please upload a text-based PDF or DOCX.' },
                { status: 422 }
            )
        }

        // ── Truncate for token limits ──
        const truncatedText = extractedText.slice(0, 60000)

        // ── Call Azure OpenAI (Sydney) ──
        const azureClient = getAzureOpenAIClient()

        const completion = await azureClient.chat.completions.create({
            model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'pylonchat-v1',
            temperature: 0,
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
