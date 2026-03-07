import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { BlobServiceClient } from '@azure/storage-blob'

// ---------------------------------------------------------------------------
// POST /api/validator/generate-addendum
// Generates a professional "NDIS Service Agreement Addendum" PDF
// with white-label branding (logo + company name from DB)
// ---------------------------------------------------------------------------

interface AddendumRequest {
    fileName: string
    participantName: string
    companyName?: string
    abn?: string
    complianceScore: number
    warnings: string[]
    approverName: string
    approverTitle: string
    nomineeName?: string
    startDate?: string
    endDate?: string
}

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || ''

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body: AddendumRequest = await request.json()
        const { fileName, participantName, companyName, abn, complianceScore, warnings, approverName, approverTitle } = body

        if (!fileName || !warnings) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Fetch branding from DB if not provided
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { companyName: true, logoUrl: true, abn: true }
        })

        const brandName = companyName || user?.companyName || 'NDIS Provider'
        const providerAbn = abn || user?.abn || '[To be specified in Schedule 1]'
        const subjectName = participantName && participantName !== 'Not specified' ? participantName : '[To be specified in Schedule 1]'

        // Download logo as buffer if exists (private blob)
        let logoBase64: string | null = null
        if (user?.logoUrl && AZURE_STORAGE_CONNECTION_STRING) {
            try {
                const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
                const containerClient = blobServiceClient.getContainerClient('branding-assets')
                const urlParts = new URL(user.logoUrl)
                const blobName = decodeURIComponent(urlParts.pathname.split('/').pop() || '')
                if (blobName) {
                    const blobClient = containerClient.getBlockBlobClient(blobName)
                    const logoBuffer = await blobClient.downloadToBuffer()
                    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`
                    console.log(`[Addendum] Loaded branded logo: ${blobName}`)
                }
            } catch (logoErr) {
                console.warn('[Addendum] Could not load logo, proceeding without:', logoErr)
            }
        }

        // Generate PDF
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const margin = 20
        const maxLineWidth = pageWidth - margin * 2
        const today = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

        // ── Page Border ──
        const drawPageBorder = () => {
            doc.setDrawColor(13, 148, 136) // Teal-600
            doc.setLineWidth(0.5)
            doc.rect(8, 8, pageWidth - 16, pageHeight - 16)
            doc.setLineWidth(0.2)
            doc.setDrawColor(200, 200, 200)
            doc.rect(10, 10, pageWidth - 20, pageHeight - 20)
        }

        drawPageBorder()

        // ── Top Banner ──
        doc.setFillColor(15, 23, 42) // Slate-900
        doc.rect(10, 10, pageWidth - 20, 28, 'F')

        // Inject logo into top-right of banner if available
        let logoInjected = false
        if (logoBase64) {
            try {
                doc.addImage(logoBase64, 'PNG', pageWidth - margin - 28, 12, 24, 24)
                logoInjected = true
            } catch {
                console.warn('[Addendum] Failed to inject logo image into PDF')
                logoInjected = false
            }
        }

        if (!logoInjected) {
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(10)
            doc.text(brandName, pageWidth - margin, 20, { align: 'right' })
        }

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(14)
        const titleX = logoBase64 ? (pageWidth - 28) / 2 : pageWidth / 2
        doc.text('NDIS SERVICE AGREEMENT ADDENDUM', titleX, 22, { align: 'center' })

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(`${brandName} • NDIS Practice Standards & Price Guide 2025/26`, titleX, 31, { align: 'center' })

        let cursorY = 48

        // ── Document Details Box ──
        doc.setFillColor(248, 250, 252) // Slate-50
        doc.setDrawColor(226, 232, 240)
        doc.roundedRect(margin, cursorY, maxLineWidth, 28, 3, 3, 'FD')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(15, 23, 42)

        doc.text('Reference Document:', margin + 5, cursorY + 8)
        doc.setFont('helvetica', 'normal')
        doc.text(fileName, margin + 48, cursorY + 8)

        doc.setFont('helvetica', 'bold')
        doc.text('Participant:', margin + 5, cursorY + 15)
        doc.setFont('helvetica', 'normal')
        doc.text(subjectName, margin + 30, cursorY + 15)

        doc.setFont('helvetica', 'bold')
        doc.text('Compliance Score:', margin + 5, cursorY + 22)
        const scoreColor = complianceScore >= 80 ? [16, 185, 129] : complianceScore >= 60 ? [245, 158, 11] : [239, 68, 68]
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
        doc.setFont('helvetica', 'bold')
        doc.text(`${complianceScore}%`, margin + 42, cursorY + 22)

        doc.setTextColor(100, 116, 139)
        doc.setFont('helvetica', 'normal')
        doc.text(`Date: ${today}`, pageWidth - margin - 5, cursorY + 8, { align: 'right' })
        doc.text('Region: Sydney (ap-southeast-2)', pageWidth - margin - 5, cursorY + 15, { align: 'right' })
        doc.text('Status: Active Addendum', pageWidth - margin - 5, cursorY + 22, { align: 'right' })

        cursorY += 36

        // ── Purpose Statement ──
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(15, 23, 42)
        doc.setFontSize(11)
        doc.text('1. Purpose of This Addendum', margin, cursorY)
        cursorY += 7

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(51, 65, 85)
        const purposeText = `This addendum addresses ${warnings.length} compliance gap(s) identified in the AI-powered analysis of "${fileName}". Each item below must be rectified to achieve full compliance with the NDIS Practice Standards (2025/26) and the current NDIS Price Guide. This document should be read in conjunction with the original Service Agreement.`
        const splitPurpose = doc.splitTextToSize(purposeText, maxLineWidth)
        doc.text(splitPurpose, margin, cursorY)
        cursorY += (splitPurpose.length * 4.5) + 8

        // ── Compliance Gaps Table ──
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(15, 23, 42)
        doc.setFontSize(11)
        doc.text('2. Active Compliance Clauses (Replaces Identified Gaps)', margin, cursorY)
        cursorY += 4

        const usedClauseCategories = new Set<string>()

        const tableBody = warnings.map((warning, idx) => {
            const warningText = typeof warning === 'string' ? warning : JSON.stringify(warning)
            const lowerWarning = warningText.toLowerCase()

            let activeClause = `Clause ${idx + 1}.1: General Compliance: The parties hereby incorporate the latest NDIS Practice Standards into this agreement, superseding any conflicting terms.`

            // 1. Highest Priority: Nominee/Representative
            if ((lowerWarning.includes('nominee') || lowerWarning.includes('representative') || lowerWarning.includes('rep') || lowerWarning.includes('guardian')) && !usedClauseCategories.has('nominee')) {
                usedClauseCategories.add('nominee')
                activeClause = `Clause ${idx + 1}.1: Representation: The nominated representative is formally recorded as ${body.nomineeName || '[Not Provided]'}. This supersedes any prior unrecorded proxy.`

                // 2. High Priority: Dates/Duration
            } else if ((lowerWarning.includes('date') || lowerWarning.includes('start') || lowerWarning.includes('end') || lowerWarning.includes('duration') || lowerWarning.includes('expiry')) && !usedClauseCategories.has('dates')) {
                usedClauseCategories.add('dates')
                activeClause = `Clause ${idx + 1}.1: Duration: The Service Agreement shall commence on ${body.startDate || '[Not Provided]'} and remain in effect until ${body.endDate || '[Not Provided]'}.`

                // 3. Middle Priorities: Cancellations, Pricing, ABN, Complaints, Incidents
            } else if ((lowerWarning.includes('cancel') || lowerWarning.includes('cancellation')) && !usedClauseCategories.has('cancel')) {
                usedClauseCategories.add('cancel')
                activeClause = `Clause ${idx + 1}.1: Cancellation: A minimum of 2 clear business days notice is required for standard supports, as per the binding NDIS Price Guide 2025/26.`
            } else if ((lowerWarning.includes('pricing') || lowerWarning.includes('price') || lowerWarning.includes('rate') || lowerWarning.includes('cost')) && !usedClauseCategories.has('price')) {
                usedClauseCategories.add('price')
                activeClause = `Clause ${idx + 1}.1: Pricing: All supports are strictly governed by and align with the NDIS Price Guide 2025/26 maximum limits.`
            } else if ((lowerWarning.includes('abn') || lowerWarning.includes('provider') || lowerWarning.includes('details') || lowerWarning.includes('name')) && !usedClauseCategories.has('abn')) {
                usedClauseCategories.add('abn')
                activeClause = `Clause ${idx + 1}.1: Provider Details: ${brandName} (ABN: ${providerAbn}) is formally incorporated as the official service provider, superseding any generic descriptors.`
            } else if ((lowerWarning.includes('complaint') || lowerWarning.includes('dispute') || lowerWarning.includes('grievance')) && !usedClauseCategories.has('complaint')) {
                usedClauseCategories.add('complaint')
                activeClause = `Clause ${idx + 1}.1: Complaints: ${subjectName} may raise any grievance directly with ${brandName} without reprisal, and retains the right to contact the NDIS Commission.`
            } else if ((lowerWarning.includes('incident') || lowerWarning.includes('safety') || lowerWarning.includes('risk')) && !usedClauseCategories.has('incident')) {
                usedClauseCategories.add('incident')
                activeClause = `Clause ${idx + 1}.1: Incident Management: ${brandName} shall formally document and report critical safety incidents as required under NDIS Practice Standards Module 2.`

                // 4. Lowest Priority: Goals / Plan
                // Kept last so that "Representative date plan" catches as Nominee/Date first, rather than blindly hitting 'plan'.
            } else if ((lowerWarning.includes('goal') || lowerWarning.includes('plan') || lowerWarning.includes('outcome')) && !usedClauseCategories.has('goal')) {
                usedClauseCategories.add('goal')
                activeClause = `Clause ${idx + 1}.1: Goals: ${brandName} hereby incorporates and commits to aligning all supports to ${subjectName}'s NDIS Plan goals.`
            }

            return [`Gap ${idx + 1}`, warningText, activeClause]
        })

        if (tableBody.length === 0) {
            tableBody.push(['—', 'No critical compliance gaps identified.', 'No remediation necessary.'])
        }

        // @ts-ignore
        autoTable(doc, {
            startY: cursorY,
            head: [['#', 'Compliance Gap', 'Required Remediation Action']],
            body: tableBody,
            theme: 'striped',
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: 255,
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [51, 65, 85],
                cellPadding: 4,
                valign: 'top',
                lineWidth: 0.1,
                lineColor: [226, 232, 240]
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            columnStyles: {
                0: { cellWidth: 15, fontStyle: 'bold', halign: 'center' },
                1: { cellWidth: 70 },
                2: { cellWidth: 'auto', fontStyle: 'italic' }
            },
            margin: { left: margin, right: margin, top: 25, bottom: 40 },
            didDrawPage: () => drawPageBorder()
        })

        // @ts-ignore
        cursorY = doc.lastAutoTable.finalY + 15

        // ── Compliance Statement ──
        if (cursorY + 45 > pageHeight - 40) {
            doc.addPage()
            drawPageBorder()
            cursorY = 25
        }

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(15, 23, 42)
        doc.setFontSize(11)
        doc.text('3. Compliance Statement', margin, cursorY)
        cursorY += 7

        doc.setFillColor(240, 253, 244) // Green-50
        doc.setDrawColor(187, 247, 208) // Green-200
        doc.roundedRect(margin, cursorY, maxLineWidth, 24, 3, 3, 'FD')

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(22, 101, 52) // Green-800
        const complianceText = 'By executing this addendum, the Provider confirms that all identified compliance gaps have been or will be rectified in accordance with the NDIS Practice Standards (current edition) and the NDIS Price Guide 2025/26. The Provider further asserts that all supports delivered under this agreement will comply with the National Disability Insurance Scheme Act 2013 (Cth) and associated Rules.'
        const splitCompliance = doc.splitTextToSize(complianceText, maxLineWidth - 10)
        doc.text(splitCompliance, margin + 5, cursorY + 6)
        cursorY += 32

        // ── Signature Block ──
        if (cursorY + 50 > pageHeight - 40) {
            doc.addPage()
            drawPageBorder()
            cursorY = 25
        }

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(15, 23, 42)
        doc.setFontSize(11)
        doc.text('4. Execution', margin, cursorY)
        cursorY += 10

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(51, 65, 85)

        const sigBoxWidth = (maxLineWidth / 2) - 5

        const drawSigBox = (xOffset: number, title: string) => {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.text(title, xOffset, cursorY)

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(8)
            doc.setDrawColor(203, 213, 225)

            doc.text('Name:', xOffset, cursorY + 10)
            doc.line(xOffset + 15, cursorY + 11, xOffset + sigBoxWidth, cursorY + 11)

            doc.text('Signature:', xOffset, cursorY + 20)
            doc.line(xOffset + 20, cursorY + 21, xOffset + sigBoxWidth, cursorY + 21)

            doc.text('Date:', xOffset, cursorY + 30)
            doc.line(xOffset + 12, cursorY + 31, xOffset + sigBoxWidth, cursorY + 31)
        }

        drawSigBox(margin, `${brandName} Representative`)
        drawSigBox(margin + sigBoxWidth + 10, 'Participant / Nominee')

        // ── Internal Approval Stamp ──
        cursorY += 45
        if (cursorY + 40 > pageHeight - 40) {
            doc.addPage()
            drawPageBorder()
            cursorY = 25
        }

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(15, 23, 42)
        doc.setFontSize(11)
        doc.text('5. Internal Approval Stamp', margin, cursorY)
        cursorY += 7

        // Approval box
        doc.setFillColor(240, 249, 255) // Sky-50
        doc.setDrawColor(14, 116, 144) // Cyan-700
        doc.setLineWidth(0.4)
        doc.roundedRect(margin, cursorY, maxLineWidth, 22, 3, 3, 'FD')
        doc.setLineWidth(0.2)

        const approvalTimestamp = new Date().toLocaleString('en-AU', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            timeZoneName: 'short'
        })

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(14, 116, 144)
        doc.text('APPROVED BY:', margin + 5, cursorY + 7)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(15, 23, 42)
        doc.text(`${approverName} — ${approverTitle}`, margin + 35, cursorY + 7)

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(14, 116, 144)
        doc.text('TIMESTAMP:', margin + 5, cursorY + 15)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(15, 23, 42)
        doc.text(approvalTimestamp, margin + 33, cursorY + 15)

        doc.setFont('helvetica', 'italic')
        doc.setFontSize(7)
        doc.setTextColor(100, 116, 139)
        doc.text('Human-in-the-loop confirmation received via PylonChat Compliance Engine.', pageWidth - margin - 5, cursorY + 15, { align: 'right' })

        cursorY += 30

        // ── Footer on all pages ──
        const totalPages = doc.getNumberOfPages()
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(7)
            doc.setTextColor(148, 163, 184)
            doc.text('PylonChat Sovereign AI | Sydney Region (ap-southeast-2) | NDIS Compliance Engine', pageWidth / 2, pageHeight - 22, { align: 'center' })

            // Legal disclaimer - prominent
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(6.5)
            doc.setTextColor(220, 38, 38) // Red-600
            doc.text('LEGAL DISCLAIMER: This document is a compliance draft generated by PylonChat and must be verified by the provider\'s authorized officer.', pageWidth / 2, pageHeight - 17, { align: 'center' })

            doc.setFont('helvetica', 'normal')
            doc.setTextColor(148, 163, 184)
            doc.text(`It does not constitute legal advice. All remediation actions require independent professional review. | Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 13, { align: 'center' })
        }

        // Return as binary PDF
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

        console.log(`[Generate Addendum] Created ${pdfBuffer.length} byte PDF for "${fileName}" (${warnings.length} gaps)`)

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="NDIS_Addendum_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf"`,
            }
        })
    } catch (error: any) {
        console.error('Generate Addendum Error:', error)
        return NextResponse.json({ error: 'Failed to generate addendum' }, { status: 500 })
    }
}
