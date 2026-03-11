import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function AuditHelpPage({ params }: PageProps) {
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
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-100 text-teal-600 mr-4">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Audit Preparation</h1>
                    </div>

                    <div className="prose prose-teal prose-lg max-w-none text-gray-600">
                        <p className="lead text-xl">
                            Generating Audit-Ready Evidence Reports that meet rigorous NDIS Quality and Safeguards Commission standards is a core feature of NDIS Shield Hub.
                        </p>

                        <h2 className="text-gray-900 font-bold border-b pb-2 mt-12 mb-6">The Importance of Audit Readiness</h2>
                        <p>
                            As a registered NDIS provider, you must periodically undergo either a verification or certification audit to maintain your registration status. Falling short of the NDIS Practice Standards can lead to significant penalties, registration suspension, or revocation. NDIS Shield Hub's evidence generation tools drastically reduce the administrative burden associated with preparing for an auditor's visit.
                        </p>

                        <h2 className="text-gray-900 font-bold border-b pb-2 mt-12 mb-6">Generating Audit-Ready Evidence Reports</h2>
                        <p>
                            Follow these steps to generate comprehensive compliance reports tailored for the NDIS Commission:
                        </p>

                        <h3>1. Navigate to the Compliance Dashboard</h3>
                        <p>
                            Log in to your <strong>Agency Dashboard</strong> and select the <strong>Reports & Audits</strong> module from the sidebar. Here, all historical data regarding claims, service agreements, incident logs, and staff credentials is consolidated securely.
                        </p>

                        <h3>2. Select the Reporting Framework</h3>
                        <p>
                            Choose the specific framework you are being audited against. The system allows you to map internal data directly to specific modules of the <strong>NDIS Practice Standards</strong> (e.g., Core Module, High Intensity Daily Personal Activities Module).
                        </p>

                        <h3>3. Generate the Evidence Bundle</h3>
                        <p>
                            Click <strong>Compile Evidence Report</strong>. NDIS Shield Hub will systematically aggregate:
                        </p>
                        <ul>
                            <li>Digitally signed Service Agreements and Support Plans.</li>
                            <li>A ledger of all specific PRODA claims cross-referenced with staff timesheets.</li>
                            <li>Incident Summary Reports to demonstrate continuous improvement.</li>
                            <li>Staff compliance matrices showing valid Worker Screening Checks and CPR/First Aid certs.</li>
                        </ul>

                        <h3>4. Review and Export</h3>
                        <p>
                            The generated report includes an executive summary and a detailed appendix referencing specific data points within the platform. You can export this as a paginated, secure PDF ready to be securely transmitted to your approved quality auditor.
                        </p>

                        <div className="mt-12 p-6 bg-teal-50 border border-teal-100 rounded-xl">
                            <h4 className="text-teal-900 font-bold mt-0">Continuous Compliance</h4>
                            <p className="mb-0 text-teal-800">
                                <em>Remember:</em> NDIS Shield Hub monitors your data dynamically. If your records drift from compliance on a day-to-day basis, the dashboard will warn you long before the auditor arrives.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
