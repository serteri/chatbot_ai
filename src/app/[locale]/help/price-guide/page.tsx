import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, TrendingUp } from 'lucide-react'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function PriceGuideHelpPage({ params }: PageProps) {
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
                    <div className="flex items-center mb-8">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-600 mr-4">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">NDIS Price Guide Updates</h1>
                    </div>

                    <div className="prose prose-indigo prose-lg max-w-none text-gray-600">
                        <p className="lead text-xl">
                            Learn how NDIS Shield Hub seamlessly synchronizes with the official NDIS Pricing Arrangements and Price Limits, ensuring your claims are always accurate and compliant.
                        </p>

                        <h2 className="text-gray-900 font-bold border-b pb-2 mt-12 mb-6">Real-Time Syncing with the 2025/26 NDIS Price Guide</h2>
                        <p>
                            The NDIA regularly updates the support catalogue, introducing new line items, deprecating legacy codes, and adjusting maximum price limits. Keeping track of these changes manually is a significant source of compliance risk for providers.
                        </p>
                        <p>
                            NDIS Shield Hub mitigates this risk entirely. Our backend engines automatically synchronize with the latest <strong>2025/26 NDIS Price Guide</strong> via direct NDIA data ingestion.
                        </p>

                        <h2 className="text-gray-900 font-bold border-b pb-2 mt-12 mb-6">Preventing Under-Claiming and Over-Claiming</h2>
                        <p>
                            Financial discrepancies in invoicing often lead to immediate claim rejections via PRODA, delaying cash flow. In worst-case scenarios, systemic errors flag your agency for an NDIA compliance audit.
                        </p>

                        <h3>1. Over-Claiming Protection</h3>
                        <p>
                            Whenever a staff member attempts to generate an invoice line item, NDIS Shield Hub cross-references the billed amount against the maximum allowed limit for that specific code and participant location (e.g., standard vs. remote rates). If the rate exceeds the limit, the invoice is blocked and an alert is flagged for managerial review.
                        </p>

                        <h3>2. Under-Claiming Identification</h3>
                        <p>
                            Conversely, utilizing outdated lower rates reduces your agency's working capital. NDIS Shield Hub proactively scans recurring service agreements and suggests updates if a price limit has increased, ensuring you are fairly compensated for the services provided.
                        </p>

                        <h3>3. Invalid Line Items</h3>
                        <p>
                            If an invoice attempts to utilize a line item code that has been retired or restricted under the 2025/26 framework, the system will immediately prompt the user to select the appropriate contemporary alternative.
                        </p>

                        <div className="mt-12 p-6 bg-indigo-50 border border-indigo-100 rounded-xl">
                            <h4 className="text-indigo-900 font-bold mt-0">Sleep Soundly</h4>
                            <p className="mb-0 text-indigo-800">
                                Let NDIS Shield Hub's Accuracy Engine handle the complex arithmetic and compliance mapping. You can focus entirely on delivering outstanding care to your participants.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
