import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    FileSpreadsheet,
    ShieldCheck,
    ArrowRight,
    Activity,
    FolderLock,
} from 'lucide-react'
import Link from 'next/link'
import { UsageIndicator } from '@/components/dashboard/UsageIndicator'

export default async function DashboardPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const t = await getTranslations({ locale })
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // Fetch subscription data
    let subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id }
    })

    if (subscription && subscription.planType === 'free') {
        const now = new Date()
        const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null

        if (!periodEnd || periodEnd < now) {
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)

            subscription = await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    currentPeriodStart: currentMonthStart,
                    currentPeriodEnd: nextMonthStart,
                    conversationsUsed: 0
                }
            })
        }
    }

    // ── NDIS-specific data ────────────────────────────────────────────────────

    // Total claims created by this provider
    const totalClaims = await prisma.claim.count({
        where: { userId: session.user.id }
    })

    // Documents validated through the Service Agreement Validator
    const totalValidations = await prisma.auditLog.count({
        where: { actorId: session.user.id, action: 'DOCUMENT_ANALYZED' }
    })

    // Digital Evidence Vault — total documents indexed across all chatbot knowledge bases
    const chatbots = await prisma.chatbot.findMany({
        where: { userId: session.user.id },
        include: { _count: { select: { documents: true } } }
    })
    const totalVaultDocuments = chatbots.reduce((sum, bot) => sum + bot._count.documents, 0)

    // Recent audit trail
    const recentAudits = await prisma.auditLog.findMany({
        where: { actorId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 3
    })

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* ── Hero Section ── */}
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Welcome to your NDIS Command Center</h1>
                        <p className="text-lg text-teal-100">
                            Manage compliance, audit trails, and automated participant onboarding.
                        </p>
                    </div>

                    {/* Primary Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        {/* Validator Tool */}
                        <Link href={`/${locale}/dashboard/validator`}>
                            <Card className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all cursor-pointer group h-full">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                                        <ShieldCheck className="h-6 w-6 text-teal-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 text-white">Service Agreement Validator</h3>
                                    <p className="text-teal-100 text-sm mb-4">
                                        Upload participant service agreements to instantly flag missing clauses and price guide violations.
                                    </p>
                                    <div className="inline-flex items-center text-sm font-medium text-white group-hover:text-teal-200">
                                        Launch Validator
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Claims Management */}
                        <Link href={`/${locale}/dashboard/claims`}>
                            <Card className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all cursor-pointer group h-full">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                                        <FileSpreadsheet className="h-6 w-6 text-teal-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 text-white">Claims Management</h3>
                                    <p className="text-teal-100 text-sm mb-4">
                                        Upload bulk claims, map headers instantly, and generate PRODA-ready CSV exports with zero errors.
                                    </p>
                                    <div className="flex items-center text-sm font-medium text-white group-hover:text-teal-200">
                                        <span>Go to Claims</span>
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Dashboard Stats ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {subscription && (
                    <div className="mb-8">
                        <UsageIndicator
                            locale={locale}
                            subscription={{
                                planType: subscription.planType,
                                maxChatbots: subscription.maxChatbots,
                                maxDocuments: subscription.maxDocuments,
                                maxConversations: subscription.maxConversations,
                                conversationsUsed: subscription.conversationsUsed,
                                currentPeriodEnd: subscription.currentPeriodEnd
                            }}
                            currentUsage={{
                                chatbots: totalClaims,
                                documents: totalVaultDocuments,
                                conversations: totalValidations
                            }}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Audit Readiness */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Audit Readiness</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalValidations}</div>
                            <p className="text-xs text-slate-500 mt-1">Service agreements validated</p>
                        </CardContent>
                    </Card>

                    {/* Digital Evidence Vault */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Digital Evidence Vault</CardTitle>
                            <FolderLock className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalVaultDocuments}</div>
                            <p className="text-xs text-slate-500 mt-1">Documents secured in vault</p>
                        </CardContent>
                    </Card>

                    {/* Audit Trail Activity */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Audit Trail Activity</CardTitle>
                            <Activity className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-slate-700">
                                {recentAudits?.length > 0 ? (
                                    <ul className="space-y-2">
                                        {recentAudits.map((log: any) => (
                                            <li key={log.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                                                <span className="truncate text-xs text-slate-600">{log.action.replace(/_/g, ' ')}</span>
                                                <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                                    {new Date(log.createdAt).toLocaleDateString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-slate-400 text-sm">No recent logs</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
