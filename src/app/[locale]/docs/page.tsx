import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Book, Code, Terminal, Zap } from 'lucide-react'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function DocsPage({ params }: PageProps) {
    const { locale } = await params

    const sidebar = [
        { title: "Getting Started", icon: Zap, items: ["Introduction", "Installation", "Configuration"] },
        { title: "Core Concepts", icon: Book, items: ["Chatbots", "Flows", "Integrations"] },
        { title: "API Reference", icon: Code, items: ["Authentication", "Endpoints", "Webhooks"] },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />

            <div className="border-b border-gray-200 bg-white">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
                    <p className="text-gray-600 mt-2">Everything you need to build with PylonChat</p>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 space-y-8">
                            {sidebar.map((section) => (
                                <div key={section.title}>
                                    <h3 className="flex items-center text-sm font-semibold text-gray-900 mb-3">
                                        <section.icon className="w-4 h-4 mr-2" />
                                        {section.title}
                                    </h3>
                                    <ul className="space-y-2">
                                        {section.items.map((item) => (
                                            <li key={item}>
                                                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 block px-2 py-1.5 rounded-md transition-colors">
                                                    {item}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="prose prose-blue max-w-none">
                            <h2>Introduction</h2>
                            <p className="lead">
                                PylonChat is an AI-powered customer engagement platform that helps businesses automate support, increase sales, and provide 24/7 assistance.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-8">
                                <Link href={`/${locale}/docs/api`}>
                                    <Card className="hover:border-blue-500 transition-colors cursor-pointer h-full">
                                        <CardContent className="p-6">
                                            <Terminal className="w-8 h-8 text-blue-600 mb-4" />
                                            <h3 className="font-semibold text-lg mb-2">API Reference</h3>
                                            <p className="text-gray-600 text-sm">Explore our REST API endpoints and integrate PylonChat into your technical stack.</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                                <div className="cursor-pointer">
                                    <Card className="hover:border-blue-500 transition-colors h-full">
                                        <CardContent className="p-6">
                                            <Zap className="w-8 h-8 text-yellow-500 mb-4" />
                                            <h3 className="font-semibold text-lg mb-2">Quick Start Guide</h3>
                                            <p className="text-gray-600 text-sm">Get your first chatbot up and running in less than 5 minutes.</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <h3>How it works</h3>
                            <p>
                                Unlike traditional chatbots that rely on rigid decision trees, PylonChat uses advanced Large Language Models (LLMs) to understand intent and context. This allows it to handle complex queries, switch topics naturally, and provide personalized responses.
                            </p>

                            <h3>Next Steps</h3>
                            <ul>
                                <li>Create your free account</li>
                                <li>Configure your first chatbot</li>
                                <li>Embed the widget on your site</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            <Footer locale={locale} />
        </div>
    )
}
