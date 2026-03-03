'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard Client Error:', error)
    }, [error])

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
                We encountered an unexpected error while loading your dashboard.
                {error.message ? ` (${error.message})` : ''}
            </p>
            <div className="flex gap-4 justify-center">
                <Button onClick={() => reset()} className="flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Try again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Go to Home
                </Button>
            </div>
        </div>
    )
}
