import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Book, FileText, Code } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function ApiDocsPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'docs' })
    const tApi = await getTranslations({ locale, namespace: 'docs.api' })

    const menuItems = [
        { title: t('sidebar.gettingStarted'), href: `/${locale}/docs`, active: false, icon: Book },
        { title: t('sidebar.coreConcepts'), href: `/${locale}/docs/concepts`, active: false, icon: FileText },
        { title: t('sidebar.apiReference'), href: `/${locale}/docs/api`, active: true, icon: Code }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <PublicNav />
            <div className="flex-1 flex border-t border-gray-200">
                {/* Sidebar */}
                <aside className="w-64 border-r border-gray-200 bg-gray-50 hidden md:block">
                    <div className="p-6 sticky top-0">
                        <h2 className="font-bold text-gray-900 mb-6 px-3">{t('title')}</h2>
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${item.active
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`mr-3 h-4 w-4 ${item.active ? 'text-blue-500' : 'text-gray-400'}`} />
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="mb-12">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{tApi('title')}</h1>
                            <p className="text-xl text-gray-600">
                                {tApi('subtitle')}
                            </p>
                        </div>

                        <Tabs defaultValue="auth" className="space-y-8">
                            <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent p-0 rounded-none h-auto">
                                <TabsTrigger
                                    value="auth"
                                    className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent border-b-2 border-transparent px-6 py-3 rounded-none"
                                >
                                    {tApi('auth')}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="chatbots"
                                    className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent border-b-2 border-transparent px-6 py-3 rounded-none"
                                >
                                    {tApi('chatbots')}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="conversations"
                                    className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent border-b-2 border-transparent px-6 py-3 rounded-none"
                                >
                                    {tApi('conversations')}
                                </TabsTrigger>
                            </TabsList>

                            {/* Authentication Content */}
                            <TabsContent value="auth" className="space-y-6">
                                <div className="prose max-w-none">
                                    <h3>{tApi('auth')}</h3>
                                    <p>{tApi('authDesc')}</p>
                                    <div className="not-prose bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                        <code className="text-sm font-mono text-white">
                                            Authorization: Bearer YOUR_API_KEY
                                        </code>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Chatbots Content */}
                            <TabsContent value="chatbots" className="space-y-6">
                                <div className="prose max-w-none">
                                    <div className="flex items-center gap-3 mb-6 not-prose">
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">GET</Badge>
                                        <h2 className="text-2xl font-bold text-gray-900">/chatbots</h2>
                                    </div>
                                    <p>{tApi('chatbotsDesc')}</p>

                                    <div className="not-prose mt-6">
                                        <div className="bg-gray-900 rounded-xl p-6">
                                            <pre className="text-sm font-mono text-blue-300 overflow-x-auto">
                                                {`{
  "data": [
    {
      "id": "cb_123456789",
      "name": "Customer Support Bot",
      "status": "active",
      "created_at": "2023-12-25T10:00:00Z"
    }
  ]
}`}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Conversations Content */}
                            <TabsContent value="conversations" className="space-y-6">
                                <div className="prose max-w-none">
                                    <div className="flex items-center gap-3 mb-6 not-prose">
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">GET</Badge>
                                        <h2 className="text-2xl font-bold text-gray-900">/conversations</h2>
                                    </div>
                                    <p>Retrieve a list of recent conversations.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
            <Footer locale={locale} />
        </div>
    )
}
