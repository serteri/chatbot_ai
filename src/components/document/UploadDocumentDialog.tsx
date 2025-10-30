'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { FileText, Upload, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Progress } from '@/components/ui/progress'

interface UploadDocumentDialogProps {
    chatbotId: string
    trigger?: React.ReactNode
}

export function UploadDocumentDialog({ chatbotId, trigger }: UploadDocumentDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Dosya tipi kontrolü
        const validTypes = ['.pdf', '.doc', '.docx', '.txt']
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

        if (!validTypes.includes(fileExtension)) {
            toast.error('Sadece PDF, DOCX ve TXT dosyaları desteklenir')
            return
        }

        // Boyut kontrolü (10MB)
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error('Dosya çok büyük. Maksimum 10MB')
            return
        }

        setSelectedFile(file)
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Lütfen bir dosya seçin')
            return
        }

        setIsUploading(true)
        setUploadProgress(10)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('chatbotId', chatbotId)

            setUploadProgress(30)

            const response = await fetch('/api/document/upload', {
                method: 'POST',
                body: formData,
            })

            setUploadProgress(70)

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Yükleme başarısız')
                setIsUploading(false)
                setUploadProgress(0)
                return
            }

            setUploadProgress(100)
            toast.success('Doküman yüklendi! İşleniyor...')

            // Modal'ı kapat
            setOpen(false)
            setSelectedFile(null)
            setUploadProgress(0)

            // Sayfayı yenile
            router.refresh()

        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Bir hata oluştu')
            setUploadProgress(0)
        } finally {
            setIsUploading(false)
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Doküman Yükle
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Doküman Yükle</DialogTitle>
                    <DialogDescription>
                        AI'ınızın öğrenmesi için PDF, DOCX veya TXT dosyası yükleyin
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
                                    Dosya seçmek için tıklayın
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    PDF, DOCX, TXT (Maks. 10MB)
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
                                    <p className="text-xs text-center text-gray-500">
                                        {uploadProgress < 100 ? 'Yükleniyor...' : 'İşleniyor...'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                            <strong>Not:</strong> Doküman yüklendikten sonra AI tarafından işlenecek ve parçalara ayrılacak. Bu işlem birkaç dakika sürebilir.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isUploading}
                    >
                        İptal
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                    >
                        {isUploading ? 'Yükleniyor...' : 'Yükle'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}