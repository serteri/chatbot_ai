import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function ApiDocsPage({ params }: PageProps) {
    const { locale } = await params

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />

            {/* Header */}
            <div className="bg-gray-900 text-white border-b border-gray-800">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center gap-3 mb-4">
                        <Badge variant="secondary" className="bg-blue-900 text-blue-100 hover:bg-blue-800 border-none">v1.2.0</Badge>
                        <span className="text-gray-400">Base URL: https://api.pylonchat.com/v1</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">API Reference</h1>
                    <p className="text-xl text-gray-400 max-w-2xl">
                        programmatically manage chatbots, retrieve conversation history, and analyze performance metrics.
                    </p>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Navigation */}
                    <nav className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4 px-2">Endpoints</h3>
                            <ul className="space-y-1">
                                <li><a href="#auth" className="block px-2 py-1.5 text-sm font-medium text-gray-900 bg-gray-100 rounded-md">Authentication</a></li>
                                <li><a href="#chatbots" className="block px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">Chatbots</a></li>
                                <li><a href="#conversations" className="block px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">Conversations</a></li>
                                <li><a href="#messages" className="block px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">Messages</a></li>
                            </ul>
                        </div>
                    </nav>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-16">

                        {/* Auth Section */}
                        <section id="auth">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Authentication</h2>
                            <p className="text-gray-600 mb-6">
                                The PylonChat API uses API keys to authenticate requests. You can view and manage your API keys in the Dashboard under Settings.
                            </p>

                            <div className="bg-gray-900 rounded-xl p-6 overflow-hidden">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <code className="text-sm font-mono text-gray-300">
                                    <span className="text-purple-400">Authorization:</span> Bearer py_sk_live_...
                                </code>
                            </div>
                        </section>

                        {/* Chatbots Section */}
                        <section id="chatbots">
                            <div className="flex items-center gap-3 mb-6">
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">GET</Badge>
                                <h2 className="text-2xl font-bold text-gray-900">/chatbots</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Returns a list of chatbots associated with your account.
                            </p>

                            <Tabs defaultValue="response" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="request">Request</TabsTrigger>
                                    <TabsTrigger value="response">Response</TabsTrigger>
                                </TabsList>
                                <TabsContent value="request" className="mt-4">
                                    <div className="bg-gray-900 rounded-xl p-6">
                                        <code className="text-sm font-mono text-white">
                                            curl https://api.pylonchat.com/v1/chatbots \<br />
                                            &nbsp;&nbsp;-H "Authorization: Bearer $API_KEY"
                                        </code>
                                    </div>
                                </TabsContent>
                                <TabsContent value="response" className="mt-4">
                                    <div className="bg-gray-900 rounded-xl p-6">
                                        <pre className="text-sm font-mono text-blue-300">
                                            {`{
  "data": [
    {
      "id": "cb_123456789",
      "name": "Support Assistant",
      "model": "gpt-4",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "has_more": false
}`}
                                        </pre>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </section>

                        {/* Create Chatbot Section */}
                        <section id="chatbots-create">
                            <div className="flex items-center gap-3 mb-6">
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">POST</Badge>
                                <h2 className="text-2xl font-bold text-gray-900">/chatbots</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Creates a new chatbot with specific configuration.
                            </p>

                            <div className="bg-gray-900 rounded-xl p-6">
                                <pre className="text-sm font-mono text-green-300">
                                    {`{
  "name": "Sales Bot",
  "instructions": "You are a helpful sales assistant...",
  "model": "gpt-3.5-turbo"
}`}
                                </pre>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            <Footer locale={locale} />
        </div>
    )
}
