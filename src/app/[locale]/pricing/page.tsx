'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    Check,
    Star,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    ShieldCheck,
    X,
    MessageSquare,
} from 'lucide-react'
import { NDIS_COMPLIANCE_TIERS } from '@/config/pricing'

export default function PricingPage() {
    const t = useTranslations()
    const params = useParams()
    const locale = params.locale as string
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

    // Currency based on locale
    const getCurrency = () => {
        switch (locale) {
            case 'tr': return '₺'
            case 'en': return '$'
            default: return '€'
        }
    }

    // Monthly prices based on locale.
    // All values are imported from the central pricing config.
    const getMonthlyPrices = () => {
        const currency = getCurrency()
        const starterUSD = NDIS_COMPLIANCE_TIERS.starter.priceMonthlyUSD
        const proUSD = NDIS_COMPLIANCE_TIERS.professional.priceMonthlyUSD
        const proTRY = NDIS_COMPLIANCE_TIERS.professional.priceMonthlyTRY
        const bizUSD = NDIS_COMPLIANCE_TIERS.business.priceMonthlyUSD
        const bizTRY = NDIS_COMPLIANCE_TIERS.business.priceMonthlyTRY

        switch (locale) {
            case 'tr':
                return {
                    free: { price: starterUSD, display: NDIS_COMPLIANCE_TIERS.starter.displayTRY },
                    pro: { price: proTRY, display: NDIS_COMPLIANCE_TIERS.professional.displayTRY },
                    business: { price: bizTRY, display: NDIS_COMPLIANCE_TIERS.business.displayTRY },
                }
            default: // USD/EUR
                return {
                    free: { price: starterUSD, display: `${currency}${starterUSD}` },
                    pro: { price: proUSD, display: `${currency}${proUSD}` },
                    business: { price: bizUSD, display: `${currency}${bizUSD}` },
                }
        }
    }

    const monthlyPrices = getMonthlyPrices()

    // Calculate yearly price with 20% discount
    const getPrice = (planId: string) => {
        const planPrices = monthlyPrices[planId as keyof typeof monthlyPrices]
        if (!planPrices) return getCurrency() + '0'

        if (planId === 'free') return planPrices.display

        if (billingPeriod === 'yearly') {
            const yearlyMonthly = Math.round(planPrices.price * 0.8) // 20% discount
            const currency = getCurrency()
            if (locale === 'tr') {
                return `₺${yearlyMonthly.toLocaleString('tr-TR')}`
            }
            return `${currency}${yearlyMonthly}`
        }
        return planPrices.display
    }

    // Calculate total yearly cost
    const getYearlyTotal = (planId: string) => {
        const planPrices = monthlyPrices[planId as keyof typeof monthlyPrices]
        if (!planPrices || planId === 'free') return ''

        const yearlyTotal = Math.round(planPrices.price * 12 * 0.8) // 20% discount
        const currency = getCurrency()
        if (locale === 'tr') {
            return `₺${yearlyTotal.toLocaleString('tr-TR')}`
        }
        return `${currency}${yearlyTotal}`
    }

    // Calculate yearly savings
    const getYearlySavings = (planId: string) => {
        const planPrices = monthlyPrices[planId as keyof typeof monthlyPrices]
        if (!planPrices || planId === 'free') return ''

        const savings = Math.round(planPrices.price * 12 * 0.2)
        const currency = getCurrency()
        if (locale === 'tr') {
            return `₺${savings.toLocaleString('tr-TR')}`
        }
        return `${currency}${savings}`
    }

    // 3 NDIS tiers — sourced from the central pricing config.
    const plans = [
        {
            id: 'free',
            name: NDIS_COMPLIANCE_TIERS.starter.name,
            description: t('pricing.plans.free.description'),
            features: NDIS_COMPLIANCE_TIERS.starter.features as unknown as string[],
            popular: false,
            gradient: 'from-slate-500 to-slate-600',
            borderColor: 'border-slate-200',
            priceColor: 'text-slate-700',
            cta: NDIS_COMPLIANCE_TIERS.starter.cta,
        },
        {
            id: 'pro',
            name: NDIS_COMPLIANCE_TIERS.professional.name,
            description: t('pricing.plans.pro.description'),
            features: NDIS_COMPLIANCE_TIERS.professional.features as unknown as string[],
            popular: false,
            gradient: 'from-cyan-500 to-blue-600',
            borderColor: 'border-cyan-300',
            priceColor: 'text-cyan-600',
            cta: NDIS_COMPLIANCE_TIERS.professional.cta,
        },
        {
            id: 'business',
            name: NDIS_COMPLIANCE_TIERS.business.name,
            description: t('pricing.plans.business.description'),
            features: NDIS_COMPLIANCE_TIERS.business.features as unknown as string[],
            popular: true,
            gradient: 'from-teal-500 to-emerald-600',
            borderColor: 'border-teal-400 ring-2 ring-teal-100',
            priceColor: 'text-teal-600',
            cta: NDIS_COMPLIANCE_TIERS.business.cta,
        },
    ]

    const faqs = [
        { question: t('pricing.faq.q1'), answer: t('pricing.faq.a1') },
        { question: t('pricing.faq.q2'), answer: t('pricing.faq.a2') },
        { question: t('pricing.faq.q3'), answer: t('pricing.faq.a3') },
        { question: t('pricing.faq.q4'), answer: t('pricing.faq.a4') },
        { question: t('pricing.faq.q5'), answer: t('pricing.faq.a5') },
        { question: t('pricing.faq.q6'), answer: t('pricing.faq.a6') },
        { question: t('pricing.faq.q7'), answer: t('pricing.faq.a7') },
        { question: t('pricing.faq.q8'), answer: t('pricing.faq.a8') }
    ]

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index)
    }

    return (
        <>
            <PublicNav />

            <div className="min-h-screen bg-white">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            {t('pricing.title')}
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            {t('pricing.subtitle')}
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center space-x-4 mb-8">
                            <button
                                onClick={() => setBillingPeriod('monthly')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${billingPeriod === 'monthly'
                                    ? 'bg-white text-blue-600'
                                    : 'bg-blue-500/30 text-blue-100 hover:bg-blue-500/40'
                                    }`}
                            >
                                {t('pricing.monthly')}
                            </button>
                            <button
                                onClick={() => setBillingPeriod('yearly')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${billingPeriod === 'yearly'
                                    ? 'bg-white text-blue-600'
                                    : 'bg-blue-500/30 text-blue-100 hover:bg-blue-500/40'
                                    }`}
                            >
                                <span>{t('pricing.yearly')}</span>
                                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                                    {t('pricing.save')}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pricing Plans */}
                <div className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`relative bg-white border-2 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.borderColor} ${plan.popular ? 'pt-10' : ''}`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                            <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg whitespace-nowrap">
                                                <Star className="h-3 w-3" />
                                                <span>{t('pricing.mostPopular')}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {plan.name}
                                        </h3>
                                        <div className={`text-4xl font-bold ${plan.priceColor} mb-2`}>
                                            {getPrice(plan.id)}
                                            {plan.id !== 'free' && (
                                                <span className="text-lg text-gray-400 font-normal">{t('pricing.perMonth')}</span>
                                            )}
                                        </div>
                                        {billingPeriod === 'yearly' && plan.id !== 'free' && (
                                            <div className="space-y-1">
                                                <p className="text-base text-gray-600">
                                                    {locale === 'tr' ? 'Yıllık Toplam:' : 'Yearly Total:'} <span className="font-semibold">{getYearlyTotal(plan.id)}</span>
                                                </p>
                                                <p className="text-sm text-green-600 font-medium">
                                                    ✨ {locale === 'tr' ? 'Tasarruf:' : 'You save:'} {getYearlySavings(plan.id)}
                                                </p>
                                            </div>
                                        )}
                                        <p className="text-gray-500 mt-2">{plan.description}</p>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center space-x-3">
                                                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                    <Check className="h-3 w-3 text-green-600" />
                                                </div>
                                                <span className="text-gray-600 text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={`/${locale}/auth/register`}
                                        className={`w-full block text-center py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${plan.id === 'free'
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                            : `bg-gradient-to-r ${plan.gradient} text-white shadow-lg hover:shadow-xl hover:scale-[1.02]`
                                            }`}
                                    >
                                        {plan.cta}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* NDIS Feature Comparison Table */}
                <div className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                            Plan Comparison
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full max-w-3xl mx-auto border-collapse bg-white rounded-xl shadow-lg">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                                        <th className="text-center p-4 font-semibold text-gray-900">Starter — $0</th>
                                        <th className="text-center p-4 font-semibold text-cyan-600">Professional — $99/mo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-gray-700">Compliance Audits</td>
                                        <td className="text-center p-4">3 / month</td>
                                        <td className="text-center p-4 bg-cyan-50/50 font-semibold text-cyan-700">Unlimited</td>
                                    </tr>
                                    <tr className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-gray-700">PDF Reports</td>
                                        <td className="text-center p-4">Watermarked</td>
                                        <td className="text-center p-4 bg-cyan-50/50 font-semibold text-cyan-700">White-label (no watermark)</td>
                                    </tr>
                                    <tr className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-gray-700">File Formats</td>
                                        <td className="text-center p-4">PDF &amp; DOCX</td>
                                        <td className="text-center p-4 bg-cyan-50/50">PDF &amp; DOCX</td>
                                    </tr>
                                    <tr className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-gray-700">Bulk Processing</td>
                                        <td className="text-center p-4">❌</td>
                                        <td className="text-center p-4 bg-cyan-50/50">✅</td>
                                    </tr>
                                    <tr className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-gray-700">Custom Branding &amp; Logo</td>
                                        <td className="text-center p-4">❌</td>
                                        <td className="text-center p-4 bg-cyan-50/50">✅</td>
                                    </tr>
                                    <tr className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-gray-700">NDIS 2025/26 Clause Library</td>
                                        <td className="text-center p-4">Basic</td>
                                        <td className="text-center p-4 bg-cyan-50/50">Full</td>
                                    </tr>
                                    <tr className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-gray-700">Audit Vault &amp; History</td>
                                        <td className="text-center p-4">❌</td>
                                        <td className="text-center p-4 bg-cyan-50/50">✅</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="p-4 text-gray-700">Support</td>
                                        <td className="text-center p-4">Email</td>
                                        <td className="text-center p-4 bg-cyan-50/50">Priority</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Competitor Comparison */}
                <div className="py-20 bg-slate-900 text-white">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
                                    How We&rsquo;re Different
                                </span>
                                <h2 className="text-3xl font-bold mb-4">
                                    NDIS Shield Hub vs. Lumary &amp; ShiftCare
                                </h2>
                                <p className="text-slate-400 max-w-2xl mx-auto">
                                    Lumary and ShiftCare are excellent rostering and shift-management platforms.
                                    NDIS Shield Hub solves a completely different problem: <strong className="text-white">protecting your NDIS compliance</strong> through AI-driven document auditing.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Lumary */}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-slate-300 font-bold text-sm">L</div>
                                        <span className="font-semibold text-slate-300">Lumary</span>
                                    </div>
                                    <ul className="space-y-3 text-sm text-slate-400">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                            Shift scheduling &amp; rostering
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                            NDIS claiming &amp; plan management
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                            Does not audit service agreement documents
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                            No AI-generated compliance addendums
                                        </li>
                                    </ul>
                                </div>

                                {/* ShiftCare */}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-slate-300 font-bold text-sm">S</div>
                                        <span className="font-semibold text-slate-300">ShiftCare</span>
                                    </div>
                                    <ul className="space-y-3 text-sm text-slate-400">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                            Staff scheduling &amp; time-tracking
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                            Client management &amp; progress notes
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                            No document compliance scoring
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                            No automated gap-detection for agreements
                                        </li>
                                    </ul>
                                </div>

                                {/* NDIS Shield Hub */}
                                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6 relative">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                        That&rsquo;s us
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-sm">P</div>
                                        <span className="font-semibold text-white">NDIS Shield Hub</span>
                                    </div>
                                    <ul className="space-y-3 text-sm text-slate-300">
                                        <li className="flex items-start gap-2">
                                            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                            AI-driven NDIS service agreement auditing
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                            Auto-generated compliance addendums
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                            Detects missing ABN, cancellation clauses &amp; consent gaps
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                            White-label PDF export for your brand
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <p className="text-center text-slate-500 text-sm mt-10">
                                We don&rsquo;t manage your shifts — we protect your compliance.
                                <Link href={`/${locale}/dashboard/validator`} className="text-cyan-400 hover:text-cyan-300 ml-1 underline underline-offset-2">
                                    Try a free audit →
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section - Accordion Style */}
                <div className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    {t('pricing.faq.title')}
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleFaq(index)}
                                            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="text-lg font-semibold text-gray-900 pr-4">
                                                {faq.question}
                                            </span>
                                            {openFaqIndex === index ? (
                                                <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                            )}
                                        </button>
                                        <div
                                            className={`transition-all duration-300 ease-in-out ${openFaqIndex === index
                                                ? 'max-h-96 opacity-100'
                                                : 'max-h-0 opacity-0 overflow-hidden'
                                                }`}
                                        >
                                            <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="container mx-auto px-4 text-center">
                        <div className="max-w-3xl mx-auto">
                            <MessageSquare className="h-16 w-16 text-blue-200 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold mb-6">
                                {t('about.getStarted')}
                            </h2>
                            <p className="text-xl text-blue-100 mb-8">
                                {t('about.getStartedDesc')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href={`/${locale}/auth/register`}
                                    className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                                >
                                    <span>{t('about.startFree')}</span>
                                    <ArrowRight className="h-5 w-5" />
                                </Link>

                                <Link
                                    href={`/${locale}/contact`}
                                    className="inline-flex items-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                                >
                                    <span>{t('about.contactButton')}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer locale={locale} />
        </>
    )
}