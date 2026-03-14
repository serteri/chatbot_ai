'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckCircle2, Link2, Loader2, Unlink, ExternalLink } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

interface XeroStatus {
    connected: boolean
    tenantName?: string
    tenantId?: string
    expiresAt?: string
}

export default function XeroConnect() {
    const [status, setStatus] = useState<XeroStatus | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDisconnecting, setIsDisconnecting] = useState(false)

    const searchParams = useSearchParams()
    const router = useRouter()

    // Fetch current connection status
    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/integrations/xero/status')
            if (res.ok) setStatus(await res.json())
        } catch {
            setStatus({ connected: false })
        } finally {
            setIsLoading(false)
        }
    }

    // Handle redirect params from OAuth callback
    useEffect(() => {
        const xeroParam = searchParams.get('xero')
        const reason = searchParams.get('reason')

        if (xeroParam === 'connected') {
            toast.success('Xero connected successfully!')
            router.replace('/dashboard/settings')
        } else if (xeroParam === 'error') {
            const messages: Record<string, string> = {
                unauthorized: 'You must be signed in to connect Xero.',
                state_mismatch: 'Security check failed. Please try again.',
                no_tenants: 'No Xero organisations found on your account.',
                token_exchange_failed: 'Failed to exchange tokens with Xero. Please try again.',
                access_denied: 'Xero access was denied.',
            }
            toast.error(messages[reason ?? ''] ?? `Xero connection failed: ${reason}`)
            router.replace('/dashboard/settings')
        }

        fetchStatus()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleConnect = () => {
        window.location.href = '/api/integrations/xero/auth'
    }

    const handleDisconnect = async () => {
        setIsDisconnecting(true)
        try {
            const res = await fetch('/api/integrations/xero/disconnect', { method: 'DELETE' })
            if (res.ok) {
                setStatus({ connected: false })
                toast.success('Xero disconnected.')
            } else {
                toast.error('Failed to disconnect Xero.')
            }
        } catch {
            toast.error('An error occurred.')
        } finally {
            setIsDisconnecting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking Xero connection…
            </div>
        )
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Left — Xero branding + status */}
            <div className="flex items-center gap-3">
                {/* Xero logo (inline SVG — no external fetch needed) */}
                <div className="w-10 h-10 rounded-lg bg-[#13B5EA] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
                        <path
                            d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm-1.5 17.5l-4.5-4.5 1.414-1.414L19 22.672V13h2v9.672l3.586-3.586L26 20.5l-7.5 5z"
                            fill="white"
                        />
                    </svg>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">Xero</span>
                        {status?.connected ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] font-bold px-2">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Connected
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-slate-400 border-slate-200 text-[10px] font-bold px-2">
                                Not connected
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {status?.connected
                            ? `Organisation: ${status.tenantName ?? 'Unknown'}`
                            : 'Connect to sync invoices and NDIS claims with Xero.'}
                    </p>
                </div>
            </div>

            {/* Right — action buttons */}
            <div className="flex items-center gap-2 shrink-0">
                {status?.connected ? (
                    <>
                        <a
                            href="https://go.xero.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#13B5EA] hover:underline"
                        >
                            Open Xero <ExternalLink className="w-3 h-3" />
                        </a>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDisconnect}
                            disabled={isDisconnecting}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 text-xs font-semibold"
                        >
                            {isDisconnecting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Unlink className="w-3.5 h-3.5" />
                            )}
                            {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
                        </Button>
                    </>
                ) : (
                    <Button
                        size="sm"
                        onClick={handleConnect}
                        className="bg-[#13B5EA] hover:bg-[#0ea5d3] text-white h-8 text-xs font-semibold shadow-sm"
                    >
                        <Link2 className="w-3.5 h-3.5 mr-1.5" />
                        Connect to Xero
                    </Button>
                )}
            </div>
        </div>
    )
}
