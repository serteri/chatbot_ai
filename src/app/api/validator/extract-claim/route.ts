import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getAzureOpenAIClient, extractText } from '@/app/api/validator/analyze/route'
import { CLAIM_EXTRACTION_PROMPT, type ExtractedClaimData } from '@/lib/ai/claimExtraction'

// ---------------------------------------------------------------------------
// POST /api/validator/extract-claim
//
// Accepts a multipart file upload (PDF or DOCX), extracts text, and asks
// Azure OpenAI to pull out the fields needed to create a Claim record.
// Every field is returned with a confidence score so the UI can flag
// anything uncertain as "Requires Manual Review" before saving.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
        }

        const isPdf  = file.name.toLowerCase().endsWith('.pdf')  || file.type === 'application/pdf'
        const isDocx = file.name.toLowerCase().endsWith('.docx') ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

        if (!isPdf && !isDocx) {
            return NextResponse.json(
                { error: 'Only PDF and DOCX files are accepted.' },
                { status: 400 }
            )
        }

        // ── Extract text ──────────────────────────────────────────────────────
        const arrayBuffer = await file.arrayBuffer()
        const buffer      = Buffer.from(arrayBuffer)

        let extractedText: string
        try {
            extractedText = await extractText(file, buffer)
        } catch (err: any) {
            return NextResponse.json(
                { error: `Could not read file: ${err?.message ?? 'Unknown error'}` },
                { status: 422 }
            )
        }

        if (!extractedText || extractedText.trim().length < 20) {
            return NextResponse.json(
                { error: 'Document appears to be empty or image-only.' },
                { status: 422 }
            )
        }

        // ── Azure OpenAI — claim extraction ──────────────────────────────────
        const client = getAzureOpenAIClient()

        const completion = await client.chat.completions.create({
            model:           process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'ndis-shield-hub-v1',
            temperature:     0,       // must be deterministic — no creativity
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: CLAIM_EXTRACTION_PROMPT },
                {
                    role: 'user',
                    content: `Extract claim fields from this NDIS document:\n\n---\n${extractedText.slice(0, 40000)}\n---`,
                },
            ],
        })

        const raw = completion.choices[0]?.message?.content
        if (!raw) {
            return NextResponse.json(
                { error: 'AI did not return a response. Please try again.' },
                { status: 500 }
            )
        }

        // ── Parse & validate structure ────────────────────────────────────────
        let extractedClaim: ExtractedClaimData
        try {
            extractedClaim = JSON.parse(raw) as ExtractedClaimData
        } catch {
            return NextResponse.json(
                { error: 'AI returned malformed JSON. Please try again.' },
                { status: 500 }
            )
        }

        // Defensive: ensure requiresManualReview is consistent with confidence
        const requiredFields = [
            'participantName', 'participantNdisNumber', 'supportItemNumber',
            'supportDeliveredDate', 'quantityDelivered', 'unitPrice', 'serviceType',
        ] as const
        for (const key of requiredFields) {
            const field = extractedClaim[key] as any
            if (field && typeof field.confidence === 'number') {
                field.requiresManualReview = field.confidence < 85
                // Null out values the AI is very uncertain about
                if (field.confidence < 50) field.value = null
            }
        }

        return NextResponse.json({
            success: true,
            extractedClaim,
            fileName: file.name,
        })

    } catch (error) {
        console.error('[extract-claim] Fatal error:', error)
        return NextResponse.json(
            { error: 'Unexpected error during extraction. Please try again.' },
            { status: 500 }
        )
    }
}
