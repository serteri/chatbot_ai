'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Globe } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface DashboardNavProps {
    user: {
        name?: string | null
        email?: string | null
    }
}

export default function DashboardNav({ user }: DashboardNavProps) {
    const t = useTranslations()
    const router = useRouter()
    const pathname = usePathname()

    const changeLocale = (locale: string) => {
        const segments = pathname.split('/')
        segments[1] = locale
        router.push(segments.join('/'))
    }

    const currentLocale = pathname.split('/')[1] || 'tr'

    const handleLogout = async () => {
        await signOut({
            callbackUrl: `/${currentLocale}`,
            redirect: true
        })
    }

    return (
        <nav className="border-b bg-white">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link href={`/${currentLocale}`} className="text-xl font-bold text-blue-600">
                            ChatbotAI
                        </Link>

                        <div className="hidden md:flex space-x-6">
                            <Link
                                href={`/${currentLocale}/dashboard`}
                                className="text-gray-700 hover:text-blue-600 transition"
                            >
                                {t('nav.dashboard')}
                            </Link>
                            <Link
                                href={`/${currentLocale}/dashboard/chatbots`}
                                className="text-gray-700 hover:text-blue-600 transition"
                            >
                                {t('nav.chatbots')}
                            </Link>
                            <Link
                                href={`/${currentLocale}/dashboard/conversations`}
                                className="text-gray-700 hover:text-blue-600 transition"
                            >
                                {t('nav.conversations')}
                            </Link>

                            {/* Education Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="text-gray-700 hover:text-blue-600 transition font-normal">
                                        {t('nav.education')}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/${currentLocale}/dashboard/student/profile`} className="cursor-pointer">
                                            👤 {t('nav.myProfile')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/${currentLocale}/dashboard/student/applications`} className="cursor-pointer">
                                            📋 {t('nav.myApplications')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/${currentLocale}/dashboard/universities`} className="cursor-pointer">
                                            🎓 {t('nav.universities')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/${currentLocale}/dashboard/student/scholarships`} className="cursor-pointer">
                                            💰 {t('nav.scholarships')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/${currentLocale}/dashboard/visa-info`} className="cursor-pointer">
                                            📄 {t('nav.visaInfo')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/${currentLocale}/dashboard/language-schools`} className="cursor-pointer">
                                            🗣️ {t('nav.languageSchools')}
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Link
                                href={`/${currentLocale}/dashboard/pricing`}
                                className="text-gray-700 hover:text-blue-600 transition"
                            >
                                {t('nav.pricing')}
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Dil Seçici */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Globe className="h-4 w-4 mr-2" />
                                    {currentLocale.toUpperCase()}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => changeLocale('tr')}>
                                    🇹🇷 Türkçe
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLocale('en')}>
                                    🇬🇧 English
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLocale('de')}>
                                    🇩🇪 Deutsch
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLocale('fr')}>
                                    🇫🇷 Français
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLocale('es')}>
                                    🇪🇸 Español
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <User className="h-4 w-4 mr-2" />
                                    {user.name || user.email}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    {t('nav.logout')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </nav>
    )
}
