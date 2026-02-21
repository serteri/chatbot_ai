/**
 * CRM Integration — Lead Forwarding Engine
 * 
 * Forwards captured leads to the agent's external CRM system.
 * Supports: Generic Webhook, Rex Software, Reapit Foundations
 */

// --- Types ---

export interface CRMIntegration {
    enabled: boolean
    provider: 'generic' | 'rex' | 'reapit'
    webhookUrl?: string
    apiKey?: string
    // Rex Software
    rexConfig?: {
        subdomain: string
        token: string
    }
    // Reapit Foundations
    reapitConfig?: {
        clientId: string
        clientSecret: string
        customerId: string
        baseUrl?: string // defaults to https://platform.reapit.cloud
    }
}

export interface CRMLeadPayload {
    // Core
    id: string
    name: string
    phone: string
    email?: string | null
    // Qualification
    intent?: string | null
    propertyType?: string | null
    purpose?: string | null
    budget?: string | null
    budgetMin?: number | null
    budgetMax?: number | null
    location?: string | null
    timeline?: string | null
    hasPreApproval?: boolean | null
    // Scoring
    score: number
    category: string
    // Requirements (deep questions)
    requirements?: {
        bedrooms?: string
        bathrooms?: string
        parking?: string
        features?: string[]
        propertySize?: string
        floorPreference?: string
        hasPropertyToSell?: string
        monthlyIncome?: number
        monthlyExpenses?: number
        downPayment?: number
        calculatedMaxBudget?: number
        [key: string]: any
    } | null
    // Meta
    source?: string
    chatbotName?: string
    agentName?: string
    createdAt?: Date
}

// --- Main Entry Point ---

export async function forwardLeadToCRM(
    lead: CRMLeadPayload,
    chatbot: { customSettings?: any; name?: string; agentName?: string | null }
): Promise<{ success: boolean; error?: string }> {
    try {
        const settings = chatbot.customSettings as Record<string, any> | null
        const crmConfig = settings?.crmIntegration as CRMIntegration | undefined

        if (!crmConfig?.enabled) {
            return { success: true } // CRM not configured, skip silently
        }

        // Enrich lead with chatbot info
        lead.chatbotName = chatbot.name
        lead.agentName = chatbot.agentName || undefined

        switch (crmConfig.provider) {
            case 'generic':
                return await sendGenericWebhook(crmConfig, lead)
            case 'rex':
                return await sendToRexSoftware(crmConfig, lead)
            case 'reapit':
                return await sendToReapit(crmConfig, lead)
            default:
                return { success: false, error: `Unknown CRM provider: ${crmConfig.provider}` }
        }
    } catch (error: any) {
        console.error('CRM forwarding error:', error)
        return { success: false, error: error.message || 'Unknown error' }
    }
}

// --- Generic Webhook ---

async function sendGenericWebhook(
    config: CRMIntegration,
    lead: CRMLeadPayload
): Promise<{ success: boolean; error?: string }> {
    if (!config.webhookUrl) {
        return { success: false, error: 'Webhook URL not configured' }
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'PylonChat-CRM/1.0',
    }

    if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`
        headers['X-API-Key'] = config.apiKey
    }

    const payload = {
        event: 'lead.created',
        timestamp: new Date().toISOString(),
        source: 'pylonchat',
        data: {
            contact: {
                name: lead.name,
                phone: lead.phone,
                email: lead.email || null,
            },
            qualification: {
                intent: lead.intent,
                propertyType: lead.propertyType,
                purpose: lead.purpose,
                budget: lead.budget,
                budgetMin: lead.budgetMin,
                budgetMax: lead.budgetMax,
                location: lead.location,
                timeline: lead.timeline,
                hasPreApproval: lead.hasPreApproval,
            },
            scoring: {
                score: lead.score,
                category: lead.category,
            },
            requirements: lead.requirements || {},
            meta: {
                leadId: lead.id,
                source: lead.source || 'chatbot',
                chatbotName: lead.chatbotName,
                agentName: lead.agentName,
                createdAt: lead.createdAt || new Date().toISOString(),
            }
        }
    }

    // Attempt with 1 retry
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const response = await fetch(config.webhookUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(10000), // 10s timeout
            })

            if (response.ok) {
                console.log(`✅ CRM webhook sent successfully to ${config.webhookUrl}`)
                return { success: true }
            }

            const errorText = await response.text().catch(() => 'Unknown error')
            console.error(`❌ CRM webhook failed (${response.status}): ${errorText}`)

            if (attempt === 0 && response.status >= 500) {
                // Retry on server errors
                await new Promise(r => setTimeout(r, 1000))
                continue
            }

            return { success: false, error: `HTTP ${response.status}: ${errorText}` }
        } catch (error: any) {
            if (attempt === 0) {
                await new Promise(r => setTimeout(r, 1000))
                continue
            }
            return { success: false, error: error.message }
        }
    }

    return { success: false, error: 'Max retries exceeded' }
}

// --- Rex Software API ---
// Rex uses Open API with JSON POST to /v1/leads/contacts
// Docs: https://api.rex.software/

async function sendToRexSoftware(
    config: CRMIntegration,
    lead: CRMLeadPayload
): Promise<{ success: boolean; error?: string }> {
    const rex = config.rexConfig
    if (!rex?.subdomain || !rex?.token) {
        return { success: false, error: 'Rex Software config incomplete (subdomain + token required)' }
    }

    const baseUrl = `https://${rex.subdomain}.rex.software/api/v1`

    // Build Rex contact payload
    const rexPayload = {
        type: 'lead',
        contact: {
            first_name: lead.name.split(' ')[0] || lead.name,
            last_name: lead.name.split(' ').slice(1).join(' ') || '',
            phone_numbers: [
                { type: 'mobile', number: lead.phone }
            ],
            emails: lead.email ? [{ type: 'personal', address: lead.email }] : [],
        },
        notes: buildLeadNotes(lead),
        tags: [
            `pylonchat-${lead.category}`,
            lead.intent ? `intent-${lead.intent}` : null,
            lead.propertyType ? `property-${lead.propertyType}` : null,
        ].filter(Boolean),
        custom_fields: {
            budget: lead.budget || '',
            location: lead.location || '',
            timeline: lead.timeline || '',
            pre_approval: lead.hasPreApproval ? 'Yes' : 'No',
            lead_score: lead.score.toString(),
            lead_category: lead.category,
            source: 'PylonChat Chatbot',
        }
    }

    try {
        const response = await fetch(`${baseUrl}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${rex.token}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify(rexPayload),
            signal: AbortSignal.timeout(15000),
        })

        if (response.ok) {
            const data = await response.json().catch(() => ({}))
            console.log(`✅ Rex CRM lead created: ${data.id || 'success'}`)
            return { success: true }
        }

        const errorText = await response.text().catch(() => 'Unknown error')
        console.error(`❌ Rex CRM failed (${response.status}): ${errorText}`)
        return { success: false, error: `Rex API ${response.status}: ${errorText}` }
    } catch (error: any) {
        return { success: false, error: `Rex API error: ${error.message}` }
    }
}

// --- Reapit Foundations API ---
// Reapit uses OAuth 2.0 client_credentials + REST API
// Docs: https://foundations-documentation.reapit.cloud/

async function sendToReapit(
    config: CRMIntegration,
    lead: CRMLeadPayload
): Promise<{ success: boolean; error?: string }> {
    const reapit = config.reapitConfig
    if (!reapit?.clientId || !reapit?.clientSecret || !reapit?.customerId) {
        return { success: false, error: 'Reapit config incomplete (clientId + clientSecret + customerId required)' }
    }

    const baseUrl = reapit.baseUrl || 'https://platform.reapit.cloud'

    // Step 1: Get OAuth token
    let accessToken: string
    try {
        const tokenResponse = await fetch('https://connect.reapit.cloud/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: reapit.clientId,
                client_secret: reapit.clientSecret,
            }),
            signal: AbortSignal.timeout(10000),
        })

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text().catch(() => '')
            return { success: false, error: `Reapit auth failed (${tokenResponse.status}): ${errText}` }
        }

        const tokenData = await tokenResponse.json()
        accessToken = tokenData.access_token
    } catch (error: any) {
        return { success: false, error: `Reapit auth error: ${error.message}` }
    }

    // Step 2: Create contact in Reapit
    const nameParts = lead.name.split(' ')
    const reapitPayload = {
        title: '',
        forename: nameParts[0] || lead.name,
        surname: nameParts.slice(1).join(' ') || 'N/A',
        dateOfBirth: null,
        active: true,
        marketingConsent: 'grant',
        source: {
            id: 'pylonchat',
            type: 'source',
        },
        homePhone: lead.phone,
        mobilePhone: lead.phone,
        email: lead.email || '',
        primaryAddress: lead.location ? {
            line1: lead.location,
            line2: '',
            line3: '',
            line4: '',
            postcode: '',
        } : undefined,
        negotiatorIds: [],
        metadata: {
            pylonchat: {
                leadId: lead.id,
                score: lead.score,
                category: lead.category,
                intent: lead.intent,
                propertyType: lead.propertyType,
                budget: lead.budget,
                timeline: lead.timeline,
                preApproval: lead.hasPreApproval,
                requirements: lead.requirements,
            }
        }
    }

    try {
        const response = await fetch(`${baseUrl}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'api-version': '2023-01-01',
                'reapit-customer': reapit.customerId,
            },
            body: JSON.stringify(reapitPayload),
            signal: AbortSignal.timeout(15000),
        })

        if (response.ok || response.status === 201) {
            console.log('✅ Reapit contact created successfully')
            return { success: true }
        }

        const errorText = await response.text().catch(() => 'Unknown error')
        console.error(`❌ Reapit failed (${response.status}): ${errorText}`)
        return { success: false, error: `Reapit API ${response.status}: ${errorText}` }
    } catch (error: any) {
        return { success: false, error: `Reapit API error: ${error.message}` }
    }
}

// --- Helpers ---

function buildLeadNotes(lead: CRMLeadPayload): string {
    const lines: string[] = [
        `📋 PylonChat Lead — Score: ${lead.score}/100 (${lead.category.toUpperCase()})`,
        `━━━━━━━━━━━━━━━━━━━━━━━━`,
    ]

    if (lead.intent) lines.push(`Intent: ${lead.intent}`)
    if (lead.propertyType) lines.push(`Property Type: ${lead.propertyType}`)
    if (lead.purpose) lines.push(`Purpose: ${lead.purpose}`)
    if (lead.budget) lines.push(`Budget: ${lead.budget}`)
    if (lead.location) lines.push(`Location: ${lead.location}`)
    if (lead.timeline) lines.push(`Timeline: ${lead.timeline}`)
    if (lead.hasPreApproval !== null && lead.hasPreApproval !== undefined) {
        lines.push(`Pre-approval: ${lead.hasPreApproval ? 'Yes' : 'No'}`)
    }

    // Deep question data
    const req = lead.requirements
    if (req) {
        lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━`)
        if (req.bedrooms) lines.push(`Bedrooms: ${req.bedrooms}`)
        if (req.bathrooms) lines.push(`Bathrooms: ${req.bathrooms}`)
        if (req.parking) lines.push(`Parking: ${req.parking}`)
        if (req.features?.length) lines.push(`Features: ${req.features.join(', ')}`)
        if (req.propertySize) lines.push(`Min Size: ${req.propertySize}`)
        if (req.floorPreference) lines.push(`Floor Pref: ${req.floorPreference}`)
        if (req.hasPropertyToSell) lines.push(`Has Property to Sell: ${req.hasPropertyToSell}`)
    }

    return lines.join('\n')
}

// --- Test / Ping ---

export async function testCRMConnection(
    chatbot: { customSettings?: any }
): Promise<{ success: boolean; error?: string }> {
    const settings = chatbot.customSettings as Record<string, any> | null
    const crmConfig = settings?.crmIntegration as CRMIntegration | undefined

    if (!crmConfig?.enabled) {
        return { success: false, error: 'CRM integration is not enabled' }
    }

    const testLead: CRMLeadPayload = {
        id: 'test-connection',
        name: 'PylonChat Test',
        phone: '+61400000000',
        email: 'test@pylonchat.com',
        intent: 'buy',
        propertyType: 'house',
        purpose: 'residence',
        budget: '$500K-$800K',
        location: 'Sydney',
        timeline: 'Within 1-3 months',
        hasPreApproval: true,
        score: 75,
        category: 'hot',
        requirements: {
            bedrooms: '3',
            bathrooms: '2',
            parking: '2',
            features: ['Pool', 'Garden'],
            propertySize: '200',
            floorPreference: 'any',
        },
        source: 'test',
        chatbotName: 'Test Bot',
    }

    return forwardLeadToCRM(testLead, chatbot)
}
