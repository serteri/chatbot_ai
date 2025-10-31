'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface ToggleActiveButtonProps {
    chatbotId: string
    initialIsActive: boolean
}

export function ToggleActiveButton({ chatbotId, initialIsActive }: ToggleActiveButtonProps) {
    const [isActive, setIsActive] = useState(initialIsActive)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleToggle = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/chat/${chatbotId}/toggle`, {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('İşlem başarısız')
            }

            const data = await response.json()
            setIsActive(data.isActive)

            // Başarı mesajı
            alert(data.isActive ? 'Chatbot aktif edildi!' : 'Chatbot pasif edildi!')

            // Sayfayı yenile
            router.refresh()
        } catch (error) {
            console.error('Toggle error:', error)
            alert('Bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button onClick={handleToggle} disabled={isLoading}>
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    İşleniyor...
                </>
            ) : isActive ? (
                <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Pasif Yap
                </>
            ) : (
                <>
                    <Eye className="mr-2 h-4 w-4" />
                    Aktif Yap
                </>
            )}
        </Button>
    )
}