'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileWarning, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Claim } from '@prisma/client'

interface ClaimsClientProps {
    claims: Claim[]
}

export default function ClaimsClient({ claims }: ClaimsClientProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isExporting, setIsExporting] = useState(false)

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

    const handleExport = async () => {
        if (selectedIds.size === 0) return

        setIsExporting(true)
        try {
            const response = await fetch('/api/claims/export-proda', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ claimIds: Array.from(selectedIds) })
            })

            if (!response.ok) {
                throw new Error('Export generation failed')
            }

            // Create a Blob file URL natively in browser memory
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)

            // Generate invisible anchor and force a native click to download
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = 'proda_claims.csv' // Name matching API Header Content-Disposition

            document.body.appendChild(a)
            a.click()

            // Clean up browser RAM
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success('PRODA CSV Export successful')
        } catch (error) {
            console.error('Export Error:', error)
            toast.error('Failed to generate PRODA Export. Please try again.')
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

                <Button
                    onClick={handleExport}
                    disabled={selectedIds.size === 0 || isExporting}
                    className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all"
                >
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? 'Generating...' : `Export to PRODA CSV (${selectedIds.size})`}
                </Button>
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
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                                            </span>
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
        </div>
    )
}
