import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import {
    Shield,
    Server,
    Lock,
    CheckCircle,
    ArrowRight,
    CalendarCheck,
    Globe,
    MapPin,
    ShieldCheck,
    Database,
} from 'lucide-react'
import Link from 'next/link'

interface DataSovereigntyPageProps {
    params: Promise<{ locale: string }>
}

export default async function DataSovereigntyPage({ params }: DataSovereigntyPageProps) {
    const { locale } = await params

    return (
        <>
            <PublicNav />

            <main className="flex-1">
                {/* Page Header */}
                <section className="bg-slate-900 text-white py-16 lg:py-24 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full translate-x-1/2 translate-y-1/2" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-8">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                Australian Data Sovereignty
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
                                Your participants&apos; data{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                                    never leaves Australia
                                </span>
                            </h1>
                            <p className="text-xl text-slate-300 leading-relaxed">
                                Hosted on sovereign infrastructure in Sydney. Fully compliant with the
                                Privacy Act 1988 and Australian Privacy Principles. No offshore processing — ever.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Key Commitments */}
                <section className="bg-white py-16 lg:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                Our Data Sovereignty Commitment
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                We go beyond minimum requirements to ensure your data is protected at every level.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 group">
                                <div className="w-14 h-14 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center justify-center mb-5 group-hover:bg-cyan-100 transition-colors">
                                    <MapPin className="h-7 w-7 text-cyan-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Sydney, Australia</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    All data is stored exclusively in Tier IV data centres located in Sydney, NSW.
                                    Region: <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">ap-southeast-2</code>.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 group">
                                <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                                    <ShieldCheck className="h-7 w-7 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Privacy Act 1988</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    Full compliance with all 13 Australian Privacy Principles (APPs).
                                    Regular third-party audits ensure ongoing adherence.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 group">
                                <div className="w-14 h-14 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center mb-5 group-hover:bg-violet-100 transition-colors">
                                    <Lock className="h-7 w-7 text-violet-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">AES-256 Encryption</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    End-to-end encryption with AES-256 at rest and TLS 1.3 in transit.
                                    Healthcare-grade infrastructure exceeding NDIS requirements.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 group">
                                <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center mb-5 group-hover:bg-emerald-100 transition-colors">
                                    <Database className="h-7 w-7 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">No Offshore Processing</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    Zero data transfer outside Australian borders. All AI processing,
                                    storage, and backups happen within sovereign Australian infrastructure.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 group">
                                <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center mb-5 group-hover:bg-amber-100 transition-colors">
                                    <Shield className="h-7 w-7 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">SOC 2 Type II Ready</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    Infrastructure designed to meet SOC 2 Type II standards with
                                    continuous monitoring, access controls, and audit logging.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 group">
                                <div className="w-14 h-14 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors">
                                    <Globe className="h-7 w-7 text-teal-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">CALD Data Handling</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    Multilingual conversations are processed and stored in compliance
                                    with both Australian and international data protection standards.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Badges */}
                <section className="bg-slate-50 py-12 lg:py-16">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap justify-center items-center gap-8">
                            <div className="flex items-center gap-2.5 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                <span className="text-sm font-semibold text-slate-700">Privacy Act 1988</span>
                            </div>
                            <div className="flex items-center gap-2.5 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                <span className="text-sm font-semibold text-slate-700">AES-256 Encryption</span>
                            </div>
                            <div className="flex items-center gap-2.5 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                <span className="text-sm font-semibold text-slate-700">SOC 2 Type II Ready</span>
                            </div>
                            <div className="flex items-center gap-2.5 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                <span className="text-sm font-semibold text-slate-700">NDIS Compliant</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-gradient-to-r from-teal-600 to-emerald-600 py-16 lg:py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Trust PylonChat With Your Most Sensitive Data
                        </h2>
                        <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
                            Join NDIS providers across Australia who trust PylonChat
                            for compliant, sovereign data handling.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href={`/${locale}/contact?type=demo`}
                                className="h-14 px-8 rounded-xl bg-white text-teal-700 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                            >
                                <CalendarCheck className="h-5 w-5" />
                                Book a Demo
                            </Link>
                            <Link
                                href={`/${locale}/audit-features`}
                                className="h-14 px-8 rounded-xl border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                            >
                                View Audit Features
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
