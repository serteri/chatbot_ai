'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Shield, Cloud } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function TrustBar() {
    const t = useTranslations('ndisLanding.trustBar')

    const items = [
        { icon: MapPin, text: t('sydney') },
        { icon: Shield, text: t('privacy') },
        { icon: Cloud, text: t('azure') },
    ]

    return (
        <div className="bg-slate-900 border-y border-slate-800 py-6 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="sr-only">Trust and Compliance</h2>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                    {items.map((item, index) => {
                        const Icon = item.icon
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                className="flex items-center gap-3 text-slate-400"
                            >
                                <Icon className="w-5 h-5 text-slate-500" />
                                <span className="text-sm font-medium tracking-wide">{item.text}</span>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
