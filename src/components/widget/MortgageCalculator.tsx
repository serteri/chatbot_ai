'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator, Percent, Calendar, DollarSign, Home, PiggyBank } from 'lucide-react'

interface MortgageCalculatorProps {
    locale?: string
    propertyPrice?: number
    onCalculate?: (result: MortgageResult) => void
}

interface MortgageResult {
    monthlyPayment: number
    totalPayment: number
    totalInterest: number
    loanAmount: number
    downPayment: number
}

// Default interest rates by country/locale
const DEFAULT_RATES = {
    tr: 2.89, // Turkey monthly rate (approx 35% annual)
    en: 0.54, // Australia/US monthly rate (approx 6.5% annual)
    de: 0.33, // Germany monthly rate (approx 4% annual)
    fr: 0.35, // France monthly rate (approx 4.2% annual)
    es: 0.38  // Spain monthly rate (approx 4.5% annual)
}

// Currency symbols by locale
const CURRENCIES = {
    tr: { symbol: '₺', name: 'TL' },
    en: { symbol: '$', name: 'AUD' },
    de: { symbol: '€', name: 'EUR' },
    fr: { symbol: '€', name: 'EUR' },
    es: { symbol: '€', name: 'EUR' }
}

export function MortgageCalculator({
    locale = 'tr',
    propertyPrice = 5000000,
    onCalculate
}: MortgageCalculatorProps) {
    const t = useTranslations('mortgage')

    // Get default rate for locale
    const defaultRate = DEFAULT_RATES[locale as keyof typeof DEFAULT_RATES] || DEFAULT_RATES.tr
    const currency = CURRENCIES[locale as keyof typeof CURRENCIES] || CURRENCIES.tr

    // State
    const [price, setPrice] = useState(propertyPrice)
    const [downPaymentPercent, setDownPaymentPercent] = useState(20) // 20% default
    const [interestRate, setInterestRate] = useState(defaultRate) // Monthly rate
    const [loanTermYears, setLoanTermYears] = useState(20) // 20 years default

    // Calculate mortgage
    const result = useMemo(() => {
        const downPayment = price * (downPaymentPercent / 100)
        const loanAmount = price - downPayment
        const monthlyRate = interestRate / 100 // Convert percent to decimal
        const numberOfPayments = loanTermYears * 12

        // Monthly payment formula: M = P * (r(1+r)^n) / ((1+r)^n - 1)
        let monthlyPayment = 0
        if (monthlyRate > 0) {
            const factor = Math.pow(1 + monthlyRate, numberOfPayments)
            monthlyPayment = loanAmount * (monthlyRate * factor) / (factor - 1)
        } else {
            monthlyPayment = loanAmount / numberOfPayments
        }

        const totalPayment = monthlyPayment * numberOfPayments
        const totalInterest = totalPayment - loanAmount

        const calculatedResult: MortgageResult = {
            monthlyPayment: Math.round(monthlyPayment),
            totalPayment: Math.round(totalPayment),
            totalInterest: Math.round(totalInterest),
            loanAmount: Math.round(loanAmount),
            downPayment: Math.round(downPayment)
        }

        onCalculate?.(calculatedResult)
        return calculatedResult
    }, [price, downPaymentPercent, interestRate, loanTermYears, onCalculate])

    // Format price display
    const formatPrice = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`
        }
        return value.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US')
    }

    // Price range based on locale
    const maxPrice = locale === 'tr' ? 50000000 : 5000000
    const minPrice = locale === 'tr' ? 500000 : 100000
    const priceStep = locale === 'tr' ? 100000 : 10000

    return (
        <Card className="w-full max-w-md shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-5">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="h-5 w-5" />
                    {t('title')}
                </CardTitle>
                <p className="text-emerald-100 text-sm mt-1">{t('subtitle')}</p>
            </CardHeader>

            <CardContent className="p-5 space-y-6">
                {/* Property Price Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Home className="h-4 w-4 text-emerald-600" />
                            {t('propertyPrice')}
                        </label>
                        <span className="text-lg font-semibold text-emerald-600">
                            {currency.symbol}{formatPrice(price)}
                        </span>
                    </div>
                    <Slider
                        value={[price]}
                        onValueChange={(v) => setPrice(v[0])}
                        min={minPrice}
                        max={maxPrice}
                        step={priceStep}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>{currency.symbol}{formatPrice(minPrice)}</span>
                        <span>{currency.symbol}{formatPrice(maxPrice)}</span>
                    </div>
                </div>

                {/* Down Payment Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <PiggyBank className="h-4 w-4 text-emerald-600" />
                            {t('downPayment')}
                        </label>
                        <span className="text-lg font-semibold text-emerald-600">
                            {downPaymentPercent}% ({currency.symbol}{formatPrice(result.downPayment)})
                        </span>
                    </div>
                    <Slider
                        value={[downPaymentPercent]}
                        onValueChange={(v) => setDownPaymentPercent(v[0])}
                        min={5}
                        max={50}
                        step={5}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>5%</span>
                        <span>50%</span>
                    </div>
                </div>

                {/* Interest Rate Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Percent className="h-4 w-4 text-emerald-600" />
                            {t('interestRate')}
                        </label>
                        <span className="text-lg font-semibold text-emerald-600">
                            {interestRate.toFixed(2)}% {t('monthly')}
                        </span>
                    </div>
                    <Slider
                        value={[interestRate * 100]}
                        onValueChange={(v) => setInterestRate(v[0] / 100)}
                        min={10}
                        max={500}
                        step={5}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>0.10%</span>
                        <span>5.00%</span>
                    </div>
                </div>

                {/* Loan Term Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                            {t('loanTerm')}
                        </label>
                        <span className="text-lg font-semibold text-emerald-600">
                            {loanTermYears} {t('years')}
                        </span>
                    </div>
                    <Slider
                        value={[loanTermYears]}
                        onValueChange={(v) => setLoanTermYears(v[0])}
                        min={5}
                        max={30}
                        step={5}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>5 {t('years')}</span>
                        <span>30 {t('years')}</span>
                    </div>
                </div>

                {/* Results Section */}
                <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <h3 className="text-sm font-medium text-gray-600 mb-3">{t('results')}</h3>

                    <div className="text-center mb-4">
                        <p className="text-xs text-gray-500">{t('monthlyPayment')}</p>
                        <p className="text-3xl font-bold text-emerald-600">
                            {currency.symbol}{result.monthlyPayment.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                        </p>
                        <p className="text-xs text-gray-400">{t('perMonth')}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white p-3 rounded-lg">
                            <p className="text-xs text-gray-500">{t('loanAmount')}</p>
                            <p className="font-semibold text-gray-800">
                                {currency.symbol}{formatPrice(result.loanAmount)}
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                            <p className="text-xs text-gray-500">{t('totalInterest')}</p>
                            <p className="font-semibold text-amber-600">
                                {currency.symbol}{formatPrice(result.totalInterest)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500">{t('totalPayment')}</p>
                        <p className="font-semibold text-gray-800">
                            {currency.symbol}{formatPrice(result.totalPayment)}
                        </p>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-gray-400 text-center">
                    {t('disclaimer')}
                </p>
            </CardContent>
        </Card>
    )
}
