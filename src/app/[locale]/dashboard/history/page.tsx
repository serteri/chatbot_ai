import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import HistoryClientPage from './HistoryClientPage'

export async function generateMetadata({ params }: { params: { locale: string } }) {
    const t = await getTranslations({ locale: params.locale, namespace: 'dashboard' })
    return {
        title: `History | ${t('title')}`,
        description: t('description'),
    }
}

export default async function HistoryPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // Fetch the analyses securely for this user
    const analyses = await prisma.analysis.findMany({
        where: {
            userId: session.user.id
        },
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            fileName: true,
            participantName: true,
            complianceScore: true,
            pdfUrl: true,
            region: true,
            createdAt: true
        }
    })

    // Serialize dates for Client Component
    const serializedAnalyses = analyses.map(analysis => ({
        ...analysis,
        createdAt: analysis.createdAt.toISOString()
    }))

    return (
        <HistoryClientPage initialAnalyses={serializedAnalyses} />
    )
}
