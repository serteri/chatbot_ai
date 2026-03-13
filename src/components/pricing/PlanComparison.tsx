'use client'

import { Check, X } from 'lucide-react'

// ─── Shield Blue = blue-600 (#2563eb) ───────────────────────────────────────

type CellValue = string | boolean

interface ComparisonRow {
    feature: string
    starter: CellValue
    professional: CellValue
    business: CellValue
}

const ROWS: ComparisonRow[] = [
    {
        feature: 'Monthly Claims Limit',
        starter: '5 Claims',
        professional: 'Unlimited',
        business: 'Unlimited',
    },
    {
        feature: 'Data Import',
        starter: 'Manual / Basic CSV',
        professional: 'Bulk Excel / CSV',
        business: 'AI-Powered Docx & PDF Extraction',
    },
    {
        feature: 'PRODA Integration',
        starter: false,
        professional: '✓ Bulk Export',
        business: '✓ Priority Export Sync',
    },
    {
        feature: 'Accounting Sync',
        starter: false,
        professional: false,
        business: '✓ Xero & QuickBooks Suite',
    },
    {
        feature: 'Audit Readiness',
        starter: 'Basic',
        professional: 'Full History',
        business: 'Enterprise Evidence Vault',
    },
    {
        feature: 'Price Guide Sync',
        starter: 'Basic',
        professional: 'Real-time Full Sync',
        business: 'AI-Powered Smart Mapping',
    },
    {
        feature: 'Support',
        starter: 'Email',
        professional: 'Priority',
        business: 'Dedicated Account Manager',
    },
]

function Cell({ value, col }: { value: CellValue; col: 'starter' | 'professional' | 'business' }) {
    const isBiz = col === 'business'
    const base = `p-4 text-center align-middle${isBiz ? ' bg-teal-50/70' : ''}`

    if (value === false) {
        return (
            <td className={base}>
                <X className="w-4 h-4 text-slate-300 mx-auto" />
            </td>
        )
    }

    if (value === true) {
        return (
            <td className={base}>
                <Check className="w-4 h-4 text-blue-600 mx-auto" strokeWidth={2.5} />
            </td>
        )
    }

    const startsWithCheck = typeof value === 'string' && value.startsWith('✓')
    const text = startsWithCheck ? (value as string).slice(2) : (value as string)

    return (
        <td className={`${base} text-sm${isBiz ? ' font-medium text-teal-800' : ' text-slate-600'}`}>
            {startsWithCheck ? (
                <span className="inline-flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" strokeWidth={2.5} />
                    {text}
                </span>
            ) : (
                value as string
            )}
        </td>
    )
}

export function PlanComparison({ locale }: { locale: string }) {
    return (
        <div className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
                    Plan Comparison
                </h2>
                <p className="text-center text-slate-500 mb-12 max-w-xl mx-auto text-sm">
                    Pick the plan that matches your NDIS compliance workload.
                </p>

                {/* Responsive: scroll on mobile, full table on desktop */}
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-[640px] px-4 sm:px-0 max-w-5xl mx-auto">
                        <table className="w-full border-collapse rounded-2xl shadow-lg overflow-hidden bg-white">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    {/* Feature label column */}
                                    <th className="text-left p-5 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider w-44">
                                        Feature
                                    </th>

                                    {/* Starter */}
                                    <th className="text-center px-5 py-4 bg-slate-50 w-44">
                                        <div className="font-bold text-slate-800 text-base">Starter</div>
                                        <div className="text-slate-400 text-sm font-normal mt-0.5">$0 AUD / mo</div>
                                    </th>

                                    {/* Professional */}
                                    <th className="text-center px-5 py-4 bg-slate-50 w-44">
                                        <div className="font-bold text-slate-800 text-base">Professional</div>
                                        <div className="text-slate-400 text-sm font-normal mt-0.5">$99 AUD / mo</div>
                                    </th>

                                    {/* Business — highlighted */}
                                    <th className="text-center px-5 py-4 bg-teal-600 w-52">
                                        <span className="inline-block bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                                            Most Popular
                                        </span>
                                        <div className="font-bold text-white text-base">Business</div>
                                        <div className="text-teal-200 text-sm font-normal mt-0.5">$299 AUD / mo</div>
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {ROWS.map((row, i) => (
                                    <tr
                                        key={row.feature}
                                        className={`border-b border-slate-100 transition-colors hover:bg-slate-50/60${i % 2 !== 0 ? ' bg-slate-50/30' : ''}`}
                                    >
                                        <td className="p-4 text-sm font-medium text-slate-700">
                                            {row.feature}
                                        </td>
                                        <Cell value={row.starter} col="starter" />
                                        <Cell value={row.professional} col="professional" />
                                        <Cell value={row.business} col="business" />
                                    </tr>
                                ))}

                                {/* CTA row */}
                                <tr>
                                    <td className="p-4" />
                                    <td className="p-5 text-center">
                                        <a
                                            href={`/${locale}/auth/register`}
                                            className="inline-block px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                                        >
                                            Get Started Free
                                        </a>
                                    </td>
                                    <td className="p-5 text-center">
                                        <a
                                            href={`/${locale}/auth/register`}
                                            className="inline-block px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors shadow"
                                        >
                                            Start Professional
                                        </a>
                                    </td>
                                    <td className="p-5 text-center bg-teal-50/70">
                                        <a
                                            href={`/${locale}/auth/register`}
                                            className="inline-block px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-colors shadow"
                                        >
                                            Go Enterprise
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <p className="text-center text-slate-400 text-xs mt-6">
                    * All prices are in Australian Dollars (AUD) and inclusive of GST where applicable.
                </p>
            </div>
        </div>
    )
}
