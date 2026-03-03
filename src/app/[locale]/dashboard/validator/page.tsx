'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
    Upload,
    FileText,
    CheckCircle,
    Loader2,
    ShieldCheck,
    Send,
    Bot,
    User,
    AlertTriangle,
    Sparkles,
    X,
    Clock,
    ScanSearch,
    BadgeCheck,
} from 'lucide-react'
import { logValidatorPageView, logDocumentUploadAttempt } from './actions'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ValidatorStep = 'waiting' | 'uploaded' | 'scanning' | 'audit-ready'

interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

// ---------------------------------------------------------------------------
// Mock AI Responses
// ---------------------------------------------------------------------------

const INITIAL_ANALYSIS_MESSAGE = `✅ **Analysis Complete.** NDIS Price Guide 2025/26 applied.
**Audit Trail ID:** #AT-992

Here is a summary of compliance findings:

**Participant Overview:**
- Total Plan Funding: **$54,000**
- Plan Period: 01 Jul 2025 – 30 Jun 2026
- Registration Group: Core Supports + Capacity Building

**Key Line Items:**
| Line Item | Description | Budget |
|---|---|---|
| 04_590_0125_6_1 | Weekend Transport | $4,200 |
| 01_011_0107_1_1 | Assistance with Daily Life | $28,500 |
| 15_037_0117_1_3 | Improved Learning | $12,800 |
| 03_021_0120_6_1 | Plan Management | $8,500 |

**⚠️ Compliance Flags:**
- No cancellation policy found — **add Clause 7.2** per NDIS Terms of Business.
- Weekend transport: ensure activity logs are maintained for \`04_590_0125_6_1\`.

**Overall Compliance Score: 87%** — 2 items need attention before the next audit.

You can now ask me any question about this Service Agreement.`

const FOLLOWUP_RESPONSE = `Based on my analysis of this Service Agreement:

**Weekend Transport (Line Item 04_590_0125_6_1):**
- Budget Allocated: **$4,200/year** (~$80.77/week)
- Rate Applied: NDIS Price Guide 2025/26 — $0.97/km (modified vehicle) or $59.95/hr (non-standard)
- **Status:** ✅ Covered — but you must maintain participant-signed activity logs per NDIS Practice Standard 2.3

**Recommendation:** Implement a digital log sheet to auto-capture trip details. This will strengthen your compliance posture from 87% to an estimated **94%**.

Need me to check anything else?`

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ValidatorPage() {
    const [step, setStep] = useState<ValidatorStep>('waiting')
    const [fileName, setFileName] = useState<string | null>(null)
    const [fileSize, setFileSize] = useState<number>(0)
    const [isDragging, setIsDragging] = useState(false)
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const [chatInput, setChatInput] = useState('')
    const [isAiTyping, setIsAiTyping] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Audit: Log page view on mount
    useEffect(() => {
        logValidatorPageView()
    }, [])

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages, isAiTyping])

    // -----------------------------------------------------------------------
    // File Handling
    // -----------------------------------------------------------------------

    const handleFile = useCallback(async (file: File) => {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            alert('Please upload a PDF document.')
            return
        }

        setFileName(file.name)
        setFileSize(file.size)
        setStep('uploaded')

        // Audit log
        await logDocumentUploadAttempt(file.name)

        // Simulate: Security Scan
        setTimeout(() => setStep('scanning'), 800)

        // Simulate: Audit Ready + initial AI message
        setTimeout(() => {
            setStep('audit-ready')
            setChatMessages([
                {
                    role: 'assistant',
                    content: INITIAL_ANALYSIS_MESSAGE,
                    timestamp: new Date(),
                },
            ])
        }, 3500)
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) handleFile(file)
        },
        [handleFile]
    )

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
        },
        [handleFile]
    )

    // -----------------------------------------------------------------------
    // Chat Logic
    // -----------------------------------------------------------------------

    const handleSendMessage = useCallback(async () => {
        const text = chatInput.trim()
        if (!text || step !== 'audit-ready') return

        setChatInput('')
        setChatMessages((prev) => [
            ...prev,
            { role: 'user', content: text, timestamp: new Date() },
        ])

        setIsAiTyping(true)
        await new Promise((r) => setTimeout(r, 2000))
        setIsAiTyping(false)

        setChatMessages((prev) => [
            ...prev,
            { role: 'assistant', content: FOLLOWUP_RESPONSE, timestamp: new Date() },
        ])
    }, [chatInput, step])

    const handleReset = useCallback(() => {
        setStep('waiting')
        setFileName(null)
        setFileSize(0)
        setChatMessages([])
        setChatInput('')
    }, [])

    // -----------------------------------------------------------------------
    // Status Tracker Config
    // -----------------------------------------------------------------------

    const statusSteps = [
        { key: 'uploaded' as const, label: 'Waiting for File', activeLabel: 'File Received', icon: Clock },
        { key: 'scanning' as const, label: 'Security Scan', activeLabel: 'Scanning...', icon: ScanSearch },
        { key: 'audit-ready' as const, label: 'Audit Ready', activeLabel: 'Audit Ready ✅', icon: BadgeCheck },
    ]

    const getStepStatus = (stepKey: string) => {
        const order = ['waiting', 'uploaded', 'scanning', 'audit-ready']
        const currentIdx = order.indexOf(step)
        const stepIdx = order.indexOf(stepKey)
        if (stepIdx < currentIdx) return 'complete'
        if (stepIdx === currentIdx) return 'active'
        return 'pending'
    }

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-teal-700" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Service Agreement Validator
                        </h1>
                        <p className="text-sm text-slate-500">
                            Upload an NDIS Service Agreement PDF to verify compliance instantly.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Compliance Status Bar ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Compliance Status
                </p>
                <div className="flex items-center justify-between">
                    {statusSteps.map((s, idx) => {
                        const status = getStepStatus(s.key)
                        const Icon = s.icon
                        return (
                            <div key={s.key} className="flex items-center flex-1">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${status === 'complete'
                                                ? 'bg-teal-600 border-teal-600 text-white'
                                                : status === 'active'
                                                    ? 'bg-teal-50 border-teal-500 text-teal-700 animate-pulse'
                                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                                            }`}
                                    >
                                        {status === 'complete' ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : status === 'active' && s.key === 'scanning' ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Icon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="hidden sm:block">
                                        <p
                                            className={`text-sm font-semibold transition-colors ${status !== 'pending'
                                                    ? 'text-slate-900'
                                                    : 'text-slate-400'
                                                }`}
                                        >
                                            {status === 'active' || status === 'complete'
                                                ? s.activeLabel
                                                : s.label}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            Step {idx + 1} of 3
                                        </p>
                                    </div>
                                </div>
                                {idx < statusSteps.length - 1 && (
                                    <div className="flex-1 mx-4">
                                        <div className="h-0.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-teal-500 rounded-full transition-all duration-700 ease-out ${getStepStatus(statusSteps[idx + 1].key) !== 'pending'
                                                        ? 'w-full'
                                                        : 'w-0'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Drag & Drop Upload ── */}
            {step === 'waiting' && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`bg-white rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer p-12 sm:p-16 text-center group ${isDragging
                            ? 'border-teal-500 bg-teal-50/50 scale-[1.01]'
                            : 'border-slate-300 hover:border-teal-400 hover:bg-teal-50/20'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileInput}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-300 ${isDragging
                                    ? 'bg-teal-100 border-teal-300 scale-110'
                                    : 'bg-slate-100 border-slate-200 group-hover:bg-teal-50 group-hover:border-teal-200'
                                }`}
                        >
                            <Upload
                                className={`h-8 w-8 transition-colors ${isDragging ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-500'
                                    }`}
                            />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-slate-700">
                                {isDragging ? 'Drop your document here' : 'Drag & Drop your Service Agreement'}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                or{' '}
                                <span className="text-teal-600 font-medium underline underline-offset-2">
                                    click to browse
                                </span>{' '}
                                · <strong>PDF format only</strong>
                            </p>
                        </div>
                        <div className="flex items-center gap-5 mt-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                AES-256 encrypted
                            </span>
                            <span className="flex items-center gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                Max 20 MB
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                                AI-powered analysis
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── File Card (shown after upload) ── */}
            {step !== 'waiting' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center">
                                <FileText className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{fileName}</p>
                                <p className="text-xs text-slate-400">
                                    {(fileSize / 1024).toFixed(1)} KB ·{' '}
                                    {step === 'scanning' ? (
                                        <span className="text-amber-600 font-medium">Security Scan...</span>
                                    ) : step === 'audit-ready' ? (
                                        <span className="text-emerald-600 font-medium">✅ Audit Ready</span>
                                    ) : (
                                        <span className="text-teal-600 font-medium">Uploaded</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleReset}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Remove and start over"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Scanning skeleton */}
                    {step === 'scanning' && (
                        <div className="mt-5 space-y-3">
                            <div className="flex items-center gap-2 text-sm text-amber-700">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Running NDIS compliance checks &amp; security scan...</span>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full animate-pulse w-3/4" />
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full animate-pulse w-1/2" />
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full animate-pulse w-5/6" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Compliance Query Chat ── */}
            {step === 'audit-ready' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-teal-700" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                Compliance Query Engine
                            </p>
                            <p className="text-xs text-slate-400">
                                Ask questions about the uploaded Service Agreement
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-xs text-emerald-600 font-medium">Online</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="h-[420px] overflow-y-auto px-6 py-4 space-y-4 scroll-smooth">
                        {chatMessages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot className="h-4 w-4 text-teal-700" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-teal-600 text-white rounded-br-md'
                                            : 'bg-slate-100 text-slate-800 rounded-bl-md'
                                        }`}
                                >
                                    <div
                                        className="whitespace-pre-wrap [&_strong]:font-bold [&_code]:text-xs [&_code]:bg-black/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded"
                                        dangerouslySetInnerHTML={{
                                            __html: msg.content
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/`(.*?)`/g, '<code>$1</code>')
                                                .replace(/\n/g, '<br/>'),
                                        }}
                                    />
                                    <p
                                        className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-teal-200' : 'text-slate-400'
                                            }`}
                                    >
                                        {msg.timestamp.toLocaleTimeString('en-AU', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <User className="h-4 w-4 text-slate-600" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* AI typing */}
                        {isAiTyping && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Bot className="h-4 w-4 text-teal-700" />
                                </div>
                                <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSendMessage()
                            }}
                            className="flex items-center gap-3"
                        >
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask about funding, line items, compliance gaps..."
                                className="flex-1 h-11 px-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                                disabled={isAiTyping}
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim() || isAiTyping}
                                className="h-11 w-11 rounded-xl bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                        <p className="text-[10px] text-slate-400 mt-2 text-center">
                            All queries are logged to the NDIS Audit Trail · Data processed in Sydney, AU (ap-southeast-2)
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
