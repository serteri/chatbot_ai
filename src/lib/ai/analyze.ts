/**
 * NDIS Compliance Analysis — shared types and AI prompt.
 *
 * The Azure OpenAI route (api/validator/analyze) imports from here so that
 * the UI and the API share one definition of every field.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LineItem {
    code: string
    description: string
    budget: number
}

export interface WarningDetail {
    text: string
    /** 0-100. Gaps with score < 90 are flagged for manual review. */
    confidenceScore: number
    requiresManualReview: boolean
    /** e.g. "NDIS Practice Standards 2021, Outcome 1.1" */
    sourceCitation: string
}

export interface AnalysisResult {
    documentType: 'service_agreement' | 'shift_report' | 'unknown'
    participantName: string | null
    ndisId?: string | null
    totalFunding: number
    startDate: string
    endDate: string
    lineItems: LineItem[]
    complianceScore: number
    warnings: string[]
    warningDetails: WarningDetail[]
    summary: string
    totalHours?: number | null
    date?: string | null
    error?: string
}

// ── System prompt ─────────────────────────────────────────────────────────────

export const NDIS_SYSTEM_PROMPT = `You are a Senior NDIS Compliance Officer. Analyze the provided NDIS document.

We support two primary document types:
1. **NDIS Service Agreement**: A formal contract between a participant and provider.
2. **Progress Note / Shift Report**: A daily/weekly record of supports delivered during a specific shift.

### TASK:
Determine the document type and extract relevant data.

Return a strict JSON object containing:
- "documentType": "service_agreement", "shift_report", or "unknown"
- "participantName": string or null (Extract full name. For Shift Reports, this is the participant receiving the service.)
- "ndisId": string or null (Extract NDIS Number/ID if present)

**IF Document is a SERVICE AGREEMENT:**
- "totalFunding": number (total plan funding in AUD)
- "startDate": string (plan start date, YYYY-MM-DD. Look for 'Start Date' or 'Commencement')
- "endDate": string (plan end date, YYYY-MM-DD. Look for 'End Date' or 'Review Date')
- "lineItems": array of objects { "code", "description", "budget" }
- "complianceScore": number 0-100 (based on NDIS Practice Standards 2021)
- "warnings": array of strings (summaries of gaps)
- "warningDetails": array of objects { "text", "confidenceScore", "requiresManualReview", "sourceCitation" }
- "summary": 2-3 sentence overview

**IF Document is a PROGRESS NOTE / SHIFT REPORT:**
- "date": string (The date service was delivered, YYYY-MM-DD)
- "totalHours": number (The total duration of the shift/service in hours)
- "summary": 1-2 sentence description of what was achieved/documented.
- "complianceScore": 100 (Default for shift reports unless critical safety issues are noted)

**IF Document is UNKNOWN:**
- "documentType": "unknown"
- "summary": "Unrecognized NDIS document type."
- "complianceScore": 0

### COMPLIANCE RULES (Agreements Only):
Check for missing cancellation policies, incident management, consent clauses, and pricing limit adherence (NDIS Price Guide 2025/26).

Be extremely thorough and precise. Australian NDIS providers rely on your rigorous analysis for official government audit readiness.`
