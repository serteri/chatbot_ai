'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Clock, FileText, CheckCircle } from 'lucide-react'

interface Stats {
    totalVerifiedAmount: number
    totalDraftAmount:    number
    totalClaimsCount:    number
    readyForExport:      number
}

// Staggered pop-in — each card springs in 80 ms after the previous one
const cardVariants = {
    hidden:  { opacity: 0, y: 24, scale: 0.96 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.08,
            type: 'spring' as const,
            stiffness: 280,
            damping: 22,
        },
    }),
}

function formatAUD(n: number) {
    return n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const CARDS = [
    {
        label:      'Total Verified',
        sub:        'Verified claims value',
        icon:       DollarSign,
        format:     (s: Stats) => `$${formatAUD(s.totalVerifiedAmount)}`,
        iconBg:     'bg-green-100',
        iconColor:  'text-green-600',
        valueColor: 'text-green-700',
        glow:       'shadow-green-500/20 hover:shadow-green-500/35',
        ring:       'ring-green-100',
        dot:        'bg-green-400',
    },
    {
        label:      'Pending Drafts',
        sub:        'Awaiting verification',
        icon:       Clock,
        format:     (s: Stats) => `$${formatAUD(s.totalDraftAmount)}`,
        iconBg:     'bg-amber-100',
        iconColor:  'text-amber-600',
        valueColor: 'text-amber-700',
        glow:       'shadow-amber-500/20 hover:shadow-amber-500/35',
        ring:       'ring-amber-100',
        dot:        'bg-amber-400',
    },
    {
        label:      'Claims Processed',
        sub:        'All time in ledger',
        icon:       FileText,
        format:     (s: Stats) => s.totalClaimsCount.toLocaleString('en-AU'),
        iconBg:     'bg-blue-100',
        iconColor:  'text-blue-600',
        valueColor: 'text-blue-700',
        glow:       'shadow-blue-500/20 hover:shadow-blue-500/35',
        ring:       'ring-blue-100',
        dot:        'bg-blue-400',
    },
    {
        label:      'Ready for PRODA',
        sub:        'Verified — export ready',
        icon:       CheckCircle,
        format:     (s: Stats) => s.readyForExport.toLocaleString('en-AU'),
        iconBg:     'bg-violet-100',
        iconColor:  'text-violet-600',
        valueColor: 'text-violet-700',
        glow:       'shadow-violet-500/20 hover:shadow-violet-500/35',
        ring:       'ring-violet-100',
        dot:        'bg-violet-400',
    },
] as const

export default function StatsCards() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/dashboard/stats')
            .then(r => r.json())
            .then((data: Stats) => setStats(data))
            .catch(() => {/* non-critical — cards simply stay in skeleton state */})
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {CARDS.map((card, i) => {
                const Icon = card.icon
                const value = !loading && stats ? card.format(stats) : null

                return (
                    <motion.div
                        key={card.label}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className={[
                            'relative bg-white rounded-2xl p-6 border border-slate-100',
                            'shadow-lg transition-shadow duration-300',
                            card.glow,
                            'ring-1',
                            card.ring,
                            'overflow-hidden',
                        ].join(' ')}
                    >
                        {/* Subtle top-edge colour accent */}
                        <div className={`absolute top-0 left-0 right-0 h-0.5 ${card.dot} opacity-60`} />

                        {/* Icon */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${card.iconBg}`}>
                            <Icon className={`w-5 h-5 ${card.iconColor}`} />
                        </div>

                        {/* Label */}
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            {card.label}
                        </p>

                        {/* Value */}
                        {loading ? (
                            <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse mt-1 mb-2" />
                        ) : (
                            <p className={`text-2xl font-black tabular-nums leading-none mt-1 mb-1 ${card.valueColor}`}>
                                {value}
                            </p>
                        )}

                        {/* Subtitle */}
                        <p className="text-xs text-slate-400">{card.sub}</p>
                    </motion.div>
                )
            })}
        </div>
    )
}
