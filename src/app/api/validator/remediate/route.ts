import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createAuditLog } from '@/lib/services/audit'
import OpenAI from 'openai'

// ---------------------------------------------------------------------------
// NDIS Service Agreement Remediation — Azure OpenAI Sydney
// POST /api/validator/remediate
// Infrastructure: Azure OpenAI (ap-southeast-2, Sydney)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are an NDIS Compliance Auditor. For each provided gap, suggest professional, NDIS-compliant wording for a Service Agreement Addendum. 

IMPORTANT: Always include a disclaimer at the end of each suggestion that this is a suggestion, not legal advice.

INPUT FORMAT:
You will receive an array of compliance warnings and a brief summary of the document.

OUTPUT FORMAT:
Return ONLY a valid JSON object where:
- The keys are the exact warning text strings provided in the input array.
- The values are the suggested remediation text (the formal Service Agreement Addendum clause).`

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

    const cleanEndpoint = endpoint.replace(/\/+$/, '')

    return new OpenAI({
        apiKey,
        baseURL: `${cleanEndpoint}/openai/deployments/${deploymentName}`,
        defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview' },
        defaultHeaders: { 'api-key': apiKey },
    })
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { warnings, summary } = body

        if (!warnings || !Array.isArray(warnings)) {
            return NextResponse.json({ error: 'Invalid warnings array provided' }, { status: 400 })
        }

        if (warnings.length === 0) {
            return NextResponse.json({ remediations: {} }, { status: 200 })
        }

        const openai = getAzureOpenAIClient()

        const response = await openai.chat.completions.create({
            model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'pylonchat-v1',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: `Document Summary: ${summary || 'N/A'}\n\nCompliance Gaps to Fix:\n${JSON.stringify(warnings, null, 2)}`
                }
            ],
            temperature: 0.2, // Low temperature for consistent legal precision
            response_format: { type: 'json_object' }
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from Azure OpenAI')
        }

        const remediations = JSON.parse(content)

        // Audit Logging for Data Sovereignty
        await createAuditLog({
            action: 'REMEDIATION_GENERATED',
            actorId: session.user.id,
            resourceType: 'Document',
            metadata: {
                region: 'Sydney (ap-southeast-2)',
                target_count: warnings.length,
            }
        })

        return NextResponse.json({ remediations }, { status: 200 })

    } catch (error: any) {
        console.error('Remediation API Error:', error?.message || error)
        return NextResponse.json(
            { error: 'Failed to generate remediation plan.' },
            { status: 500 }
        )
    }
}
