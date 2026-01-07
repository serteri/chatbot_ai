import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft } from 'lucide-react'

interface AuthLayoutProps {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}

export default async function AuthLayout({
    children,
    params
}: AuthLayoutProps) {
    const { locale } = await params

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Proper navbar */}
            <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href={`/${locale}`} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">PylonChat</span>
                        </Link>

                        <Link href={`/${locale}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Ana Sayfa
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {children}
        </div>
    )
}