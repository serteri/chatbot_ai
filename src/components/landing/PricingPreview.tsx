'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Free Tier */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('free')}</h3>
                        <p className="text-slate-500 mb-6 pb-6 border-b border-slate-100">{t('freeDesc')}</p>
                        <div className="text-5xl font-extrabold text-slate-900 mb-8">{t('freePrice')}</div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-slate-700">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span>{t('freeFeature1')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-700">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span>{t('freeFeature2')}</span>
                            </li>
                        </ul>

                        <Link href={`/${locale}/dashboard/validator`} className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors flex items-center justify-center">
                            {t('cta')}
                        </Link>
                    </motion.div>

                    {/* Pro Tier */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden"
                    >
                        {/* Soft glow background */}
                        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-32 h-32 bg-teal-500/20 rounded-full blur-[40px] pointer-events-none" />

                        <h3 className="text-2xl font-bold text-white mb-2">{t('pro')}</h3>
                        <p className="text-slate-400 mb-6 pb-6 border-b border-slate-800">{t('proDesc')}</p>
                        <div className="text-5xl font-extrabold text-white mb-8">{t('proPrice')}</div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-teal-400 shrink-0" />
                                <span>{t('proFeature1')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-teal-400 shrink-0" />
                                <span>{t('proFeature2')}</span>
                            </li>
                        </ul>

                        <Link href={`/${locale}/dashboard/validator`} className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 group">
                            {t('cta')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
