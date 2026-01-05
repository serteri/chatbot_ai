'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface PortalButtonProps {
    children: React.ReactNode
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

export default function PortalButton({ children, className, variant = "default", size = "default" }: PortalButtonProps) {
    const [loading, setLoading] = useState(false)

    const handlePortal = async () => {
        setLoading(true)
        try {
            // API'ye istek at
            const response = await fetch('/api/stripe/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()

            // Gelen URL varsa oraya git
            if (data.url) {
                window.location.href = data.url
            } else {
                console.error("URL alınamadı", data)
                setLoading(false)
            }
        } catch (error) {
            console.error('Portal hatası:', error)
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handlePortal}
            disabled={loading}
            className={className}
            variant={variant}
            size={size}
        >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {children}
        </Button>
    )
}