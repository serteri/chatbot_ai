'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
    SelectValue
} from '@/components/ui/select'
import { Bot, MessageSquare, Briefcase, GraduationCap, ShoppingCart, Loader2, Sparkles, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CreateChatbotDialogProps {
    trigger?: React.ReactNode
    prefilledData?: {
        name?: string
        type?: string
        botName?: string
        welcomeMessage?: string
    }
}

export function CreateChatbotDialog({ trigger, prefilledData }: CreateChatbotDialogProps) {
    const router = useRouter()
    const t = useTranslations('chatbots')
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Varsayılan değerler
    const [formData, setFormData] = useState({
        name: prefilledData?.name || '',
        type: prefilledData?.type || 'general',
        welcomeMessage: prefilledData?.welcomeMessage || ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) throw new Error('Failed to create')

            const data = await response.json()
            toast.success(t('createSuccess'))
            setOpen(false)
            router.refresh()
        } catch (error) {
            toast.error(t('errorOccurred') || 'Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-slate-900 hover:bg-slate-800 shadow-sm transition-all hover:scale-105 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('createNew')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white p-0 gap-0 overflow-visible border-slate-100 shadow-2xl rounded-xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-xl">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm border border-white/10 shadow-sm">
                            <Sparkles className="h-5 w-5 text-yellow-300" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white tracking-tight">
                            {t('createTitle')}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-blue-100 text-sm font-medium opacity-90">
                        {t('createDescription')}
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-4">
                        {/* İsim Alanı */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-slate-700 font-semibold text-sm flex items-center gap-2">
                                <Bot className="h-3.5 w-3.5 text-blue-500" />
                                {t('name')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder={t('namePlaceholder')}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all h-11"
                            />
                        </div>

                        {/* Sektör Seçimi - DÜZELTİLDİ */}
                        <div className="space-y-1.5 relative">
                            <Label htmlFor="type" className="text-slate-700 font-semibold text-sm flex items-center gap-2">
                                <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                                {t('industryType')}
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 bg-white">
                                    <SelectValue placeholder={t('select')} />
                                </SelectTrigger>
                                {/* ✅ KRİTİK DÜZELTME: z-index artırıldı, bg-white zorlandı, pozisyonlama düzeltildi */}
                                <SelectContent
                                    className="bg-white border border-slate-200 shadow-xl z-[9999]"
                                    position="popper"
                                    sideOffset={5}
                                >
                                    <SelectItem value="general" className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <Bot className="h-4 w-4 text-slate-500" />
                                            <span className="font-medium text-slate-900">{t('generalType')}</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="education" className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-blue-500" />
                                            <span className="font-medium text-slate-900">{t('educationType')}</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="ecommerce" className="cursor-pointer hover:bg-green-50 focus:bg-green-50 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <ShoppingCart className="h-4 w-4 text-green-500" />
                                            <span className="font-medium text-slate-900">{t('ecommerceType')}</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Karşılama Mesajı */}
                        <div className="space-y-1.5">
                            <Label htmlFor="welcome" className="text-slate-700 font-semibold text-sm flex items-center gap-2">
                                <MessageSquare className="h-3.5 w-3.5 text-green-500" />
                                {t('welcomeMessage')}
                            </Label>
                            <Textarea
                                id="welcome"
                                placeholder={t('welcomePlaceholder')}
                                value={formData.welcomeMessage}
                                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                                className="bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-green-100 focus:border-green-500 min-h-[80px] resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-3 sm:gap-0 pt-4 border-t border-slate-100 mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                            className="border-slate-200 text-slate-600 hover:bg-slate-50 h-11 font-medium"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] h-11 shadow-md hover:shadow-lg transition-all font-medium"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('creating')}
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('create')}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}