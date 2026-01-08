import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function StatusPage({ params }: PageProps) {
    const { locale } = await params

    const systems = [
        { name: "API", status: "operational" },
        { name: "Dashboard", status: "operational" },
        { name: "Chat Widget", status: "operational" },
        { name: "Webhooks", status: "operational" },
        { name: "Database", status: "operational" },
        { name: "Third-party Integrations", status: "operational" },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />

            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="bg-green-500 px-8 py-6 flex items-center justify-between text-white">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-8 w-8" />
                                <h1 className="text-2xl font-bold">All Systems Operational</h1>
                            </div>
                            <span className="text-green-100 text-sm font-medium">As of {new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-semibold mb-6">Current Status</h2>
                        <div className="space-y-4">
                            {systems.map((system) => (
                                <div key={system.name} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <span className="font-medium text-gray-700">{system.name}</span>
                                    <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                                        <CheckCircle className="w-4 h-4 mr-1.5" />
                                        Operational
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer locale={locale} />
        </div>
    )
}
