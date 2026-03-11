import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function AccountHelpPage({ params }: PageProps) {
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
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600 mr-4">
                            <User className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
                    </div>
                    <p className="text-lg text-gray-600 mb-8">
                        Welcome to the NDIS Shield Hub Account Management Center. Learn how to configure your profile, manage team access, and maintain compliance standards.
                    </p>
                    <div className="prose prose-blue max-w-none">
                        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Profile Settings</h3>
                        <p className="text-gray-600">Update your business information, contact details, and provider registration credentials to ensure they are always up to date for NDIS audits.</p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Team Access & Roles</h3>
                        <p className="text-gray-600">Manage your staff accounts, assign roles, and configure permissions to enforce data security and privacy within your organization.</p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Multi-Factor Authentication</h3>
                        <p className="text-gray-600">Secure your NDIS Shield Hub account by enabling Multi-Factor Authentication (MFA) to protect sensitive participant data against unauthorized access.</p>
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
