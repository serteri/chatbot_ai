import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

// ---------------------------------------------------------------------------
// GET /api/audit/export-batch?batchTaskId=<firstTaskId>
// Exports a CSV of all analysis results for bulk tasks in a time-based batch
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const batchTaskId = request.nextUrl.searchParams.get('batchTaskId')
        if (!batchTaskId) {
            return NextResponse.json({ error: 'Missing batchTaskId parameter' }, { status: 400 })
        }

        // Find the anchor task to determine batch time window
        const anchorTask = await prisma.analysisTask.findUnique({
            where: { id: batchTaskId, userId: session.user.id }
        })

        if (!anchorTask) {
            return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
        }

        // Find all tasks within 30 seconds of the anchor task
        const batchStart = new Date(anchorTask.createdAt.getTime() - 5000) // 5s before
        const batchEnd = new Date(anchorTask.createdAt.getTime() + 30000) // 30s after

        const batchTasks = await prisma.analysisTask.findMany({
            where: {
                userId: session.user.id,
                createdAt: { gte: batchStart, lte: batchEnd },
            },
            include: {
                analysis: {
                    select: {
                        participantName: true,
                        complianceScore: true,
                        warnings: true,
                        region: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        // Build CSV
        const csvHeader = 'File Name,Status,Participant,Compliance Score (%),Warnings Count,Warnings Detail,Region,Analyzed At\n'

        const csvRows = batchTasks.map(task => {
            const analysis = task.analysis
            const warnings = analysis?.warnings
            const warningsList = Array.isArray(warnings) ? warnings : []
            const warningsText = warningsList.map((w: any) => typeof w === 'string' ? w : JSON.stringify(w)).join(' | ')

            return [
                `"${task.fileName.replace(/"/g, '""')}"`,
                task.status,
                `"${analysis?.participantName || 'Unknown'}"`,
                analysis?.complianceScore ?? 'N/A',
                warningsList.length,
                `"${warningsText.replace(/"/g, '""')}"`,
                analysis?.region || 'ap-southeast-2',
                analysis?.createdAt ? analysis.createdAt.toISOString() : 'N/A',
            ].join(',')
        }).join('\n')

        const csvContent = csvHeader + csvRows

        console.log(`[Audit Export] Generated CSV for ${batchTasks.length} tasks in batch ${batchTaskId}`)

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="ndis-audit-batch-${batchTaskId.slice(0, 8)}-${Date.now()}.csv"`,
            }
        })
    } catch (error: any) {
        console.error('Audit Export Error:', error)
        return NextResponse.json({ error: 'Failed to export audit data' }, { status: 500 })
    }
}
