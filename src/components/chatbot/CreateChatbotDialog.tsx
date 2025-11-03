'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateChatbotDialogProps {
    trigger?: React.ReactNode
}

export function CreateChatbotDialog({ trigger }: CreateChatbotDialogProps) {
    const router = useRouter()
    const t = useTranslations()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        welcomeMessage: '',
        fallbackMessage: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/chatbot/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || t('common.error'))
                setIsLoading(false)
                return
            }

            toast.success(t('chatbots.createSuccess'))
            setOpen(false)
            router.refresh()

            // Chatbot detay sayfasına yönlendir
            router.push(`/chatbots/${data.chatbot.id}`)
        } catch (error) {
            toast.error(t('common.error'))
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('chatbots.create')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('chatbots.createTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('chatbots.createDescription')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Chatbot Adı */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            {t('chatbots.name')} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder={t('chatbots.namePlaceholder')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Karşılama Mesajı */}
                    <div className="space-y-2">
                        <Label htmlFor="welcomeMessage">
                            {t('settings.welcomeMessage')}
                        </Label>
                        <Textarea
                            id="welcomeMessage"
                            placeholder={t('chatbots.welcomePlaceholder')}
                            value={formData.welcomeMessage}
                            onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                            rows={3}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Fallback Mesajı */}
                    <div className="space-y-2">
                        <Label htmlFor="fallbackMessage">
                            {t('settings.fallbackMessage')}
                        </Label>
                        <Textarea
                            id="fallbackMessage"
                            placeholder={t('chatbots.fallbackPlaceholder')}
                            value={formData.fallbackMessage}
                            onChange={(e) => setFormData({ ...formData, fallbackMessage: e.target.value })}
                            rows={3}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? t('common.loading') : t('chatbots.create')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}