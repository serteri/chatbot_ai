import Link from 'next/link'
import {
    Shield,
    CheckCircle,
    CalendarCheck,
    FileSearch,
    Globe,
    MessageSquare,
    Lock,
    BarChart3,
    AlertTriangle,
    TrendingUp,
} from 'lucide-react'

export function HeroSection() {
    return (
        <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50/50 overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Decorative gradient orbs */}
            <div className="absolute top-20 -left-32 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 -right-32 w-80 h-80 bg-emerald-200/15 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left — Text & CTAs */}
                    <div className="max-w-xl">
                        {/* Compliance badge */}
                        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-full mb-6">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
                                NDIS &amp; APP Compliant
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 leading-[1.12] tracking-tight mb-6">
                            Automate NDIS Compliance.{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                                Never Fail an Audit Again.
                            </span>
                        </h1>

                        <p className="text-lg text-slate-600 leading-relaxed mb-8">
                            PylonChat is the only AI assistant that supports your CALD patients in{' '}
                            <span className="font-semibold text-slate-800">50+ languages</span>, while
                            automatically generating flawless,{' '}
                            <span className="font-semibold text-slate-800">English-only audit trails</span>{' '}
                            for your NDIS compliance checks.{' '}
                            <span className="text-teal-700 font-medium">Data hosted securely in Sydney, Australia.</span>
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-8">
                            <Link
                                href="/en/contact?type=demo"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-300 text-sm"
                            >
                                <CalendarCheck className="h-5 w-5" />
                                Book a 15-Min Demo
                            </Link>
                            <Link
                                href="/en/#sample-audit"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/40 transition-all duration-200 text-sm"
                            >
                                <FileSearch className="h-5 w-5" />
                                View Sample Audit Log
                            </Link>
                        </div>

                        {/* Trust badge */}
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <div className="flex items-center justify-center w-8 h-8 bg-emerald-50 border border-emerald-200 rounded-full">
                                <Shield className="h-4 w-4 text-emerald-600" />
                            </div>
                            <span>
                                Compliant with{' '}
                                <span className="font-semibold text-slate-700">
                                    Australian Privacy Principles (APP)
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Right — Dashboard Mockup */}
                    <div className="relative lg:pl-8">
                        <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
                            {/* Dashboard header bar */}
                            <div className="flex items-center justify-between px-5 py-3 bg-slate-800 border-b border-slate-700">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                </div>
                                <span className="text-xs text-slate-400 font-mono">
                                    pylonchat.com.au/dashboard
                                </span>
                                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                            </div>

                            {/* Dashboard content */}
                            <div className="p-5 space-y-4">
                                {/* Compliance Score Row */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Compliance Score
                                        </p>
                                        <div className="flex items-baseline gap-1.5 mt-1">
                                            <span className="text-3xl font-bold text-emerald-600">
                                                98.7%
                                            </span>
                                            <span className="flex items-center text-xs text-emerald-600 font-medium">
                                                <TrendingUp className="h-3 w-3 mr-0.5" />
                                                +2.1%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        <span className="text-xs font-semibold text-emerald-700">
                                            Audit Ready
                                        </span>
                                    </div>
                                </div>

                                {/* Stats mini cards */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Globe className="h-3.5 w-3.5 text-teal-600" />
                                            <span className="text-[10px] font-semibold text-slate-500 uppercase">
                                                Languages
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold text-slate-800">52</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <BarChart3 className="h-3.5 w-3.5 text-teal-600" />
                                            <span className="text-[10px] font-semibold text-slate-500 uppercase">
                                                Audits
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold text-slate-800">1,247</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                            <span className="text-[10px] font-semibold text-slate-500 uppercase">
                                                Risks
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold text-slate-800">2</span>
                                    </div>
                                </div>

                                {/* Chat preview */}
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2.5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="h-3.5 w-3.5 text-teal-600" />
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                            Live Chat — CALD Support
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[10px] font-bold text-blue-700">P</span>
                                        </div>
                                        <div className="bg-white rounded-lg px-3 py-2 text-xs text-slate-600 border border-slate-200 max-w-[200px]">
                                            Merhaba, NDIS planım hakkında bilgi alabilir miyim?
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <div className="bg-teal-600 rounded-lg px-3 py-2 text-xs text-white max-w-[220px]">
                                            Of course! I can help you with your NDIS plan. Let me pull up your file...
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                                            <Shield className="h-3 w-3 text-teal-700" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200">
                                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                                        <span className="text-[10px] text-emerald-600 font-medium">
                                            Audit trail auto-generated • English log saved
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating badge */}
                        <div className="absolute -bottom-3 -left-3 lg:-left-6 bg-white rounded-xl shadow-lg shadow-slate-200/60 border border-slate-200 px-4 py-2.5 flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-200">
                                <Lock className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase">Data Centre</p>
                                <p className="text-xs font-bold text-slate-800">Sydney, AU 🇦🇺</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
