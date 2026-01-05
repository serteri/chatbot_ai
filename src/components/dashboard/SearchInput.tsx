'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function SearchInput({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    // Basit debounce (gecikmeli arama) mekanizması
    let timeoutId: NodeJS.Timeout

    const handleSearch = (term: string) => {
        clearTimeout(timeoutId)

        timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams)
            if (term) {
                params.set('search', term)
            } else {
                params.delete('search')
            }
            replace(`${pathname}?${params.toString()}`)
        }, 300) // 300ms bekle
    }

    return (
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
                placeholder={placeholder}
                className="pl-10 bg-white shadow-sm border-slate-200 focus:border-slate-900 focus:ring-slate-900 transition-all h-10"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('search')?.toString()}
            />
        </div>
    )
}