'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface DeleteDocumentButtonProps {
    documentId: string
    documentName: string
}

export function DeleteDocumentButton({ documentId, documentName }: DeleteDocumentButtonProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)

        try {
            const response = await fetch(`/api/document/${documentId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                toast.error(data.error || 'Silme başarısız')
                setIsDeleting(false)
                return
            }

            toast.success('Doküman silindi')
            router.refresh()

        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Bir hata oluştu')
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Dokümanı Sil</AlertDialogTitle>
                    <AlertDialogDescription>
                        <strong>{documentName}</strong> dokümanını silmek istediğinize emin misiniz?
                        Bu işlem geri alınamaz.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? 'Siliniyor...' : 'Sil'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}