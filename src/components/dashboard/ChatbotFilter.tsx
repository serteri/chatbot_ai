'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Filter, X, Check } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu'

export function ChatbotFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // URL'den mevcut durumu al, yoksa 'all' varsay
    const currentStatus = searchParams.get('status') || 'all'

    const handleFilterChange = (status: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (status === 'all') {
            params.delete('status')
        } else {
            params.set('status', status)
        }

        // URL'yi güncelle (Bu işlem sayfayı sunucuda yeniden render eder)
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={`bg-white shadow-sm border-slate-200 hover:bg-slate-50 flex-1 sm:flex-none ${currentStatus !== 'all' ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : ''}`}
                >
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Filtrele</span>
                    {currentStatus !== 'all' && (
                        <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">1</span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuLabel>Duruma Göre</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => handleFilterChange('all')} className="justify-between cursor-pointer">
                    <span>Tümü</span>
                    {currentStatus === 'all' && <Check className="h-4 w-4" />}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleFilterChange('active')} className="justify-between cursor-pointer">
                    <span>Sadece Aktifler</span>
                    {currentStatus === 'active' && <Check className="h-4 w-4" />}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleFilterChange('inactive')} className="justify-between cursor-pointer">
                    <span>Sadece Pasifler</span>
                    {currentStatus === 'inactive' && <Check className="h-4 w-4" />}
                </DropdownMenuItem>

                {currentStatus !== 'all' && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleFilterChange('all')}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Temizle
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}