'use client'

import { useState } from 'react'
import { Check, Copy, LayoutTemplate, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'react-hot-toast'
import { useTranslations } from 'next-intl'

interface EmbedCodeGeneratorProps {
    chatbotId: string
    initialPosition: string
    appUrl: string
}

export default function EmbedCodeGenerator({ chatbotId, initialPosition, appUrl }: EmbedCodeGeneratorProps) {
    const t = useTranslations('chatbots') // Correct lowercase namespace
    const [position, setPosition] = useState(initialPosition)
    const [isUpdating, setIsUpdating] = useState(false)
    const [copied, setCopied] = useState(false)

    const embedCode = `<script src="${appUrl}/widget.js?id=${chatbotId}"></script>`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(embedCode)
            setCopied(true)
            toast.success(t('copied'))
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error(t('errorOccurred'))
        }
    }

    const handlePositionChange = async (newPosition: string) => {
        setPosition(newPosition)
        setIsUpdating(true)

        try {
            const response = await fetch(`/api/chatbots/${chatbotId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ widgetPosition: newPosition }),
            })

            if (!response.ok) {
                throw new Error('Failed to update position')
            }

            toast.success(t('settingsSaved') || 'Settings saved')
        } catch (error) {
            console.error('Error updating position:', error)
            toast.error(t('errorOccurred'))
            // Revert on error
            setPosition(initialPosition)
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Embed Code Display */}
            <div className="relative group">
                <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-white/90 hover:bg-white text-slate-700 border-slate-200"
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <>
                                <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                                <span className="text-green-600 font-medium">{t('copied')}</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-3.5 w-3.5 mr-1.5" />
                                {t('copyCode')}
                            </>
                        )}
                    </Button>
                </div>

                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm shadow-inner overflow-x-auto border border-slate-800">
                    <code className="text-green-400">
                        {embedCode}
                    </code>
                </div>
            </div>

            {/* Position Settings */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                    <LayoutTemplate className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-slate-800">{t('widgetPosition')}</h4>
                </div>

                <RadioGroup
                    value={position}
                    onValueChange={handlePositionChange}
                    className="grid grid-cols-2 gap-4"
                >
                    <div className="relative">
                        <RadioGroupItem value="bottom-left" id="bottom-left" className="peer sr-only" />
                        <Label
                            htmlFor="bottom-left"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600 cursor-pointer transition-all"
                        >
                            <div className="mb-2 h-16 w-24 rounded-md bg-slate-100 relative border border-slate-200">
                                <div className="absolute bottom-2 left-2 h-6 w-6 rounded-full bg-blue-600 shadow-md"></div>
                            </div>
                            <span className="block w-full text-center text-sm font-medium">{t('bottomLeft')}</span>
                        </Label>
                    </div>

                    <div className="relative">
                        <RadioGroupItem value="bottom-right" id="bottom-right" className="peer sr-only" />
                        <Label
                            htmlFor="bottom-right"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600 cursor-pointer transition-all"
                        >
                            <div className="mb-2 h-16 w-24 rounded-md bg-slate-100 relative border border-slate-200">
                                <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-blue-600 shadow-md"></div>
                            </div>
                            <span className="block w-full text-center text-sm font-medium">{t('bottomRight')}</span>
                        </Label>
                    </div>
                </RadioGroup>

                {isUpdating && (
                    <div className="flex items-center justify-center mt-2 text-xs text-slate-500">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Updating settings...
                    </div>
                )}
            </div>
        </div>
    )
}
