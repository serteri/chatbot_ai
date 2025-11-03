'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { PublicNav } from '@/components/layout/PublicNav'
import { Button } from '@/components/ui/button'
import { ArrowRight, Bot, FileText, BarChart3, Zap } from 'lucide-react'

export default function HomePage() {
    const t = useTranslations()

    return (
        <div className="flex min-h-screen flex-col">
            <PublicNav />

            {/* Hero Section */}
            <main className="flex-1">
                <section className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
                        {t('home.hero.title')}
                        <span className="block text-blue-600">{t('home.hero.titleHighlight')}</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
                        {t('home.hero.subtitle')}
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <Link href="/register">
                            <Button size="lg" className="text-lg">
                                {t('home.hero.cta')} <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="text-lg">
                                {t('home.hero.login')}
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Features */}
                <section className="bg-gray-50 py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-center text-3xl font-bold">{t('home.features.title')}</h2>
                        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border bg-white p-6">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                    <Bot className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold">{t('home.features.easySetup.title')}</h3>
                                <p className="mt-2 text-gray-600">
                                    {t('home.features.easySetup.description')}
                                </p>
                            </div>

                            <div className="rounded-lg border bg-white p-6">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                    <FileText className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold">{t('home.features.smartLearning.title')}</h3>
                                <p className="mt-2 text-gray-600">
                                    {t('home.features.smartLearning.description')}
                                </p>
                            </div>

                            <div className="rounded-lg border bg-white p-6">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                    <BarChart3 className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold">{t('home.features.analytics.title')}</h3>
                                <p className="mt-2 text-gray-600">
                                    {t('home.features.analytics.description')}
                                </p>
                            </div>

                            <div className="rounded-lg border bg-white p-6">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                                    <Zap className="h-6 w-6 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-semibold">{t('home.features.integration.title')}</h3>
                                <p className="mt-2 text-gray-600">
                                    {t('home.features.integration.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-4xl font-bold">{t('home.cta.title')}</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
                            {t('home.cta.subtitle')}
                        </p>
                        <div className="mt-8">
                            <Link href="/register">
                                <Button size="lg" className="text-lg">
                                    {t('home.cta.button')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t py-8">
                <div className="container mx-auto px-4 text-center text-sm text-gray-600">
                    {t('home.footer')}
                </div>
            </footer>
        </div>
    )
}