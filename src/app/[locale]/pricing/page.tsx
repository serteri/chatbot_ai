'use client'

import { useTranslations } from 'next-intl'
import { PublicNav } from '@/components/layout/PublicNav'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    Check,
    Star,
    MessageSquare,
    GraduationCap,
    ShoppingCart,
    ArrowRight,
    HelpCircle
} from 'lucide-react'

export default function PricingPage() {
    const t = useTranslations()
    const params = useParams()
    const locale = params.locale as string

    const plans = [
        {
            id: 'free',
            name: t('pricing.plans.free.name'),
            price: t('pricing.plans.free.price'),
            description: t('pricing.plans.free.description'),
            features: [
                t('pricing.plans.free.features.0'),
                t('pricing.plans.free.features.1'),
                t('pricing.plans.free.features.2'),
                t('pricing.plans.free.features.3')
            ],
            popular: false,
            cta: t('pricing.getStarted')
        },
        {
            id: 'pro',
            name: t('pricing.plans.pro.name'),
            price: t('pricing.plans.pro.price'),
            description: t('pricing.plans.pro.description'),
            features: [
                t('pricing.plans.pro.features.0'),
                t('pricing.plans.pro.features.1'),
                t('pricing.plans.pro.features.2'),
                t('pricing.plans.pro.features.3'),
                t('pricing.plans.pro.features.4'),
                t('pricing.plans.pro.features.5')
            ],
            popular: true,
            cta: t('pricing.choosePlan')
        },
        {
            id: 'business',
            name: t('pricing.plans.business.name'),
            price: t('pricing.plans.business.price'),
            description: t('pricing.plans.business.description'),
            features: [
                t('pricing.plans.business.features.0'),
                t('pricing.plans.business.features.1'),
                t('pricing.plans.business.features.2'),
                t('pricing.plans.business.features.3'),
                t('pricing.plans.business.features.4'),
                t('pricing.plans.business.features.5'),
                t('pricing.plans.business.features.6')
            ],
            popular: false,
            cta: t('pricing.choosePlan')
        },
        {
            id: 'enterprise',
            name: t('pricing.plans.enterprise.name'),
            price: t('pricing.plans.enterprise.price'),
            description: t('pricing.plans.enterprise.description'),
            features: [
                t('pricing.plans.enterprise.features.0'),
                t('pricing.plans.enterprise.features.1'),
                t('pricing.plans.enterprise.features.2'),
                t('pricing.plans.enterprise.features.3'),
                t('pricing.plans.enterprise.features.4'),
                t('pricing.plans.enterprise.features.5')
            ],
            popular: false,
            cta: t('pricing.getStarted')
        }
    ]

    const faqs = [
        {
            question: t('pricing.faq.q1'),
            answer: t('pricing.faq.a1')
        },
        {
            question: t('pricing.faq.q2'),
            answer: t('pricing.faq.a2')
        },
        {
            question: t('pricing.faq.q3'),
            answer: t('pricing.faq.a3')
        },
        {
            question: t('pricing.faq.q4'),
            answer: t('pricing.faq.a4')
        }
    ]

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
                            <span className="text-blue-100">{t('pricing.monthly')}</span>
                            <div className="bg-blue-500/30 p-1 rounded-lg">
                                <div className="bg-white text-blue-600 px-4 py-2 rounded text-sm font-medium">
                                    {t('pricing.yearly')} - {t('pricing.save')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chatbot Types */}
                <div className="py-12 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {t('pricing.chatbotTypes')}
                            </h2>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <div className="flex items-center space-x-3">
                                    <GraduationCap className="h-6 w-6 text-blue-600" />
                                    <span className="text-gray-700">{t('pricing.education')}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <ShoppingCart className="h-6 w-6 text-green-600" />
                                    <span className="text-gray-700">{t('pricing.ecommerce')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Plans */}
                <div className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`relative bg-white border rounded-2xl shadow-lg p-8 ${plan.popular ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                            <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                                                <Star className="h-4 w-4" />
                                                <span>{t('pricing.mostPopular')}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {plan.name}
                                        </h3>
                                        <div className="text-4xl font-bold text-blue-600 mb-2">
                                            {plan.price}
                                            {plan.id !== 'free' && (
                                                <span className="text-lg text-gray-500">/ay</span>
                                            )}
                                        </div>
                                        <p className="text-gray-600">{plan.description}</p>
                                    </div>

                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center space-x-3">
                                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={`/${locale}/auth/register`}
                                        className={`w-full block text-center py-3 px-6 rounded-lg font-semibold transition-colors ${plan.popular
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                            }`}
                                    >
                                        {plan.cta}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    {t('pricing.faq.title')}
                                </h2>
                            </div>

                            <div className="space-y-6">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                                        <div className="flex items-start space-x-4">
                                            <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {faq.question}
                                                </h3>
                                                <p className="text-gray-600 leading-relaxed">
                                                    {faq.answer}
                                                </p>
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
        </>
    )
}