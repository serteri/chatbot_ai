'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRealestateRedirect() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/en/dashboard/realestate')
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Redirecting...</span>
        </div>
    )
}
