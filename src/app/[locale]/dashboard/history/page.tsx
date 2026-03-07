import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import HistoryClientPage from './HistoryClientPage'

export async function generateMetadata() {
    return {
        title: 'Service Agreement History | NDIS Audit Readiness',
        description: 'Review all past NDIS Service Agreement compliance analyses stored in the Sovereign Vault.',
    }
}

export default async function HistoryPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // 1. Fetch Single + Bulk analysis records from Neon DB
    const analyses = await prisma.analysis.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            fileName: true,
            participantName: true,
            complianceScore: true,
            warnings: true,
            pdfUrl: true,
            region: true,
            createdAt: true,
        }
    })

    // 2. Fetch Bulk Analysis Tasks to identify batch groupings
    const bulkTasks = await prisma.analysisTask.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            fileName: true,
            status: true,
            fileUrl: true,
            analysisId: true,
            createdAt: true,
        }
    })

    // 3. Group bulk tasks into batches (tasks created within 30 seconds of each other)
    const batches: { batchId: string; createdAt: string; tasks: typeof bulkTasks }[] = []
    let currentBatch: typeof bulkTasks = []
    let batchStart: Date | null = null

    for (const task of bulkTasks) {
        if (!batchStart || (task.createdAt.getTime() - batchStart.getTime()) > 30000) {
            // New batch
            if (currentBatch.length > 0) {
                batches.push({
                    batchId: `batch-${currentBatch[0].id}`,
                    createdAt: currentBatch[0].createdAt.toISOString(),
                    tasks: currentBatch,
                })
            }
            currentBatch = [task]
            batchStart = task.createdAt
        } else {
            currentBatch.push(task)
        }
    }
    // Push final batch
    if (currentBatch.length > 0) {
        batches.push({
            batchId: `batch-${currentBatch[0].id}`,
            createdAt: currentBatch[0].createdAt.toISOString(),
            tasks: currentBatch,
        })
    }

    // 4. Build a set of analysisIds that came from bulk tasks
    const bulkAnalysisIds = new Set(
        bulkTasks
            .filter(t => t.analysisId)
            .map(t => t.analysisId!)
    )

    // 5. Split analyses into single vs bulk
    const singleAnalyses = analyses.filter(a => !bulkAnalysisIds.has(a.id))

    // Serialize dates for Client Component
    const serializedSingle = singleAnalyses.map(a => ({
        ...a,
        warnings: Array.isArray(a.warnings) ? (a.warnings as any[]) : [],
        createdAt: a.createdAt.toISOString(),
    }))

    const serializedBatches = batches.map(batch => ({
        ...batch,
        tasks: batch.tasks.map(t => ({
            ...t,
            createdAt: t.createdAt.toISOString(),
        })),
    }))

    // For bulk tasks that have linked analyses, include the analysis data
    const bulkAnalysisMap: Record<string, { complianceScore: number; participantName: string | null; warnings: any[] }> = {}
    for (const a of analyses) {
        if (bulkAnalysisIds.has(a.id)) {
            bulkAnalysisMap[a.id] = {
                complianceScore: a.complianceScore,
                participantName: a.participantName,
                warnings: Array.isArray(a.warnings) ? (a.warnings as any[]) : [],
            }
        }
    }

    return (
        <HistoryClientPage
            singleAnalyses={serializedSingle}
            bulkBatches={serializedBatches}
            bulkAnalysisMap={bulkAnalysisMap}
        />
    )
}
