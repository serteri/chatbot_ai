import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { MOCK_BLOG_POSTS } from '@/lib/mock-blog-data'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function BlogPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'blog' })

    const posts = MOCK_BLOG_POSTS

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
                                    <Button variant="link" className="p-0 h-auto font-semibold text-blue-600 group" asChild>
                                        <Link href={`/${locale}/blog/${post.slug}`}>
                                            {t('readMore')} <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
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
