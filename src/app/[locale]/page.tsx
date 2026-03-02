import { PublicNav } from '@/components/layout/PublicNav'
import { HeroSection } from '@/components/home/HeroSection'
import { Footer } from '@/components/Footer'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Shield,
    ClipboardCheck,
    Globe,
    FileText,
    BarChart,
    Lock,
    Server,
    CheckCircle,
    ArrowRight,
    CalendarCheck,
} from 'lucide-react'
import Link from 'next/link'

interface HomePageProps {
    params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
    const { locale } = await params

    return (
        <>
            <PublicNav />

            <main className="flex-1">
                {/* Hero Section */}
                <HeroSection />

                {/* Features Section — NDIS-focused */}
                <div id="audit-features" className="bg-white py-20 lg:py-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-full mb-4">
                                <ClipboardCheck className="h-3.5 w-3.5 text-teal-700" />
                                <span className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
                                    Platform Features
                                </span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                Built for NDIS providers who demand{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                                    audit-proof compliance
                                </span>
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Every feature is designed to streamline your compliance workflow,
                                reduce risk, and keep you ready for NDIA audits — 24/7.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 group">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                                        <ClipboardCheck className="h-6 w-6 text-teal-600" />
                                    </div>
                                    <CardTitle className="text-slate-900">
                                        Automated Audit Trails
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">
                                        Every participant interaction is automatically logged in a
                                        structured, English-only format ready for NDIA auditors.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 group">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                                        <Globe className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <CardTitle className="text-slate-900">
                                        50+ CALD Languages
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">
                                        Support participants in their preferred language — Arabic,
                                        Vietnamese, Mandarin, Turkish, and more — without compliance gaps.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 group">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                        <Shield className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-slate-900">
                                        APP &amp; Privacy Act Compliant
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">
                                        Full compliance with Australian Privacy Principles. No data
                                        leaves Australian shores. Ever.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 group">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                                        <BarChart className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <CardTitle className="text-slate-900">
                                        Risk Analytics Dashboard
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">
                                        Real-time compliance scoring, risk indicators, and trend
                                        analysis so you catch issues before auditors do.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 group">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
                                        <FileText className="h-6 w-6 text-slate-600" />
                                    </div>
                                    <CardTitle className="text-slate-900">
                                        Smart Documentation
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">
                                        AI-generated progress notes, incident reports, and service
                                        delivery records that meet NDIS Quality Standards.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 group">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-100 transition-colors">
                                        <Lock className="h-6 w-6 text-violet-600" />
                                    </div>
                                    <CardTitle className="text-slate-900">
                                        End-to-End Encryption
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">
                                        AES-256 encryption at rest, TLS 1.3 in transit. Participant data
                                        is secured with healthcare-grade infrastructure.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 group">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-100 transition-colors">
                                        <Server className="h-6 w-6 text-cyan-600" />
                                    </div>
                                    <CardTitle className="text-slate-900">
                                        Sydney Data Centre
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">
                                        Your data is hosted on Australian sovereign infrastructure in
                                        Sydney. No offshore processing. No exceptions.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 group">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-100 transition-colors">
                                        <BarChart className="h-6 w-6 text-rose-600" />
                                    </div>
                                    <CardTitle className="text-slate-900">
                                        Provider Analytics
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">
                                        Track participant engagement, response quality, and team
                                        performance across all service delivery areas.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Data Sovereignty Section */}
                <div id="data-sovereignty" className="bg-slate-900 text-white py-20 lg:py-24 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full translate-x-1/2 translate-y-1/2" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-8">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            Australian Data Sovereignty
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto">
                            Your participants&apos; data{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                                never leaves Australia
                            </span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                            Hosted on sovereign infrastructure in Sydney. Fully compliant with the
                            Privacy Act 1988 and Australian Privacy Principles. No offshore processing —
                            ever.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mb-12">
                            <Link
                                href="/en/contact?type=demo"
                                className="h-14 px-8 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                            >
                                Book a Demo
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                href="/en/auth/login"
                                className="h-14 px-8 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300 flex items-center gap-2"
                            >
                                Login to Dashboard
                            </Link>
                        </div>

                        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                                <span>Privacy Act 1988 Compliant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                                <span>AES-256 Encryption</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                                <span>SOC 2 Type II Ready</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer locale={locale} />
        </>
    )
}