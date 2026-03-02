import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import {
    Shield,
    ClipboardCheck,
    Globe,
    FileText,
    BarChart,
    Lock,
    Server,
    CheckCircle,
    CalendarCheck,
    ArrowRight,
    AlertTriangle,
    TrendingUp,
    MessageSquare,
} from 'lucide-react'
import Link from 'next/link'

interface AuditFeaturesPageProps {
    params: Promise<{ locale: string }>
}

export default async function AuditFeaturesPage({ params }: AuditFeaturesPageProps) {
    const { locale } = await params

    const features = [
        {
            icon: ClipboardCheck,
            title: 'Automated Audit Trails',
            description: 'Every participant interaction is automatically logged in a structured, English-only format ready for NDIA auditors. No manual documentation required.',
            color: 'teal',
        },
        {
            icon: Globe,
            title: '50+ CALD Languages',
            description: 'Support participants in their preferred language — Arabic, Vietnamese, Mandarin, Turkish, and more — without compliance gaps. All conversations auto-translated to English for audit.',
            color: 'emerald',
        },
        {
            icon: Shield,
            title: 'APP & Privacy Act Compliant',
            description: 'Full compliance with Australian Privacy Principles (APP) and the Privacy Act 1988. Every data handling process is designed to meet the highest standards of healthcare data protection.',
            color: 'blue',
        },
        {
            icon: BarChart,
            title: 'Risk Analytics Dashboard',
            description: 'Real-time compliance scoring, risk indicators, and trend analysis so you catch issues before auditors do. Visual dashboards make it easy to spot gaps.',
            color: 'amber',
        },
        {
            icon: FileText,
            title: 'Smart Documentation',
            description: 'AI-generated progress notes, incident reports, and service delivery records that meet NDIS Quality Standards. Reduce admin time by up to 70%.',
            color: 'slate',
        },
        {
            icon: Lock,
            title: 'End-to-End Encryption',
            description: 'AES-256 encryption at rest, TLS 1.3 in transit. Participant data is secured with healthcare-grade infrastructure, exceeding NDIS security requirements.',
            color: 'violet',
        },
        {
            icon: Server,
            title: 'Sydney Data Centre',
            description: 'Your data is hosted on Australian sovereign infrastructure in Sydney. No offshore processing, no exceptions. Full data residency compliance.',
            color: 'cyan',
        },
        {
            icon: BarChart,
            title: 'Provider Analytics',
            description: 'Track participant engagement, response quality, and team performance across all service delivery areas. Export-ready reports for NDIA submissions.',
            color: 'rose',
        },
    ]

    const colorMap: Record<string, { bg: string; border: string; icon: string; hoverBg: string }> = {
        teal: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-600', hoverBg: 'group-hover:bg-teal-100' },
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', hoverBg: 'group-hover:bg-emerald-100' },
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', hoverBg: 'group-hover:bg-blue-100' },
        amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', hoverBg: 'group-hover:bg-amber-100' },
        slate: { bg: 'bg-slate-100', border: 'border-slate-200', icon: 'text-slate-600', hoverBg: 'group-hover:bg-slate-200' },
        violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600', hoverBg: 'group-hover:bg-violet-100' },
        cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: 'text-cyan-600', hoverBg: 'group-hover:bg-cyan-100' },
        rose: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-600', hoverBg: 'group-hover:bg-rose-100' },
    }

    return (
        <>
            <PublicNav />

            <main className="flex-1">
                {/* Page Header */}
                <section className="bg-gradient-to-b from-slate-50 via-white to-white py-16 lg:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-full mb-6">
                                <ClipboardCheck className="h-3.5 w-3.5 text-teal-700" />
                                <span className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
                                    Platform Features
                                </span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
                                Built for NDIS providers who demand{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                                    audit-proof compliance
                                </span>
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed">
                                Every feature is designed to streamline your compliance workflow,
                                reduce risk, and keep you ready for NDIA audits — 24/7.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="bg-white py-16 lg:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature) => {
                                const Icon = feature.icon
                                const colors = colorMap[feature.color]
                                return (
                                    <div
                                        key={feature.title}
                                        className="group bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300"
                                    >
                                        <div className={`w-14 h-14 ${colors.bg} ${colors.border} border rounded-xl flex items-center justify-center mb-5 ${colors.hoverBg} transition-colors`}>
                                            <Icon className={`h-7 w-7 ${colors.icon}`} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                                            {feature.title}
                                        </h3>
                                        <p className="text-slate-500 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="bg-slate-50 py-16 lg:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                How the Audit Trail Works
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                From multilingual chat to compliant documentation in seconds.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="relative bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-5">1</div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Participant Chats in Their Language</h3>
                                <p className="text-slate-500">A CALD participant opens a support chat in Turkish, Arabic, Vietnamese, or any of 50+ languages.</p>
                            </div>
                            <div className="relative bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-5">2</div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">AI Responds & Translates</h3>
                                <p className="text-slate-500">PylonChat responds in the participant&apos;s language while simultaneously generating an English audit log.</p>
                            </div>
                            <div className="relative bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-5">3</div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Audit-Ready Documentation</h3>
                                <p className="text-slate-500">Structured, timestamped English logs are stored on Australian servers — ready for NDIA review at any time.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-gradient-to-r from-teal-600 to-emerald-600 py-16 lg:py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Ready to Automate Your NDIS Compliance?
                        </h2>
                        <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
                            See how PylonChat can save your team 15+ hours per week on
                            compliance documentation.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href={`/${locale}/contact?type=demo`}
                                className="h-14 px-8 rounded-xl bg-white text-teal-700 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                            >
                                <CalendarCheck className="h-5 w-5" />
                                Book a 15-Min Demo
                            </Link>
                            <Link
                                href={`/${locale}/data-sovereignty`}
                                className="h-14 px-8 rounded-xl border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                            >
                                Learn About Data Sovereignty
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer locale={locale} />
        </>
    )
}
