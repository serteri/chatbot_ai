'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { NDIS_COMPLIANCE_TIERS } from '@/config/pricing'

export function PricingPreview({ locale }: { locale: string }) {
    const t = useTranslations('ndisLanding.pricing')

    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
                    >
                        {t('title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg text-slate-600 max-w-2xl mx-auto"
                    >
                        {t('subtitle')}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Starter Tier */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow flex flex-col"
                    >
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{NDIS_COMPLIANCE_TIERS.starter.name}</h3>
                        <p className="text-slate-500 mb-6 pb-6 border-b border-slate-100 text-sm">{t('freeDesc')}</p>
                        <div className="text-4xl font-extrabold text-slate-900 mb-8">
                            {NDIS_COMPLIANCE_TIERS.starter.displayUSD}
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {NDIS_COMPLIANCE_TIERS.starter.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 text-sm">
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href={`/${locale}/dashboard/validator`} className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors flex items-center justify-center">
                            {NDIS_COMPLIANCE_TIERS.starter.cta}
                        </Link>
                    </motion.div>

                    {/* Pro Tier */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow flex flex-col"
                    >
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{NDIS_COMPLIANCE_TIERS.professional.name}</h3>
                        <p className="text-slate-500 mb-6 pb-6 border-b border-slate-100 text-sm">{t('proDesc')}</p>
                        <div className="text-4xl font-extrabold text-slate-900 mb-8">
                            {NDIS_COMPLIANCE_TIERS.professional.displayUSD}
                            <span className="text-lg font-normal text-slate-400">/mo</span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {NDIS_COMPLIANCE_TIERS.professional.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 text-sm">
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href={`/${locale}/dashboard/validator`} className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors flex items-center justify-center">
                            {NDIS_COMPLIANCE_TIERS.professional.cta}
                        </Link>
                    </motion.div>

                    {/* Business Tier */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col ring-4 ring-teal-500/30"
                    >
                        {/* Highlights */}
                        <div className="absolute top-4 right-4">
                            <span className="bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {t('bestValueBadge') || 'Best Value for Agencies'}
                            </span>
                        </div>
                        
                        {/* Soft glow background */}
                        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-32 h-32 bg-teal-500/20 rounded-full blur-[40px] pointer-events-none" />

                        <h3 className="text-xl font-bold text-white mb-2">{NDIS_COMPLIANCE_TIERS.business.name}</h3>
                        <p className="text-slate-400 mb-6 pb-6 border-b border-slate-800 text-sm">{t('bizDesc')}</p>
                        <div className="text-4xl font-extrabold text-white mb-8">
                            {NDIS_COMPLIANCE_TIERS.business.displayUSD}
                            <span className="text-lg font-normal text-slate-400">/mo</span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {NDIS_COMPLIANCE_TIERS.business.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href={`/${locale}/dashboard/validator`} className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 group">
                            {NDIS_COMPLIANCE_TIERS.business.cta}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
