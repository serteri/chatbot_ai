import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, CheckSquare } from 'lucide-react'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function ComplianceHelpPage({ params }: PageProps) {
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
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100 text-green-600 mr-4">
                            <CheckSquare className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Compliance Reporting</h1>
                    </div>

                    <div className="prose prose-green prose-lg max-w-none text-gray-600">
                        <p className="lead text-xl">
                            NDIS Shield Hub is a technical software provider engineered specifically to support both registered and unregistered NDIS providers in meeting stringent statutory obligations.
                        </p>

                        <h2 className="text-gray-900 font-bold border-b pb-2 mt-12 mb-6">NDIS Practice Standards and Quality Indicators</h2>
                        <p>
                            To maintain the highest level of care and accountability within the National Disability Insurance Scheme, providers must adhere to the <strong>NDIS Practice Standards</strong>. Our software architecture is explicitly mapped against the core modules of these standards to streamline your reporting workflow.
                        </p>

                        <h3>1. Provider Governance and Operational Management</h3>
                        <p>
                            Quality Indicator compliance requires robust operational management. NDIS Shield Hub provides centralized dashboards that log all platform activity, creating an immutable audit trail of who accessed which participant records and when—assisting directly with your information management and privacy obligations under the Practice Standards.
                        </p>

                        <h3>2. Provision of Supports Environment</h3>
                        <p>
                            To assist with safe support provisioning, our platform allows you to securely upload, categorize, and track essential compliance documents such as:
                        </p>
                        <ul>
                            <li>Worker Screening Clearances</li>
                            <li>Incident Management Logs</li>
                            <li>Feedback and Complaints Registries</li>
                        </ul>
                        <p>Automated alerts notify your compliance officers 30 days before critical staff credentials expire, protecting you from unintentional non-compliance.</p>

                        <h2 className="text-gray-900 font-bold border-b pb-2 mt-12 mb-6">Registered vs. Unregistered Providers</h2>
                        <p>
                            Whether you are a fully registered agency facing comprehensive certification audits, or an unregistered provider delivering services to self-managed or plan-managed participants, NDIS Shield Hub scales to your reporting needs.
                        </p>
                        <p>
                            While unregistered providers may not undergo formal NDIA audits, maintaining the same caliber of documentation—such as structured Service Agreements and precise invoicing against the Price Guide—is best practice and protects your business from liability.
                        </p>

                        <div className="mt-12 p-6 bg-green-50 border border-green-100 rounded-xl">
                            <h4 className="text-green-900 font-bold mt-0">Your Compliance Partner</h4>
                            <p className="mb-0 text-green-800">
                                As a software provider, NDIS Shield Hub does not replace qualified legal or financial counsel. We provide the <em>tools</em> necessary to generate immaculate records, giving your agency the structural foundation required to pass Commission scrutiny.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
