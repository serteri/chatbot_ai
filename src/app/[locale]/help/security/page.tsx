import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function SecurityHelpPage({ params }: PageProps) {
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
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100 text-red-600 mr-4">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Security & Privacy</h1>
                    </div>
                    <p className="text-lg text-gray-600 mb-8">
                        Welcome to the NDIS Shield Hub Security Center. We prioritize the protection of your data and are committed to maintaining the highest standards of security for NDIS providers.
                    </p>
                    <div className="prose prose-blue max-w-none">
                        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Data Encryption</h3>
                        <p className="text-gray-600">All data transmitted and stored within the NDIS Shield Hub is protected using industry-standard AES-256 encryption to ensure maximum security.</p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Sydney Azure Storage</h3>
                        <p className="text-gray-600">To comply with the Australian Privacy Principles (APP) and data sovereignty laws, all your NDIS participant data is stored exclusively in secure Microsoft Azure data centers located in Sydney, Australia.</p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Privacy Framework</h3>
                        <p className="text-gray-600">Our platform is built to align with the 13 Australian Privacy Principles, ensuring that personal data is handled transparently and securely at all times.</p>
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
