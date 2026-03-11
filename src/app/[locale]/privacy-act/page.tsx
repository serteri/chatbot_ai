import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'

interface PageProps {
    params: Promise<{
        locale: string
    }>
}

export default async function PrivacyActPage({ params }: PageProps) {
    const { locale } = await params

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />
            <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 border-b pb-6">Privacy Act (APP) Compliance</h1>

                    <div className="prose prose-blue prose-lg max-w-none text-gray-600">
                        <p className="lead text-xl">
                            At NDIS Shield Hub, we recognize the critical sensitivity of the participant data you trust us with. Our platform is engineered to the highest standards of data protection, aligning entirely with the Australian framework.
                        </p>

                        <h2 className="text-gray-900 font-bold border-b pb-2 mt-12 mb-6">Data Sovereignty & Localization</h2>
                        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-6 rounded-r-xl">
                            <p className="font-semibold text-blue-900 m-0">All NDIS data is stored exclusively on Sydney-based Azure Servers to ensure Australian Data Sovereignty.</p>
                        </div>
                        <p>
                            We guarantee that your agency's data, your participants' health records, and all financial claims reside solely within the jurisdictional boundaries of Australia. Data never leaves the country, maintaining strict adherence to government expectations for handling highly sensitive cohort information.
                        </p>

                        <h2 className="text-gray-900 font-bold border-b pb-2 mt-12 mb-6">13 Australian Privacy Principles (APP) Compliance</h2>
                        <p>
                            NDIS Shield Hub's entire data lifecycle is governed by the <i>Privacy Act 1988</i> and the 13 APPs:
                        </p>
                        <ul>
                            <li><strong>Open and Transparent Management:</strong> We clearly document exactly how NDIS data is processed and accessed within our systems.</li>
                            <li><strong>Collection of Solicited Personal Information:</strong> We only collect data intrinsically necessary for the provisioning of NDIS services and PRODA claim generation.</li>
                            <li><strong>Security of Personal Information:</strong> We take active architectural steps to protect personal information from misuse, interference, loss, and unauthorized access.</li>
                        </ul>

                        <h2 className="text-gray-900 font-bold border-b pb-2 mt-12 mb-6">Mandatory Data Breach Notification Policy</h2>
                        <p>
                            Under the Notifiable Data Breaches (NDB) scheme, organizations must notify affected individuals and the OAIC when a data breach is likely to result in serious harm.
                        </p>
                        <p>
                            Our platform integrates automated threat detection routines. In the highly unlikely event of a suspected system compromise, NDIS Shield Hub's Incident Response Team initiates a strict 72-hour assessment protocol to identify the exposure scope. If a breach triggers the NDB criteria, your nominated compliance officers are alerted immediately with comprehensive forensic logs to support your mandatory reporting obligations.
                        </p>

                        <h2 className="text-gray-900 font-bold border-b pb-2 mt-12 mb-6">Encryption Standards (AES-256)</h2>
                        <p>
                            To prevent unauthorized interception of participant data, we utilize military-grade encryption models:
                        </p>
                        <ul>
                            <li><strong>Data at Rest:</strong> All databases housed on the Sydney Azure Servers are encrypted using AES-256 (Advanced Encryption Standard).</li>
                            <li><strong>Data in Transit:</strong> All communication between your browser and our servers is secured via TLS 1.3 cryptographic protocols, preventing man-in-the-middle exploits.</li>
                        </ul>

                        <div className="mt-12 text-sm text-gray-500 pt-6 border-t border-gray-100">
                            <p>Last Updated: October 2025. For any privacy queries, please contact our Data Protection Officer at privacy@ndisshield.com.au.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
