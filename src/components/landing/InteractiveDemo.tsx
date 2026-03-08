'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckCircle2, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { DemoUploadWidget } from './DemoUploadWidget'

export function InteractiveDemo() {
    const t = useTranslations('ndisLanding.interactive')

    return (
        <section className="py-24 bg-slate-50 overflow-hidden relative">
            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">

                    {/* Before State (Functional Widget) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="w-full max-w-md"
                    >
                        <div className="mb-4 text-center text-sm font-semibold text-slate-500 uppercase tracking-widest">
                            {t('before')}
                        </div>
                        <DemoUploadWidget />
                    </motion.div>

                    {/* Arrow / Transition */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="hidden lg:flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg border border-slate-100 shrink-0 z-10"
                    >
                        <ArrowRight className="w-6 h-6 text-cyan-500" />
                    </motion.div>

                    {/* After State (Branded Addendum) */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full max-w-md"
                    >
                        <div className="mb-4 text-center text-sm font-bold text-cyan-600 uppercase tracking-widest">
                            {t('after')}
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl shadow-cyan-900/5 border border-cyan-100 p-8 pt-10 aspect-[3/4] relative overflow-hidden group">
                            {/* Decorative Edge */}
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-400 to-blue-500" />

                            {/* Mock Logo injected */}
                            <div className="flex justify-end mb-8">
                                <div className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white font-bold rounded-lg text-xs tracking-tighter shadow-sm transform group-hover:scale-105 transition-transform">
                                    {t('logoMock')}
                                </div>
                            </div>

                            <div className="text-xl font-bold text-slate-900 mb-2">NDIS Service Agreement Addendum</div>
                            <div className="text-xs text-slate-500 mb-10 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Custom Generated Compliance Clause
                            </div>

                            {/* Active Checklists */}
                            <div className="space-y-5">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-start gap-3 p-3 bg-cyan-50/50 rounded-xl"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium text-slate-700">{t('checklist1')}</span>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.7 }}
                                    className="flex items-start gap-3 p-3 bg-cyan-50/50 rounded-xl"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium text-slate-700">{t('checklist2')}</span>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.9 }}
                                    className="flex items-start gap-3 p-3 bg-cyan-50/50 rounded-xl"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium text-slate-700">{t('checklist3')}</span>
                                </motion.div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
