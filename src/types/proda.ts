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
    ParticipantID: string
    SupportItemNumber: string
    ClaimReference: string
    SupportStartDate: string
    SupportEndDate: string
    ServiceBookingNumber: string
    Quantity: string
    UnitPrice: string
    ClaimType: string
}
