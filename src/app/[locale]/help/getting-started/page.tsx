import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, PlayCircle } from 'lucide-react'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function GettingStartedHelpPage({ params }: PageProps) {
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
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600 mr-4">
                            <PlayCircle className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Getting Started</h1>
                    </div>

                    <div className="prose prose-blue prose-lg max-w-none text-gray-600">
                        <p className="lead text-xl">
                            Welcome to NDIS Shield Hub. This guide will walk you through the essential steps to configure your workspace and successfully onboard your first NDIS participant.
                        </p>

                        <h2 className="text-gray-900 font-bold border-b pb-2 mt-12 mb-6">1. Setting up your Agency profile</h2>
                        <p>
                            A complete and accurate Agency Profile is the foundation of your NDIS compliance. Before processing any claims or onboarding participants, ensure your provider details are correctly registered within the platform.
                        </p>
                        <ul>
                            <li><strong>Provider Registration Number (PRN):</strong> Navigate to <code>Settings &gt; Billing & Compliance</code> and input your secure PRN. NDIS Shield Hub uses this to validate claims automatically against the NDIA database.</li>
                            <li><strong>Service Regions:</strong> Define the regions you operate in. The platform will automatically localize relevant price limits based on your designated geographical boundaries (e.g., remote vs. standard pricing).</li>
                            <li><strong>Primary Contacts:</strong> Assign the primary compliance officer to receive immediate automated alerts when a claim anomaly is detected.</li>
                        </ul>

                        <h2 className="text-gray-900 font-bold border-b pb-2 mt-12 mb-6">2. Onboarding your first NDIS Participant</h2>
                        <p>
                            Adding a participant to NDIS Shield Hub is designed to be a streamlined, secure procedure ensuring that their sensitive health and financial data is handled per the 13 Australian Privacy Principles (APP).
                        </p>

                        <h3>Step 1: Create the Participant Profile</h3>
                        <p>
                            Navigate to the <strong>Participants</strong> tab and click <strong>Add New Participant</strong>. You will need their NDIS Number, Date of Birth, and full legal name precisely as it appears on their NDIS plan.
                        </p>

                        <h3>Step 2: Upload the NDIS File</h3>
                        <p>
                            Upload the participant's official NDIS Plan PDF. Our AI-driven <em>Accuracy Shield</em> will scan the document, parse the relevant funding categories, and automatically generate a localized dashboard tracking their Core, Capacity Building, and Capital supports.
                        </p>

                        <h3>Step 3: Service Agreement Generation</h3>
                        <p>
                            Once the plan details are validated, navigate to the <strong>Service Agreements</strong> tab. The platform will pre-fill a compliant, standardized Service Agreement ready for digital execution, minimizing administrative overhead and reducing the risk of clerical errors.
                        </p>

                        <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-xl">
                            <h4 className="text-blue-900 font-bold mt-0">Ready to go?</h4>
                            <p className="mb-0 text-blue-800">
                                With your agency profile completed and your first participant securely loaded onto the Sydney Azure Servers, you're ready to start processing compliant invoices securely out-of-the-box.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
