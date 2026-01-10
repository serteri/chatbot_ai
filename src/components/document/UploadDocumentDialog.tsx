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
import { FileText, Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Progress } from '@/components/ui/progress'

interface UploadDocumentDialogProps {
    chatbotId: string
    trigger?: React.ReactNode
}

export function UploadDocumentDialog({ chatbotId, trigger }: UploadDocumentDialogProps) {
    const router = useRouter()
    const t = useTranslations('UploadDocumentDialog')

    const [open, setOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [statusMessage, setStatusMessage] = useState('')

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const validTypes = ['.pdf', '.doc', '.docx', '.txt']
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

        if (!validTypes.includes(fileExtension)) {
            toast.error(t('unsupportedFileType'))
            return
        }

        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error(t('fileTooLarge'))
            return
        }

        setSelectedFile(file)
    }

    const handleCancel = () => {
        if (!isUploading) {
            setSelectedFile(null)
            setOpen(false)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error(t('pleaseSelectFile'))
            return
        }

        setIsUploading(true)
        setUploadProgress(10)
        setStatusMessage(t('uploading'))

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('chatbotId', chatbotId)

            setUploadProgress(30)
            setStatusMessage(t('processing'))

            // API artık senkron çalışıyor - işleme bitene kadar bekleyecek
            const response = await fetch('/api/document/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || t('uploadFailed'))
                setIsUploading(false)
                setUploadProgress(0)
                return
            }

            setUploadProgress(100)

            if (data.status === 'ready') {
                toast.success(t('processingComplete'), {
                    icon: '✅',
                    duration: 3000,
                })
            } else if (data.status === 'failed') {
                toast.error(t('processingError'), {
                    icon: '❌',
                    duration: 3000,
                })
            } else {
                toast.success(t('documentUploadedStartProcessing'))
            }

            // Dialog'u kapat ve sayfayı yenile
            setIsUploading(false)
            setUploadProgress(0)
            setSelectedFile(null)
            setOpen(false)

            window.location.reload()

        } catch (error) {
            console.error('Upload error:', error)
            toast.error(t('errorOccurred'))
            setIsUploading(false)
            setUploadProgress(0)
            setSelectedFile(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!isUploading) setOpen(newOpen)
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        {t('uploadDocument')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white dark:bg-zinc-900">
                <DialogHeader>
                    <DialogTitle>{t('uploadDocument')}</DialogTitle>
                    <DialogDescription>
                        {t('uploadDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* File Input */}
                    {!selectedFile ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileSelect}
                                disabled={isUploading}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm font-medium">
                                    {t('clickToSelect')}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {t('supportedFormats')}
                                </p>
                            </label>
                        </div>
                    ) : (
                        <div className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <FileText className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-sm">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(selectedFile.size)}
                                        </p>
                                    </div>
                                </div>
                                {!isUploading && (
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            {/* Progress Bar */}
                            {isUploading && (
                                <div className="mt-4 space-y-2">
                                    <Progress value={uploadProgress} />
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        {statusMessage}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                            <strong>{t('note')}</strong> {t('noteDescription')}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isUploading}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('processing')}
                            </>
                        ) : (
                            t('upload')
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}