'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Settings, BarChart3, Trash2, Loader2 } from 'lucide-react'
import { deleteChatbot } from '@/actions/chatbot'
import { toast } from 'react-hot-toast'
import { useTranslations } from 'next-intl'

interface ChatbotActionsProps {
    chatbotId: string
    locale: string
}

export function ChatbotActions({ chatbotId, locale }: ChatbotActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const t = useTranslations('chatbots')

    const handleDelete = async () => {
        if (!confirm('Bu chatbotu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return

        setIsDeleting(true)
        const result = await deleteChatbot(chatbotId)
        setIsDeleting(false)

        if (result.success) {
            toast.success('Chatbot başarıyla silindi')
        } else {
            toast.error(result.error || 'Bir hata oluştu')
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 -mr-2">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                    <Link href={`/${locale}/dashboard/chatbots/${chatbotId}`} className="cursor-pointer flex items-center">
                        <Eye className="mr-2 h-4 w-4 text-blue-500" /> {t('view')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/${locale}/dashboard/chatbots/${chatbotId}/settings`} className="cursor-pointer flex items-center">
                        <Settings className="mr-2 h-4 w-4 text-slate-500" /> {t('settings')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/${locale}/dashboard/chatbots/${chatbotId}/analytics`} className="cursor-pointer flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4 text-green-500" /> {t('analytics')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer flex items-center"
                >
                    {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    {isDeleting ? 'Siliniyor...' : t('delete')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}