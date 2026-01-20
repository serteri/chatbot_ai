'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MessageSquare, GraduationCap, ShoppingCart, Building2, ChevronDown } from 'lucide-react'

interface DemoDropdownProps {
    locale: string
    translations: {
        demoTry: string
        education: string
        ecommerce: string
        realestate: string
        general: string
    }
}

export function DemoDropdown({ locale, translations }: DemoDropdownProps) {
    const router = useRouter()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 gap-2"
                >
                    <MessageSquare className="h-5 w-5" />
                    {translations.demoTry}
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 bg-white text-gray-900 border-gray-200 z-50">
                <DropdownMenuItem
                    onClick={() => router.push(`/${locale}/demo/education`)}
                    className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                >
                    <GraduationCap className="mr-2 h-4 w-4 text-blue-600" />
                    <span>{translations.education}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => router.push(`/${locale}/demo/ecommerce`)}
                    className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                >
                    <ShoppingCart className="mr-2 h-4 w-4 text-green-600" />
                    <span>{translations.ecommerce}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => router.push(`/${locale}/demo/realestate`)}
                    className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                >
                    <Building2 className="mr-2 h-4 w-4 text-amber-600" />
                    <span>{translations.realestate}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => router.push(`/${locale}/demo/general`)}
                    className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                >
                    <MessageSquare className="mr-2 h-4 w-4 text-gray-600" />
                    <span>{translations.general}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
