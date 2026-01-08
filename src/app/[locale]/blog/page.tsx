import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PlaceholderPage from "@/components/PlaceholderPage"
import { Calendar, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function BlogPage({ params }: PageProps) {
    const { locale } = await params

    const posts = [
        {
            title: "The Future of AI Customer Support",
            excerpt: "How generative AI is transforming the way businesses interact with customers 24/7 without losing the human touch.",
            date: "Jan 5, 2024",
            author: "Sarah Johnson",
            category: "Trends"
        },
        {
            title: "Optimizing Chatbot Responses for E-commerce",
            excerpt: "Best practices for training your AI to handle product queries, returns, and order status checks effectively.",
            date: "Dec 28, 2023",
            author: "Michael Chen",
            category: "Tips & Tricks"
        },
        {
            title: "PylonChat v2.0 Release Notes",
            excerpt: "Introducing advanced analytics, multi-language support improvements, and a brand new dashboard experience.",
            date: "Dec 15, 2023",
            author: "PylonChat Team",
            category: "Product Updates"
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />

            {/* Hero */}
            <div className="bg-gray-900 py-20 text-center text-white px-4">
                <h1 className="text-4xl font-bold mb-4">PylonChat Blog</h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">Latest news, updates, and insights from the world of AI chatbots.</p>
            </div>

            <main className="flex-1 container mx-auto px-4 py-16 -mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <Card key={index} className="flex flex-col h-full hover:shadow-xl transition-shadow bg-white overflow-hidden group cursor-pointer">
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                {/* Placeholder image */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20 group-hover:opacity-30 transition-opacity" />
                            </div>
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                                        {post.category}
                                    </Badge>
                                    <span className="text-sm text-gray-500 flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {post.date}
                                    </span>
                                </div>
                                <CardTitle className="leading-tight group-hover:text-blue-600 transition-colors">
                                    {post.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between">
                                <p className="text-gray-600 mb-6 flex-1">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center text-sm text-gray-900 font-medium">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mr-2">
                                            {post.author.charAt(0)}
                                        </div>
                                        {post.author}
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>

            <Footer locale={locale} />
        </div>
    )
}
