import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// ---------------------------------------------------------------------------
// POST /api/validator/generate-addendum
// Generates a professional "NDIS Service Agreement Addendum" PDF
// from the analysis resultJson (warnings, score, participant details)
// ---------------------------------------------------------------------------

interface AddendumRequest {
    fileName: string
    participantName: string
    complianceScore: number
    warnings: string[]
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body: AddendumRequest = await request.json()
        const { fileName, participantName, complianceScore, warnings } = body

        if (!fileName || !warnings) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(16)
        doc.text('NDIS SERVICE AGREEMENT ADDENDUM', pageWidth / 2, 24, { align: 'center' })

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184) // Slate-400
        doc.text('Master Compliance Document • NDIS Practice Standards & Price Guide 2025/26', pageWidth / 2, 33, { align: 'center' })

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
        doc.text(participantName || 'As identified in original agreement', margin + 30, cursorY + 15)

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
        doc.text('2. Identified Compliance Gaps & Required Actions', margin, cursorY)
        cursorY += 4

        const tableBody = warnings.map((warning, idx) => {
            const warningText = typeof warning === 'string' ? warning : JSON.stringify(warning)

            // Generate a remediation suggestion based on the warning
            let remediation = 'Provider must address this gap and update the Service Agreement accordingly.'

            const lowerWarning = warningText.toLowerCase()
            if (lowerWarning.includes('abn') || lowerWarning.includes('provider')) {
                remediation = 'Insert complete Provider details including registered ABN, business name, and NDIS registration number in Section 1 of the agreement.'
            } else if (lowerWarning.includes('cancellation') || lowerWarning.includes('cancel')) {
                remediation = 'Add a cancellation clause specifying the notice period (minimum 2 clear business days for standard supports) as per NDIS Price Guide 2025/26.'
            } else if (lowerWarning.includes('complaint') || lowerWarning.includes('dispute') || lowerWarning.includes('grievance')) {
                remediation = 'Include a formal complaints and disputes resolution procedure with reference to the NDIS Quality & Safeguards Commission (1800 035 544).'
            } else if (lowerWarning.includes('pricing') || lowerWarning.includes('price') || lowerWarning.includes('cost') || lowerWarning.includes('rate')) {
                remediation = 'Ensure all pricing references align with the NDIS Price Guide 2025/26 effective rates. Include itemised support line items with TIS codes.'
            } else if (lowerWarning.includes('consent') || lowerWarning.includes('permission')) {
                remediation = 'Add explicit informed consent clauses covering data sharing, support delivery methods, and participant rights under the NDIS Act 2013.'
            } else if (lowerWarning.includes('plan') || lowerWarning.includes('goal')) {
                remediation = 'Include a clear reference to participant goals as outlined in their NDIS Plan, ensuring supports are aligned with stated objectives.'
            } else if (lowerWarning.includes('safety') || lowerWarning.includes('incident') || lowerWarning.includes('risk')) {
                remediation = 'Add incident management and safety reporting procedures in accordance with NDIS Practice Standards Module 2 (Provider Governance).'
            } else if (lowerWarning.includes('termination') || lowerWarning.includes('exit')) {
                remediation = 'Include clear service termination/exit procedures with reasonable notice periods and transition support arrangements.'
            } else if (lowerWarning.includes('gst') || lowerWarning.includes('tax') || lowerWarning.includes('invoice')) {
                remediation = 'Ensure GST treatment is correctly stated. NDIS supports are generally GST-free. Include clear invoicing procedures and payment terms.'
            }

            return [`Gap ${idx + 1}`, warningText, remediation]
        })

        if (tableBody.length === 0) {
            tableBody.push(['—', 'No critical compliance gaps identified.', 'No remediation necessary.'])
        }

        // @ts-ignore
        doc.autoTable({
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

        drawSigBox(margin, 'Provider Representative')
        drawSigBox(margin + sigBoxWidth + 10, 'Participant / Nominee')

        // ── Footer on all pages ──
        const totalPages = doc.getNumberOfPages()
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(7)
            doc.setTextColor(148, 163, 184)
            doc.text('PylonChat Sovereign AI | Sydney Region (ap-southeast-2) | NDIS Compliance Engine', pageWidth / 2, pageHeight - 18, { align: 'center' })
            doc.text(`This document is a compliance tool and does not constitute legal advice. | Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 14, { align: 'center' })
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
