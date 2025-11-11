'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, GraduationCap, ShoppingCart, Heart, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateChatbotDialogProps {
    trigger?: React.ReactNode
}

export function CreateChatbotDialog({ trigger }: CreateChatbotDialogProps) {
    const router = useRouter()
    const pathname = usePathname()
    const t = useTranslations()
    const locale = pathname.split('/')[1] || 'tr'

    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        welcomeMessage: '',
        fallbackMessage: '',
        industry: 'general', // 🆕 Industry field
    })

    const industries = [
        { value: 'general', label: 'Genel', icon: Briefcase },
        { value: 'education', label: 'Eğitim Danışmanlığı', icon: GraduationCap },
        { value: 'ecommerce', label: 'E-Ticaret', icon: ShoppingCart },
        { value: 'healthcare', label: 'Sağlık', icon: Heart },
    ]

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
            router.push(`/${locale}/dashboard/chatbots/${data.chatbot.id}`)
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

                    {/* 🆕 Industry Seçimi */}
                    <div className="space-y-2">
                        <Label htmlFor="industry">
                            Sektör <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.industry}
                            onValueChange={(value) => setFormData({ ...formData, industry: value })}
                            disabled={isLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sektör seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                {industries.map((ind) => {
                                    const Icon = ind.icon
                                    return (
                                        <SelectItem key={ind.value} value={ind.value}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                <span>{ind.label}</span>
                                            </div>
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                        {formData.industry === 'education' && (
                            <p className="text-xs text-blue-600">
                                ✨ Eğitim danışmanlığı seçildi: Üniversite önerileri ve burs bilgileri otomatik aktif!
                            </p>
                        )}
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