'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { Globe, Check, Loader2, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CustomDomainSettingsProps {
    chatbotId: string
    initialDomain?: string | null
}

export default function CustomDomainSettings({ chatbotId, initialDomain }: CustomDomainSettingsProps) {
    const [domain, setDomain] = useState(initialDomain || '')
    const [isSaving, setIsSaving] = useState(false)
    const t = useTranslations('settings') // Using generic settings namespace for now, or add specific keys

    // Temporary translations until keys are added
    const text = {
        title: "Custom Domain",
        description: "Connect your own domain to your chatbot.",
        label: "Domain Name",
        placeholder: "e.g. chat.yourcompany.com",
        instructionTitle: "DNS Configuration",
        instruction: "To use your custom domain, you must add a CNAME record in your DNS provider pointing to:",
        cnameTarget: "app.pylonchat.com", // Or whatever the main app domain is
        save: "Save Domain",
        saving: "Saving...",
        success: "Custom domain saved successfully!",
        error: "Failed to save custom domain. It might be already in use."
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Basic validation
            let cleanDomain = domain.trim().toLowerCase()
            cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')

            const response = await fetch(`/api/chatbots/${chatbotId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customDomain: cleanDomain || null }) // Send null to remove
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update')
            }

            toast.success(text.success)
            setDomain(cleanDomain)
        } catch (error) {
            console.error(error)
            toast.error(text.error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-slate-900">{text.title}</h3>
                        <p className="text-sm text-slate-500">{text.description}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="domain">{text.label}</Label>
                        <div className="flex gap-2">
                            <Input
                                id="domain"
                                placeholder={text.placeholder}
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                className="max-w-md"
                            />
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || domain === initialDomain}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {text.saving}
                                    </>
                                ) : (
                                    text.save
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-md p-4 border border-slate-200 text-sm">
                        <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-600" />
                            {text.instructionTitle}
                        </h4>
                        <p className="text-slate-600 mb-2">{text.instruction}</p>
                        <code className="bg-slate-200 px-2 py-1 rounded text-slate-800 font-mono select-all">
                            CNAME &nbsp; @ &nbsp; {text.cnameTarget}
                        </code>
                        <p className="mt-2 text-xs text-slate-500">
                            (Note: It may take up to 24 hours for DNS changes to propagate.)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
