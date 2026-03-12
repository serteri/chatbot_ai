/**
 * NDIS Claim Extraction — types and AI prompt.
 *
 * Each extracted field carries a confidence score so the UI can flag
 * any value the AI is uncertain about as "Requires Manual Review".
 * This prevents hallucinations from silently entering the claims ledger.
 */

// ── Field wrapper ─────────────────────────────────────────────────────────────

export interface ExtractedField<T> {
    /** Extracted value, or null if not found / too uncertain */
    value: T | null
    /** 0–100. <85 triggers manual-review flag. <50 forces null. */
    confidence: number
    /** The verbatim text fragment the AI used — for human verification */
    rawText: string
    /** True when confidence < 85 */
    requiresManualReview: boolean
}

// ── Full extraction result ────────────────────────────────────────────────────

export interface ExtractedClaimData {
    participantName:        ExtractedField<string>
    participantNdisNumber:  ExtractedField<string>
    supportItemNumber:      ExtractedField<string>  // NDIS line-item code
    supportDeliveredDate:   ExtractedField<string>  // ISO 8601 date
    quantityDelivered:      ExtractedField<number>  // hours / units
    unitPrice:              ExtractedField<number>  // AUD per unit
    serviceType:            ExtractedField<string>  // human-readable label
    /** Average confidence across all required fields */
    overallConfidence: number
    /** True when every required field has confidence >= 85 */
    canAutoConvert: boolean
}

// ── AI Prompt ─────────────────────────────────────────────────────────────────

export const CLAIM_EXTRACTION_PROMPT = `You are a precise NDIS Claims Data Extractor. Your job is to read an NDIS-related document (service note, timesheet, invoice, or progress note) and extract ONLY the fields needed to create a billable claim entry.

ANTI-HALLUCINATION RULES — YOU MUST FOLLOW THESE EXACTLY:
1. Only extract information that is EXPLICITLY STATED in the document text.
2. If you are uncertain about ANY field, you MUST lower its confidence score accordingly.
3. NEVER invent, infer, or guess a value that is not literally present. If a field is absent, set value to null and confidence to 0.
4. For NDIS line item codes: only output a real NDIS support catalogue code (format like "01_011_0107_1_1"). If the document does not contain a code, output null — DO NOT guess one from the service description.
5. For dates: only output ISO-8601 format (YYYY-MM-DD). If the date is ambiguous, lower confidence to reflect that.
6. For NDIS numbers: the format is typically 9 digits. If the number does not match this pattern, set confidence below 70.

Return a strict JSON object with this exact shape:
{
  "participantName": {
    "value": string | null,
    "confidence": number (0-100),
    "rawText": string (verbatim text you found, or "" if not found),
    "requiresManualReview": boolean (true if confidence < 85)
  },
  "participantNdisNumber": {
    "value": string | null,
    "confidence": number,
    "rawText": string,
    "requiresManualReview": boolean
  },
  "supportItemNumber": {
    "value": string | null,
    "confidence": number,
    "rawText": string,
    "requiresManualReview": boolean
  },
  "supportDeliveredDate": {
    "value": string | null (ISO 8601: YYYY-MM-DD),
    "confidence": number,
    "rawText": string,
    "requiresManualReview": boolean
  },
  "quantityDelivered": {
    "value": number | null (hours or units as a decimal),
    "confidence": number,
    "rawText": string,
    "requiresManualReview": boolean
  },
  "unitPrice": {
    "value": number | null (AUD, no currency symbol),
    "confidence": number,
    "rawText": string,
    "requiresManualReview": boolean
  },
  "serviceType": {
    "value": string | null (plain English description of the support delivered),
    "confidence": number,
    "rawText": string,
    "requiresManualReview": boolean
  },
  "overallConfidence": number (average of all required field confidence scores),
  "canAutoConvert": boolean (true only if ALL of: participantName, supportDeliveredDate, quantityDelivered, serviceType have confidence >= 85)
}

Confidence scoring guide:
- 95-100: Field is explicitly stated, unambiguous, and matches expected format perfectly
- 85-94:  Field is present and clear but requires minor interpretation
- 70-84:  Field is probably present but partially ambiguous — MARK requiresManualReview: true
- 50-69:  Field is very uncertain — MARK requiresManualReview: true
- 0-49:   Field is absent or illegible — set value to null and MARK requiresManualReview: true`
