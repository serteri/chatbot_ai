'use client'

import { useState, useRef, useEffect } from 'react'
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
import { FileText, Upload, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Progress } from '@/components/ui/progress'
import { sleep } from '@/lib/utils' // utils dosyanızdan sleep fonksiyonu

// Polling ayarları
const POLLING_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 90; // Maksimum 3 dakika (90 * 2s) bekleme

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

    // Varsayılan dosya boyutu formatlayıcı (utils'den import edilmediği varsayılır)
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

    // ✅ YENİ/DÜZELTİLMİŞ: İşlem durumunu kontrol etme (Polling)
    const startPolling = async (documentId: string) => {
        setUploadProgress(75); // İşleniyor durumuna sabitleniyor

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            await sleep(POLLING_INTERVAL_MS);

            try {
                // Dokümanın anlık durumunu sorgula
                // NOT: Bu endpoint'in (örneğin /api/document/status) 'ready', 'processing' veya 'failed' döndürmesi gerekir.
                const checkResponse = await fetch(`/api/document/status?documentId=${documentId}`);
                if (!checkResponse.ok) throw new Error("Status check failed");

                const statusData = await checkResponse.json();

                if (statusData.status === 'ready') {
                    setUploadProgress(100);
                    toast.success(t('processingComplete')); // BİTTİ MESAJI
                    return true; // Başarılı
                }

                if (statusData.status === 'failed') {
                    toast.error(t('processingError'));
                    return false;
                }

            } catch (error) {
                console.error("Polling error:", error);
                // Bir sonraki denemede tekrar dener
            }
        }
        toast.error(t('processingTimeout')); // Zaman aşımı
        return false;
    };

    // Yükleme sırasında iptal butonu için
    const handleCancel = () => {
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        setOpen(false);
        toast.error(t('uploadCancelled'));
    }


    // ✅ DÜZELTİLMİŞ: Yükleme ve Polling Başlatma
    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error(t('pleaseSelectFile'))
            return
        }

        setIsUploading(true)
        setUploadProgress(10)

        let documentId = '';

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('chatbotId', chatbotId)

            setUploadProgress(30)

            // 1. Dosyayı yükle
            const response = await fetch('/api/document/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || t('uploadFailed'))
                return
            }

            documentId = data.documentId;
            toast.success(t('documentUploadedStartProcessing'));

            // 2. Polling'i başlat ve sonucunu bekle
            const success = await startPolling(documentId);

            if (success) {
                setOpen(false)
                router.refresh(); // ✅ BAŞARIYLA BİTTİ: Sayfayı yenile
            }

        } catch (error) {
            console.error('Upload error:', error)
            toast.error(t('errorOccurred'))
        } finally {
            // Hata, zaman aşımı veya başarısız işleme durumunda temizle ve kapat
            if (uploadProgress < 100) {
                setIsUploading(false)
                setUploadProgress(0)
                setSelectedFile(null)
                setOpen(false);
            }
        }
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        {t('uploadDocument')}
                    </Button>
                )}
            </DialogTrigger>
            {/* ✅ Dialog Content, önceki hatadan dolayı beyaz arka planlı */}
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
                                        onClick={handleCancel}
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
                                        {uploadProgress < 75 ? t('uploading') : t('processing')}
                                    </p>
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
                        {isUploading ? t('uploading') : t('upload')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}