'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PlanCardProps {
    currentPlan: string
}

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        description: 'Başlamak için ideal',
        features: [
            '1 Chatbot',
            '3 Doküman',
            '50 Konuşma/ay',
            'Email destek'
        ],
        priceId: null
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$29',
        description: 'Küçük işletmeler için',
        features: [
            '5 Chatbot',
            '50 Doküman',
            '1,000 Konuşma/ay',
            'Öncelikli destek',
            'Özel branding',
            'Analytics'
        ],
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '$99',
        description: 'Büyük şirketler için',
        features: [
            'Sınırsız Chatbot',
            'Sınırsız Doküman',
            'Sınırsız Konuşma',
            '7/24 Destek',
            'Özel domain',
            'API erişimi',
            'Takım yönetimi'
        ],
        priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID
    }
]

export function PricingCards({ currentPlan }: PlanCardProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    const handleUpgrade = async (priceId: string | null | undefined, planType: string) => {
        if (!priceId) return

        setLoading(planType)

        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId, planType })
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error('Checkout URL alınamadı')
            }
        } catch (error) {
            console.error('Upgrade error:', error)
            alert('Bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setLoading(null)
        }
    }

    const handleManageSubscription = async () => {
        setLoading('manage')

        try {
            const response = await fetch('/api/stripe/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            console.error('Portal error:', error)
            alert('Bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => {
                const isCurrent = currentPlan === plan.id
                const isDowngrade =
                    (currentPlan === 'enterprise' && ['pro', 'free'].includes(plan.id)) ||
                    (currentPlan === 'pro' && plan.id === 'free')

                return (
                    <Card key={plan.id} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
                        {plan.popular && (
                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
                                En Popüler
                            </Badge>
                        )}

                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                {plan.name}
                                {isCurrent && (
                                    <Badge variant="secondary">Mevcut Plan</Badge>
                                )}
                            </CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-gray-600">/ay</span>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <ul className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter>
                            {isCurrent ? (
                                currentPlan !== 'free' ? (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleManageSubscription}
                                        disabled={loading === 'manage'}
                                    >
                                        {loading === 'manage' ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : null}
                                        Aboneliği Yönet
                                    </Button>
                                ) : (
                                    <Button variant="outline" className="w-full" disabled>
                                        Mevcut Plan
                                    </Button>
                                )
                            ) : isDowngrade ? (
                                <Button variant="ghost" className="w-full" disabled>
                                    Düşürme Mevcut Değil
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    onClick={() => handleUpgrade(plan.priceId, plan.id)}
                                    disabled={loading === plan.id || !plan.priceId}
                                >
                                    {loading === plan.id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Zap className="mr-2 h-4 w-4" />
                                    )}
                                    {plan.id === 'free' ? 'Ücretsiz Başla' : 'Yükselt'}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    )
}