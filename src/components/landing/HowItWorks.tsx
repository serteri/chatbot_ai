'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, Activity, FileCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function HowItWorks() {
    const t = useTranslations('ndisLanding.howItWorks')

    const steps = [
        {
            icon: UploadCloud,
            title: t('step1Title'),
            desc: t('step1Desc'),
            color: 'teal'
        },
        {
            icon: Activity,
            title: t('step2Title'),
            desc: t('step2Desc'),
            color: 'emerald'
        },
        {
            icon: FileCheck,
            title: t('step3Title'),
            desc: t('step3Desc'),
            color: 'blue'
        }
    ]

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl sm:text-4xl font-bold text-slate-900"
                    >
                        {t('title')}
                    </motion.h2>
                </div>

                <div className="relative">
                    {/* Connecting line for desktop */}
                    <div className="hidden md:block absolute top-12 left-24 right-24 h-0.5 bg-slate-100" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {steps.map((step, index) => {
                            const Icon = step.icon
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                    className="relative flex flex-col items-center text-center group"
                                >
                                    {/* Icon Container with subtle animation */}
                                    <div className={`w-24 h-24 rounded-2xl bg-${step.color}-50 border border-${step.color}-100 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300 relative bg-white z-10`}>
                                        <Icon className={`w-10 h-10 text-${step.color}-600`} />
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">
                                        {step.desc}
                                    </p>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
