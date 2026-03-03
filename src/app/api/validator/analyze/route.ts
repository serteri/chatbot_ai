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

const SYSTEM_PROMPT = `You are an expert NDIS Compliance Analyst for Australian disability service providers. 

When given the text of an NDIS Service Agreement, you must:

1. Extract and return:
   - Participant name (if present)
   - NDIS Number (if present, partially redact for privacy: e.g., "####-####-12")
   - Total plan funding amount
   - Plan start and end dates
   - All line items with their codes, descriptions, and allocated budgets
   - Registration groups covered

2. Identify compliance issues:
   - Missing cancellation policy (required under NDIS Terms of Business)
   - Missing incident reporting procedures
   - Missing consent clauses
   - Pricing that exceeds NDIS Price Guide 2025/26 limits
   - Missing ABN or provider registration details

3. Calculate an overall compliance score (0-100%) based on the number of required clauses present.

4. Return your analysis as a JSON object with this EXACT structure:
{
  "participantName": "string or null",
  "ndisNumber": "string or null (redacted)",
  "totalFunding": "number",
  "planStart": "string (date)",
  "planEnd": "string (date)",
  "lineItems": [
    { "code": "string", "description": "string", "budget": "number" }
  ],
  "complianceFlags": [
    { "severity": "warning|critical", "message": "string", "recommendation": "string" }
  ],
  "complianceScore": "number (0-100)",
  "summary": "string (2-3 sentence overview)",
  "auditTrailId": "string (generate as AT-XXXXX)"
}

If the document is NOT an NDIS Service Agreement, return:
{ "error": "This document does not appear to be an NDIS Service Agreement.", "complianceScore": 0 }

Be thorough and precise. Australian NDIS providers rely on your analysis for audit readiness.`

// Helper to parse PDF server-side
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    // pdf-parse is CommonJS, dynamic import for ESM compatibility
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    return data.text
}

export async function POST(request: NextRequest) {
    try {
        // ── Auth Check ──
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

        // 20MB limit
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

        // ── Truncate to fit within token limits (approx 15k words) ──
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

        // ── Parse AI Response ──
        let analysis: Record<string, unknown>
        try {
            analysis = JSON.parse(aiResponse)
        } catch {
            return NextResponse.json(
                { error: 'AI returned malformed data. Please try again.' },
                { status: 500 }
            )
        }

        // ── Audit Log: Success ──
        await createAuditLog({
            action: 'DOCUMENT_ANALYSIS_SUCCESS',
            actorId: session.user.id,
            metadata: {
                fileName: file.name,
                fileSize: file.size,
                complianceScore: analysis.complianceScore,
                auditTrailId: analysis.auditTrailId,
                model: 'gpt-4o',
            },
        })

        // ── Return structured response ──
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
