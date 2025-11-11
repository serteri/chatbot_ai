'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'  // Standart içe aktarım (dil desteği için değil)
import { useTranslations } from 'next-intl'
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
    const t = useTranslations('ToggleActiveButton')  // Çeviriler için namespace

    const handleToggle = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/chat/${chatbotId}/toggle`, {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error(t('operationFailed'))
            }

            const data = await response.json()
            setIsActive(data.isActive)

            // Başarı mesajı
            alert(data.isActive ? t('chatbotActivated') : t('chatbotDeactivated'))

            // Sayfayı yenile
            router.refresh()
        } catch (error) {
            console.error('Toggle error:', error)
            alert(t('errorOccurred'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button onClick={handleToggle} disabled={isLoading}>
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('processing')}
                </>
            ) : isActive ? (
                <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    {t('makePassive')}
                </>
            ) : (
                <>
                    <Eye className="mr-2 h-4 w-4" />
                    {t('makeActive')}
                </>
            )}
        </Button>
    )
}