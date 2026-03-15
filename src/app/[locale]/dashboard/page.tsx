import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent } from '@/components/ui/card'
import {
    FileSpreadsheet,
    ShieldCheck,
    ArrowRight,
    Activity,
    FolderLock,
    Upload,
    BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import StatsCards from '@/components/dashboard/StatsCards'
import XeroConnect from '@/components/dashboard/XeroConnect'
import XeroInvoices from '@/components/dashboard/XeroInvoices'
import XeroParticipants from '@/components/dashboard/XeroParticipants'

export default async function DashboardPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    await getTranslations({ locale })
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // ── Subscription (read-only — no update needed unless fields exist) ────────
    const subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
        select: { planType: true },
    })

    // ── Supporting metrics ─────────────────────────────────────────────────────
    const [totalValidations, totalVaultDocuments, recentAudits] = await Promise.all([
        prisma.auditLog.count({
            where: { actorId: session.user.id, action: 'DOCUMENT_ANALYZED' },
        }),
        prisma.chatbot.findMany({
            where: { userId: session.user.id },
            include: { _count: { select: { documents: true } } },
        }).then(bots => bots.reduce((sum, b) => sum + b._count.documents, 0)),
        prisma.auditLog.findMany({
            where: { actorId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 3,
        }),
    ])

    const firstName = session.user.name?.split(' ')[0] ?? 'Provider'

    return (
        <div className="min-h-screen bg-slate-50/50 pb-16">

            {/* ── Hero Banner ──────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <p className="text-teal-200 text-sm font-medium mb-1 uppercase tracking-widest">
                                {subscription?.planType?.toUpperCase() ?? 'FREE'} plan
                            </p>
                            <h1 className="text-3xl font-black tracking-tight mb-2">
                                Welcome back, {firstName} 👋
                            </h1>
                            <p className="text-teal-100 text-sm max-w-lg">
                                Your NDIS compliance command centre — claims, audits, and participant data all in one place.
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-3 shrink-0">
                            <Link
                                href={`/${locale}/dashboard/validator`}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-semibold rounded-xl transition-colors backdrop-blur-sm"
                            >
                                <Upload className="w-4 h-4" />
                                Upload New Claim
                            </Link>
                            <Link
                                href={`/${locale}/dashboard/claims`}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-teal-700 text-sm font-semibold rounded-xl hover:bg-teal-50 transition-colors shadow-sm"
                            >
                                <BarChart3 className="w-4 h-4" />
                                View Reports
                            </Link>
                        </div>
                    </div>

                    {/* Primary shortcut cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
                        <Link href={`/${locale}/dashboard/validator`}>
                            <Card className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all cursor-pointer group h-full">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                                        <ShieldCheck className="h-6 w-6 text-teal-600" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-1.5 text-white">Service Agreement Validator</h3>
                                    <p className="text-teal-100 text-sm mb-4 leading-relaxed">
                                        Upload participant service agreements to instantly flag missing clauses and price guide violations.
                                    </p>
                                    <span className="inline-flex items-center text-sm font-semibold text-white group-hover:text-teal-200 transition-colors">
                                        Launch Validator
                                        <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href={`/${locale}/dashboard/claims`}>
                            <Card className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all cursor-pointer group h-full">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                                        <FileSpreadsheet className="h-6 w-6 text-teal-600" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-1.5 text-white">Claims Management</h3>
                                    <p className="text-teal-100 text-sm mb-4 leading-relaxed">
                                        Upload bulk claims, map headers instantly, and generate PRODA-ready CSV exports with zero errors.
                                    </p>
                                    <span className="inline-flex items-center text-sm font-semibold text-white group-hover:text-teal-200 transition-colors">
                                        Go to Claims
                                        <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Main Content ─────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Claims Stats — animated client component */}
                <div className="mt-10 mb-10">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Claims Overview</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Live financial snapshot from your claims ledger</p>
                        </div>
                        <Link
                            href={`/${locale}/dashboard/claims`}
                            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                        >
                            View all claims <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <StatsCards />
                </div>

                {/* Supporting metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

                    {/* Audit Readiness */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Audit Readiness</p>
                            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="h-4 w-4 text-teal-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-teal-700 tabular-nums">{totalValidations}</p>
                        <p className="text-xs text-slate-400 mt-1">Service agreements validated</p>
                    </div>

                    {/* Digital Evidence Vault */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Evidence Vault</p>
                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                                <FolderLock className="h-4 w-4 text-slate-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-700 tabular-nums">{totalVaultDocuments}</p>
                        <p className="text-xs text-slate-400 mt-1">Documents secured in vault</p>
                    </div>

                    {/* Audit Trail Activity */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</p>
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Activity className="h-4 w-4 text-blue-500" />
                            </div>
                        </div>
                        {recentAudits.length > 0 ? (
                            <ul className="space-y-2">
                                {recentAudits.map((log: any) => (
                                    <li key={log.id} className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600 truncate">
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                            {new Date(log.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-slate-400">No recent activity</p>
                        )}
                    </div>

                </div>

                {/* ── Quick Actions Row ─────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-widest">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={`/${locale}/dashboard/validator`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                        >
                            <Upload className="w-4 h-4" />
                            Upload New Claim
                        </Link>
                        <Link
                            href={`/${locale}/dashboard/claims`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                        >
                            <BarChart3 className="w-4 h-4" />
                            View Reports
                        </Link>
                        <Link
                            href={`/${locale}/dashboard/validator`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-colors"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Run Compliance Check
                        </Link>
                        <Link
                            href={`/${locale}/dashboard/claims`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-violet-200 text-violet-700 hover:bg-violet-50 text-sm font-semibold rounded-xl transition-colors"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Export to PRODA
                        </Link>
                    </div>

                    {/* Xero integration — sits directly below the action buttons */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <Suspense fallback={<div className="h-16 rounded-xl bg-slate-50 animate-pulse" />}>
                            <XeroConnect />
                        </Suspense>
                        <XeroParticipants />
                        <XeroInvoices />
                    </div>
                </div>

            </div>
        </div>
    )
}
