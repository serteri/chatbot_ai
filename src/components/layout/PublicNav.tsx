'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'

export function PublicNav() {
    const router = useRouter()
    const pathname = usePathname()
    const t = useTranslations()

    const changeLocale = (locale: string) => {
        const segments = pathname.split('/')
        segments[1] = locale
        router.push(segments.join('/'))
    }

    const currentLocale = pathname.split('/')[1] || 'tr'

    return (
        <nav className="border-b bg-white">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="text-xl font-bold text-blue-600">
                        ChatbotAI
                    </Link>

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

                        <Link href="/login">
                            <Button variant="ghost">{t('nav.login')}</Button>
                        </Link>
                        <Link href="/register">
                            <Button>{t('nav.signup')}</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}