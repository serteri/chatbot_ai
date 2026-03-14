'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileWarning, AlertCircle, Upload, FileSpreadsheet, Check, X, AlertTriangle, Edit, Trash2, MoreVertical, Eye } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { format, isValid } from 'date-fns'
import { Claim } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog'

interface ClaimsClientProps {
    claims: Claim[]
}

export default function ClaimsClient({ claims }: ClaimsClientProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isExporting, setIsExporting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isCommitting, setIsCommitting] = useState(false)
    const [previewData, setPreviewData] = useState<any[] | null>(null)
    const [rawRows, setRawRows] = useState<any[] | null>(null)
    const [rawHeaders, setRawHeaders] = useState<string[] | null>(null)
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
    const [importSummary, setImportSummary] = useState<any>(null)
    const [editingClaim, setEditingClaim] = useState<Claim | null>(null)
    const [deletingClaim, setDeletingClaim] = useState<Claim | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [formData, setFormData] = useState<Partial<Claim>>({})
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // Sync formData when editingClaim changes
    useEffect(() => {
        if (editingClaim) {
            setFormData({
                participantName: editingClaim.participantName,
                participantNdisNumber: editingClaim.participantNdisNumber,
                supportItemNumber: editingClaim.supportItemNumber,
                totalClaimAmount: editingClaim.totalClaimAmount,
            })
        }
    }, [editingClaim])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        
        if (name === 'totalClaimAmount') {
            // Remove leading zeros and convert to float
            // If the user clears the input, fallback to 0
            const cleanedValue = value.replace(/^0+/, '') || '0'
            setFormData(prev => ({
                ...prev,
                [name]: parseFloat(cleanedValue)
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(claims.map(c => c.id)))
        } else {
            setSelectedIds(new Set())
        }
    }

    const handleSelectOne = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds)
        if (checked) {
            newSelected.add(id)
        } else {
            newSelected.delete(id)
        }
        setSelectedIds(newSelected)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/claims/bulk-import', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed')
            }

            // Store raw results for manual mapping
            setRawRows(result.rawRows)
            setRawHeaders(result.headers)

            // Use server-side autoMapping (already normalised) — fall back to client-side if missing
            const initialMapping: Record<string, string> = result.autoMapping
                ? { ...result.autoMapping }
                : {}
            if (Object.keys(initialMapping).length === 0 && result.headers) {
                result.headers.forEach((h: string) => {
                    const mapped = findAutoMapping(h)
                    if (mapped && !initialMapping[mapped]) initialMapping[mapped] = h
                })
            }
            setColumnMapping(initialMapping)
            setPreviewData(result.data)
            setImportSummary(result.summary)
            toast.success('File parsed successfully. Please review the data.')
        } catch (error: any) {
            console.error('Upload Error:', error)
            toast.error(error.message || 'Failed to parse file.')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleCommit = async () => {
        if (!previewData) return
        
        const validRows = previewData.filter(r => r._errors.length === 0)
        if (validRows.length === 0) {
            toast.error('No valid rows to import.')
            return
        }

        setIsCommitting(true)
        const formData = new FormData()
        formData.append('action', 'commit')
        formData.append('data', JSON.stringify(validRows))

        try {
            const response = await fetch('/api/claims/bulk-import', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) throw new Error('Commit failed')

            toast.success(`Successfully imported ${validRows.length} claims.`)
            setPreviewData(null)
            router.refresh()
        } catch (error) {
            toast.error('Failed to save claims.')
        } finally {
            setIsCommitting(false)
        }
    }

    // Mirror the server-side normaliseHeader so client lookups always match
    const normaliseHeader = (raw: string) =>
        raw
            .replace(/^\uFEFF/, '')
            .replace(/[\u00A0\u200B\u202F]/g, ' ')
            .replace(/[^a-zA-Z0-9 ]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase()

    const findAutoMapping = (header: string) => {
        const h = normaliseHeader(header)
        if (['participant name', 'participant', 'name', 'client name', 'full name'].includes(h)) return 'participantName'
        if (['ndis number', 'ndis no', 'participantid', 'ndis id', 'ndis #', 'ndis'].includes(h)) return 'participantNdisNumber'
        if (['support item', 'support item number', 'support item no', 'item code', 'support ite'].includes(h)) return 'supportItemNumber'
        if (['date', 'support date', 'service date', 'activity date'].includes(h)) return 'supportDeliveredDate'
        if (['quantity', 'hours', 'qty', 'units'].includes(h)) return 'quantityDelivered'
        if (['unitprice', 'unit price', 'price', 'rate'].includes(h)) return 'unitPrice'
        return null
    }

    const updateMapping = (field: string, header: string) => {
        const newMapping = { ...columnMapping, [field]: header }
        setColumnMapping(newMapping)
        
        if (!rawRows) return

        // Recalculate preview data based on new mapping
        const newPreview = rawRows.map((row: any, index: number) => {
            const entry: any = { _originalRow: index + 2, _errors: [] }
            
            // Apply new mapping from RAW row data (keys are server-normalised)
            Object.entries(newMapping).forEach(([field, header]) => {
                let val = row[header]
                if (typeof val === 'string') {
                    val = val.trim()
                    if (field === 'unitPrice' || field === 'quantityDelivered') {
                        val = val.replace(/[$,\s]/g, '')
                    }
                }
                entry[field] = val
            })

            // Basic validation re-run
            if (!entry.participantName) entry._errors.push('No Name')
            if (!entry.participantNdisNumber) entry._errors.push('No NDIS ID')
            if (!entry.supportItemNumber) entry._errors.push('No Item')

            // Strip currency symbols before parsing
            const cleanNum = (v: any) => parseFloat(String(v ?? '').replace(/[$,\s]/g, ''))
            const price = cleanNum(entry.unitPrice)
            entry.unitPrice = isNaN(price) ? entry.unitPrice : price
            if (isNaN(price)) {
                entry._errors.push('Invalid Price')
            } else if (price > 10000) {
                entry._errors.push(`Extreme Price: $${price.toLocaleString()}`)
            }

            // Date Processing (client mirror of server logic)
            const rawDateVal = entry.supportDeliveredDate
            if (rawDateVal !== undefined && rawDateVal !== '' && rawDateVal !== null) {
                const dateStr = String(rawDateVal).trim()
                // Try DD/MM/YYYY → ISO formats → full ISO string → native
                const formats = ['dd/MM/yyyy', 'yyyy-MM-dd', 'd/M/yyyy', 'dd-MM-yyyy']
                let parsedDate: Date | null = null
                for (const fmt of formats) {
                    const p = parseDate(dateStr, fmt, new Date())
                    if (isValid(p)) { parsedDate = p; break }
                }
                if (!parsedDate) { const p = new Date(dateStr); if (isValid(p)) parsedDate = p }
                if (parsedDate) {
                    entry.supportDeliveredDate = parsedDate.toISOString()
                } else {
                    entry._errors.push('Bad Date')
                }
            } else {
                entry._errors.push('No Date')
            }

            return entry
        })

        setPreviewData(newPreview)
        setImportSummary({
            total: newPreview.length,
            valid: newPreview.filter(r => r._errors.length === 0).length,
            invalid: newPreview.filter(r => r._errors.length > 0).length
        })
    }

    const handleDelete = async () => {
        if (!deletingClaim) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/claims/${deletingClaim.id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Delete failed')

            toast.success('Claim removed successfully')
            setDeletingClaim(null)
            router.refresh()
        } catch (error) {
            toast.error('Failed to delete claim')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleVerify = async (id: string) => {
        setIsVerifying(true)
        try {
            const response = await fetch(`/api/claims/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...formData,
                    status: 'VERIFIED' 
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.details || errorData.error || 'Verification failed')
            }

            toast.success('Claim updated and verified successfully')
            setEditingClaim(null)
            router.refresh()
        } catch (error) {
            console.error('Verification Error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to update claim')
        } finally {
            setIsVerifying(false)
        }
    }

    const handleExport = () => {
        // Filter claims based on selection and status (DRAFT or VERIFIED)
        const claimsToExport = claims.filter(c => 
            selectedIds.has(c.id) && 
            (c.status === 'VERIFIED' || c.status === 'DRAFT')
        )

        if (claimsToExport.length === 0) {
            toast.error("No claims available to export.")
            return
        }

        setIsExporting(true)
        try {
            // PRODA compatible headers
            const headers = [
                'Participant Name', 
                'NDIS Number', 
                'Service Date', 
                'Item Code', 
                'Hours', 
                'Unit Price', 
                'Total'
            ]
            
            // Map rows and escape data with quotes
            const rows = claimsToExport.map(c => [
                c.participantName,
                c.participantNdisNumber,
                format(new Date(c.supportDeliveredDate), 'dd/MM/yyyy'),
                c.supportItemNumber,
                c.quantityDelivered.toFixed(2),
                c.unitPrice.toFixed(2),
                c.totalClaimAmount.toFixed(2)
            ].map(val => `"${val}"`).join(','))

            const csvContent = [headers.join(','), ...rows].join('\n')
            
            // Create blob and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            
            link.href = url
            link.setAttribute('download', 'NDIS_Claims_Export.csv')
            document.body.appendChild(link)
            
            link.click()
            
            // Cleanup
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            
            toast.success(`Exported ${claimsToExport.length} claims successfully.`)
        } catch (error) {
            console.error('Export Error:', error)
            toast.error("An error occurred during export.")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices & Claims</h1>
                    <p className="text-gray-600">Prepare and track your NDIS Bulk Payment strings</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                    />
                    
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? 'Uploading...' : 'Bulk Upload'}
                    </Button>

                    <Button
                        onClick={handleExport}
                        disabled={selectedIds.size === 0 || isExporting}
                        className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        {isExporting ? 'Generating...' : `Export to PRODA CSV (${selectedIds.size})`}
                    </Button>
                </div>
            </div>

            <div className="mb-6 flex items-center justify-end">
                <a 
                    href="/templates/claims-import-template.csv" 
                    download 
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1.5 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 transition-colors"
                >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Download CSV Template for Bulk Upload
                </a>
            </div>

            <Card className="border-slate-200 shadow-sm border-t-4 border-t-teal-500">
                <CardHeader className="bg-teal-50/50 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                        <FileWarning className="w-5 h-5 text-teal-600 mt-0.5" />
                        <div>
                            <CardTitle className="text-lg text-teal-900">PRODA Preparation Ready</CardTitle>
                            <CardDescription className="text-teal-700 font-medium">
                                Data exported here is securely tied to your active schema and natively maps to the rigid PRODA Bulk Upload Columns.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-200">
                                <tr>
                                    <th scope="col" className="p-4 w-4">
                                        <div className="flex items-center">
                                            <Checkbox
                                                checked={selectedIds.size === claims.length && claims.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 font-semibold">Participant</th>
                                    <th className="px-6 py-3 font-semibold">NDIS No.</th>
                                    <th className="px-6 py-3 font-semibold">Support Item</th>
                                    <th className="px-6 py-3 font-semibold">Date</th>
                                    <th className="px-6 py-3 font-semibold">Total Amount</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {claims.map((claim) => (
                                    <tr key={claim.id} className="bg-white hover:bg-teal-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <Checkbox
                                                    checked={selectedIds.has(claim.id)}
                                                    onCheckedChange={(checked) => handleSelectOne(claim.id, checked === true)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {claim.participantName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {claim.participantNdisNumber}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-mono text-xs font-semibold">
                                            {claim.supportItemNumber}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {format(new Date(claim.supportDeliveredDate), 'MMM do, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            ${claim.totalClaimAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                claim.status === 'VERIFIED' ? "bg-green-100 text-green-800" :
                                                claim.status === 'EXPORTED' ? "bg-blue-100 text-blue-800" :
                                                "bg-amber-100 text-amber-800"
                                            )}>
                                                {claim.status.charAt(0).toUpperCase() + claim.status.slice(1).toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditingClaim(claim)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Verify/Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => setDeletingClaim(claim)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {claims.length === 0 && (
                            <div className="py-12 text-center flex flex-col items-center">
                                <AlertCircle className="h-8 w-8 text-slate-400 mb-3" />
                                <p className="text-slate-500 font-medium text-sm">No drafted claims available.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* PREVIEW MODAL */}
            <Dialog open={!!previewData} onOpenChange={(open) => !open && setPreviewData(null)}>
                <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                            Review Imported Data
                        </DialogTitle>
                        <DialogDescription className="pb-4">
                            We've mapped your file headers. Please verify the data below before saving.
                        </DialogDescription>

                        {/* COLUMN MAPPING SELECTORS */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pb-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                            {[
                                { label: 'Name', key: 'participantName' },
                                { label: 'NDIS ID', key: 'participantNdisNumber' },
                                { label: 'Item Code', key: 'supportItemNumber' },
                                { label: 'Date', key: 'supportDeliveredDate' },
                                { label: 'Qty', key: 'quantityDelivered' },
                                { label: 'Price', key: 'unitPrice' }
                            ].map(field => (
                                <div key={field.key} className="space-y-1">
                                    <label className="text-[10px] font-bold text-blue-900 uppercase tracking-tight">{field.label}</label>
                                    <select 
                                        className="w-full text-xs p-1.5 rounded border bg-white border-blue-200 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={columnMapping[field.key] || ''}
                                        onChange={(e) => updateMapping(field.key, e.target.value)}
                                    >
                                        <option value="">-- Select Column --</option>
                                        {rawHeaders?.map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </DialogHeader>

                    {importSummary && (
                        <div className="px-6 py-2 flex gap-4 border-b bg-slate-50">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                <Check className="w-4 h-4 text-green-600" />
                                {importSummary.valid} Valid Rows
                            </div>
                            {importSummary.invalid > 0 && (
                                <div className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
                                    <AlertTriangle className="w-4 h-4" />
                                    {importSummary.invalid} Rows with errors (will be skipped)
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex-1 overflow-auto p-0">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-100 text-slate-700 uppercase font-bold border-b z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 w-12 text-center">Row</th>
                                    <th className="px-4 py-3">Participant</th>
                                    <th className="px-4 py-3">NDIS ID</th>
                                    <th className="px-4 py-3">Item Code</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3 text-red-600">Status/Errors</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {previewData?.map((row, i) => (
                                    <tr key={i} className={`hover:bg-slate-50 ${row._errors.length > 0 ? 'bg-red-50/30' : ''}`}>
                                        <td className="px-4 py-3 text-center text-slate-400">{row._originalRow}</td>
                                        <td className="px-4 py-3 font-medium">{row.participantName || '-'}</td>
                                        <td className="px-4 py-3">{row.participantNdisNumber || '-'}</td>
                                        <td className="px-4 py-3 font-mono text-[10px]">{row.supportItemNumber || '-'}</td>
                                        <td className="px-4 py-3">
                                            {row.supportDeliveredDate ? format(new Date(row.supportDeliveredDate), 'dd/MM/yyyy') : '-'}
                                        </td>
                                        <td className="px-4 py-3 font-semibold">${parseFloat(row.unitPrice || 0).toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            {row._errors.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {row._errors.map((err: string, ei: number) => (
                                                        <span key={ei} className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-bold">
                                                            {err}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Check className="w-4 h-4 text-green-500" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <DialogFooter className="p-6 border-t bg-slate-50 gap-3">
                        <Button variant="outline" onClick={() => setPreviewData(null)} disabled={isCommitting}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCommit} 
                            disabled={isCommitting || !importSummary || importSummary.valid === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                        >
                            {isCommitting ? 'Saving...' : `Confirm & Import ${importSummary?.valid || 0} Claims`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* DELETE CONFIRMATION MODAL */}
            <AlertDialog open={!!deletingClaim} onOpenChange={(open) => !open && setDeletingClaim(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to remove this claim?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the claim for <strong>{deletingClaim?.participantName}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Claim'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* EDIT/VERIFY MODAL - PREMIUM ENTERPRISE UPGRADE */}
            <Dialog open={!!editingClaim} onOpenChange={(open) => !open && setEditingClaim(null)}>
                <DialogContent 
                    className={cn(
                        "max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl z-[100]",
                        "dark:bg-[#0a0a0a] bg-white",
                        "transition-all duration-300 ease-out scale-100"
                    )}
                    overlayClassName="z-[100] backdrop-blur-sm bg-black/60"
                >
                    <div className="p-8 space-y-8">
                        <DialogHeader className="space-y-2">
                            <div className="flex items-center justify-between">
                                <DialogTitle className="text-2xl font-black tracking-tight dark:text-white text-slate-900 flex items-center gap-2">
                                    <Edit className="w-6 h-6 text-blue-500" />
                                    Edit Claim Details
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                Audit and verify information for <span className="text-blue-600 dark:text-blue-400 font-bold">{editingClaim?.participantName}</span>.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                            {/* GROUP 1: PARTICIPANT INFO */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl bg-slate-50 dark:bg-white/5 border dark:border-white/10 border-slate-100 shadow-sm transition-all hover:shadow-md">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                                        Participant Name
                                    </Label>
                                    <Input 
                                        name="participantName"
                                        value={formData.participantName || ''} 
                                        onChange={handleChange}
                                        className="h-11 dark:bg-black/40 border-slate-200 dark:border-white/10 rounded-lg focus:ring-blue-500/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                                        NDIS Number
                                    </Label>
                                    <Input 
                                        name="participantNdisNumber"
                                        value={formData.participantNdisNumber || ''} 
                                        onChange={handleChange}
                                        className="h-11 dark:bg-black/40 border-slate-200 dark:border-white/10 rounded-lg focus:ring-blue-500/50 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            {/* GROUP 2: SERVICE DETAILS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl bg-slate-50 dark:bg-white/5 border dark:border-white/10 border-slate-100 shadow-sm transition-all hover:shadow-md">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                                        Support Item Code
                                    </Label>
                                    <Input 
                                        name="supportItemNumber"
                                        value={formData.supportItemNumber || ''} 
                                        onChange={handleChange}
                                        className="h-11 dark:bg-black/40 border-slate-200 dark:border-white/10 rounded-lg focus:ring-blue-500/50 transition-all font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                                        Total Claim Amount
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <Input 
                                            name="totalClaimAmount"
                                            type="number"
                                            step="0.01"
                                            value={formData.totalClaimAmount || 0} 
                                            onChange={handleChange}
                                            className="h-11 pl-7 dark:bg-black/40 border-slate-200 dark:border-white/10 rounded-lg focus:ring-blue-500/50 transition-all font-bold text-lg text-blue-600 dark:text-blue-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2">
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    CLAIM STATUS
                                </span>
                                <Badge 
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                                        editingClaim?.status === 'VERIFIED' 
                                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    )}
                                    variant="outline"
                                >
                                    {editingClaim?.status}
                                </Badge>
                            </div>
                        </div>

                        <DialogFooter className="gap-3 pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setEditingClaim(null)}
                                className="h-12 px-8 rounded-xl border-slate-200 dark:border-white/10 dark:hover:bg-white/5 transition-all font-bold tracking-tight"
                            >
                                Close
                            </Button>
                            {editingClaim?.status !== 'VERIFIED' && (
                                <Button 
                                    className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all font-bold tracking-tight active:scale-95"
                                    onClick={() => editingClaim && handleVerify(editingClaim.id)}
                                    disabled={isVerifying}
                                >
                                    {isVerifying ? (
                                        <span className="flex items-center gap-2 animate-pulse">
                                            Applying Seal...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Check className="w-5 h-5" />
                                            Verify & Seal Claim
                                        </span>
                                    )}
                                </Button>
                            )}
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
