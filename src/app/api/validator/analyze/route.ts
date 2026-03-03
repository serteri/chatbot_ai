import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createAuditLog } from '@/lib/services/audit'
import OpenAI from 'openai'

// ---------------------------------------------------------------------------
// NDIS Service Agreement Analyzer — API Route
// POST /api/validator/analyze
// Accepts: FormData with a PDF file
// Returns: Structured JSON compliance analysis
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

// Helper: extract text from PDF buffer
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    return data.text
}

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

        // ── Extract PDF Text ──
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        let extractedText: string

        try {
            extractedText = await extractTextFromPDF(buffer)
        } catch {
            return NextResponse.json(
                { error: 'Failed to read PDF. The file may be corrupted or password-protected.' },
                { status: 422 }
            )
        }

        if (!extractedText || extractedText.trim().length < 50) {
            return NextResponse.json(
                { error: 'The PDF appears to be empty or contains only images. Please upload a text-based PDF.' },
                { status: 422 }
            )
        }

        // ── Truncate for token limits (~15k words) ──
        const truncatedText = extractedText.slice(0, 60000)

        // ── Call OpenAI GPT-4o ──
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
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
                model: 'gpt-4o',
            },
        })

        // ── Return ──
        return NextResponse.json({
            success: true,
            fileName: file.name,
            fileSize: file.size,
            analysis,
            analyzedAt: new Date().toISOString(),
        })
    } catch (error) {
        console.error('[Validator API] Unexpected error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred during analysis. Please try again.' },
            { status: 500 }
        )
    }
}
