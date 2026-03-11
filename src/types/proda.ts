/**
 * Standard representation of an internal invoice line item within our planned DB schema.
 * Represents what we need BEFORE transforming into the rigid PRODA format.
 */
export interface InternalClaim {
    id: string
    agencyRegistrationNumber: string
    participantNdisNumber: string
    supportItemNumber: string // e.g., '01_011_0107_1_1'
    supportDeliveredDate: Date // Native Date object
    quantityDelivered: number // e.g. 2.5 hours
    unitPrice: number
    totalClaimAmount: number // Must precisely match quantity * unitPrice
    cancellationReason?: string // Only required if claiming a cancellation
}

/**
 * The strict string-mapped representation required by the NDIS PRODA Bulk Payment Upload Portal.
 * DO NOT CHANGE these casing/naming conventions, they must exactly match the CSV headers.
 */
export interface ProdaCsvRow {
    RegistrationNumber: string
    ParticipantNumber: string
    SupportNumber: string
    SupportStartDate: string // Placed into 'YYYY-MM-DD' or 'DD/MM/YYYY' per PRODA spec
    SupportEndDate: string // Usually maps identical to Start Date unless multiday
    ClaimReference: string // Used for internal agency tracking
    Quantity: string // 2 or more decimal places
    UnitPrice: string // '0.00' format
    CappedPrice: string // Normally left blank/null unless explicit
    ClaimAmount: string // '0.00' format
    GSTCode: string // Usually 'P1' for Free, 'P2' for Out of Scope NDIS etc.
    CancellationReason: string
}
