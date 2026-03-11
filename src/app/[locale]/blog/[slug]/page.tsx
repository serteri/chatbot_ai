import { getPostBySlug } from '@/lib/mock-blog-data'
import { notFound } from 'next/navigation'
import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, User, Calendar } from 'lucide-react'
import Markdown from 'react-markdown'

interface PageProps {
    params: Promise<{
        locale: string
        slug: string
    }>
}

export default async function BlogPostPage({ params }: PageProps) {
    const { locale, slug } = await params
    const post = getPostBySlug(slug)

    if (!post) {
        notFound()
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />
            <main className="flex-1 py-12 md:py-20">
                <article className="container mx-auto px-4 max-w-4xl">
                    <Link href={`/${locale}/blog`} className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-8 font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Articles
                    </Link>

                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200">
                        {/* Hero Image */}
                        <div className="w-full h-[400px] relative">
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold text-blue-600 shadow-sm">
                                {post.category}
                            </div>
                        </div>

                        {/* Article Header */}
                        <div className="px-8 md:px-12 pt-10 pb-8 border-b border-gray-100">
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-gray-600">
                                <div className="flex items-center">
                                    <User className="w-5 h-5 mr-2 text-gray-400" />
                                    <span className="font-medium">{post.author}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                                    {post.date}
                                </div>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="px-8 md:px-12 py-10">
                            <div className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-blue-600 prose-img:rounded-xl">
                                <Markdown>{post.content}</Markdown>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
