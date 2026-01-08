import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Search, Book, CreditCard, Settings, MessageSquare, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function HelpPage({ params }: PageProps) {
    const { locale } = await params

    const categories = [
        { icon: Book, title: "Getting Started", desc: "Learn the basics of PylonChat", href: "/docs" },
        { icon: CreditCard, title: "Billing & Plans", desc: "Manage your subscription and payments", href: "/pricing" },
        { icon: Settings, title: "Account Settings", desc: "Update your profile and preferences", href: "/dashboard/settings" },
        { icon: MessageSquare, title: "Chatbot Configuration", desc: "Customize your AI assistant", href: "/dashboard" },
        { icon: Shield, title: "Security & Privacy", desc: "Learn how we protect your data", href: "/privacy" },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />

            {/* Hero */}
            <div className="bg-blue-600 py-20 text-center text-white px-4">
                <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
                <p className="text-xl text-blue-100 mb-8">Search our knowledge base or browse categories below</p>
                <div className="max-w-2xl mx-auto relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                        placeholder="Search for answers..."
                        className="pl-12 h-14 rounded-xl text-gray-900 shadow-lg border-0"
                    />
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-16 -mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <Link href={cat.href} key={cat.title}>
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer bg-white">
                                <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                        <cat.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-lg">{cat.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-500">{cat.desc}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                    <p className="text-gray-600 mb-8">Our support team is available 24/7 to assist you.</p>
                    <Link href={`/${locale}/contact`}>
                        <div className="inline-flex h-12 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50">
                            Contact Support
                        </div>
                    </Link>
                </div>
            </main>

            <Footer locale={locale} />
        </div>
    )
}
