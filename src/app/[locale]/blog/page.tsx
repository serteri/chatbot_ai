import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function BlogPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'blog' })

    const posts = [
        {
            id: 1,
            title: t('posts.post1.title'),
            excerpt: t('posts.post1.excerpt'),
            date: "Oct 12, 2025",
            author: "Sarah Chembo",
            category: t('categories.trends'),
            image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80"
        },
        {
            id: 2,
            title: t('posts.post2.title'),
            excerpt: t('posts.post2.excerpt'),
            date: "Oct 08, 2025",
            author: "Michael Chen",
            category: t('categories.tips'),
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=800&q=80"
        },
        {
            id: 3,
            title: t('posts.post3.title'),
            excerpt: t('posts.post3.excerpt'),
            date: "Oct 01, 2025",
            author: "Emma Wilson",
            category: t('categories.updates'),
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />
            <main className="flex-1 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
                        <p className="text-xl text-gray-600">{t('subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {posts.map((post) => (
                            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200 flex flex-col h-full">
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-blue-600 z-10">
                                        {post.category}
                                    </div>
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <CardHeader>
                                    <div className="text-sm text-gray-500 mb-2 flex items-center space-x-2">
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>{post.author}</span>
                                    </div>
                                    <CardTitle className="text-xl leading-tight line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                                        {post.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-gray-600 line-clamp-3 mb-4">
                                        {post.excerpt}
                                    </p>
                                    <Button variant="link" className="p-0 h-auto font-semibold text-blue-600 group">
                                        {t('readMore')} <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
