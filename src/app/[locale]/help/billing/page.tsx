import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, CreditCard } from 'lucide-react'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function BillingHelpPage({ params }: PageProps) {
    const { locale } = await params

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />
            <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
                <Link href={`/${locale}/help`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 mt-8">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Help Center
                </Link>
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100 text-green-600 mr-4">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Billing Support</h1>
                    </div>
                    <p className="text-lg text-gray-600 mb-8">
                        Welcome to the NDIS Shield Hub Billing Help Center. Discover how to effectively manage your subscriptions, view invoices, and update payment methods in compliance with NDIS requirements.
                    </p>
                    <div className="prose prose-blue max-w-none">
                        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Subscription Management</h3>
                        <p className="text-gray-600">Access your current plan details and billing cycle within the NDIS Shield Hub client dashboard to ensure continuous service for your NDIS participants.</p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Invoices & Receipts</h3>
                        <p className="text-gray-600">Easily access and download your past invoices and receipts for NDIS compliance, auditing, and financial record-keeping.</p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">NDIS Funding Integration</h3>
                        <p className="text-gray-600">Learn how our platform supports integration with various NDIS funding categories, making your billing processes streamlined and efficient.</p>
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
