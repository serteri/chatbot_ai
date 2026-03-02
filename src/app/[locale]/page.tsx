import { PublicNav } from '@/components/layout/PublicNav'
import { HeroSection } from '@/components/home/HeroSection'
import { Footer } from '@/components/Footer'
import {
    ClipboardCheck,
    Globe,
    Shield,
    Server,
    ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

interface HomePageProps {
    params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
    const { locale } = await params

    const highlights = [
        {
            icon: ClipboardCheck,
            title: 'Audit Features',
            description: 'Automated audit trails, risk analytics, and smart documentation — purpose-built for NDIA compliance.',
            href: `/${locale}/audit-features`,
            color: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-600', hover: 'hover:border-teal-300' },
        },
        {
            icon: Globe,
            title: '50+ CALD Languages',
            description: 'Support participants in their preferred language while auto-generating English-only audit logs.',
            href: `/${locale}/audit-features`,
            color: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', hover: 'hover:border-emerald-300' },
        },
        {
            icon: Shield,
            title: 'APP & Privacy Act Compliant',
            description: 'Full compliance with all 13 Australian Privacy Principles. Healthcare-grade data protection.',
            href: `/${locale}/data-sovereignty`,
            color: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', hover: 'hover:border-blue-300' },
        },
        {
            icon: Server,
            title: 'Sydney Data Centre',
            description: 'Your data never leaves Australia. Sovereign infrastructure in Sydney, ap-southeast-2.',
            href: `/${locale}/data-sovereignty`,
            color: { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: 'text-cyan-600', hover: 'hover:border-cyan-300' },
        },
    ]

    return (
        <>
            <PublicNav />

            <main className="flex-1">
                {/* Hero Section */}
                <HeroSection locale={locale} />

                {/* Feature Highlights — Preview Cards that link to dedicated pages */}
                <section className="bg-white py-20 lg:py-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                Why NDIS Providers Choose{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                                    PylonChat
                                </span>
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Purpose-built for compliance, trusted by providers across Australia.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {highlights.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className={`group bg-white border ${item.color.border} rounded-2xl p-8 shadow-sm hover:shadow-xl ${item.color.hover} transition-all duration-300`}
                                    >
                                        <div className={`w-14 h-14 ${item.color.bg} ${item.color.border} border rounded-xl flex items-center justify-center mb-5`}>
                                            <Icon className={`h-7 w-7 ${item.color.icon}`} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                            {item.title}
                                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                                        </h3>
                                        <p className="text-slate-500 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>
            </main>

            <Footer locale={locale} />
        </>
    )
}