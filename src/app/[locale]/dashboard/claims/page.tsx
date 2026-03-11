'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileWarning, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

// Mock mirror array matching the backend database
const MOCK_UI_CLAIMS = [
    {
        id: 'clm_001A9F',
        participant: 'John Doe',
        ndisNumber: '431009876',
        supportItem: '01_011_0107_1_1',
        date: new Date('2025-10-15T09:00:00.000Z'),
        amount: 294.61,
        status: 'draft'
    },
    {
        id: 'clm_002B8E',
        participant: 'John Doe',
        ndisNumber: '431009876',
        supportItem: '04_104_0125_6_1',
        date: new Date('2025-10-16T14:30:00.000Z'),
        amount: 43.00,
        status: 'draft'
    },
    {
        id: 'clm_003C7D',
        participant: 'Jane Smith',
        ndisNumber: '431001111',
        supportItem: '15_056_0128_1_3',
        date: new Date('2025-10-18T10:00:00.000Z'),
        amount: 193.99,
        status: 'draft'
    }
]

export default function ClaimsDashboardPage() {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isExporting, setIsExporting] = useState(false)

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(MOCK_UI_CLAIMS.map(c => c.id)))
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
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? 'Generating...' : `Export to PRODA CSV (${selectedIds.size})`}
                </Button>
            </div>

            <Card className="border-gray-200 shadow-sm border-t-4 border-t-emerald-500">
                <CardHeader className="bg-emerald-50/50 pb-4 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                        <FileWarning className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div>
                            <CardTitle className="text-lg text-emerald-900">PRODA Preparation Ready</CardTitle>
                            <CardDescription className="text-emerald-700 font-medium">
                                Data exported here is pre-formatted to match the rigid 12 column PRODA Bulk Upload Specification natively.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase border-b border-gray-200">
                                <tr>
                                    <th scope="col" className="p-4 w-4">
                                        <div className="flex items-center">
                                            <Checkbox
                                                checked={selectedIds.size === MOCK_UI_CLAIMS.length && MOCK_UI_CLAIMS.length > 0}
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
                            <tbody className="divide-y divide-gray-100">
                                {MOCK_UI_CLAIMS.map((claim) => (
                                    <tr key={claim.id} className="bg-white hover:bg-blue-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <Checkbox
                                                    checked={selectedIds.has(claim.id)}
                                                    onCheckedChange={(checked) => handleSelectOne(claim.id, checked === true)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {claim.participant}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {claim.ndisNumber}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                                            {claim.supportItem}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {format(claim.date, 'MMM do, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ${claim.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                Draft
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {MOCK_UI_CLAIMS.length === 0 && (
                            <div className="py-12 text-center flex flex-col items-center">
                                <AlertCircle className="h-8 w-8 text-gray-400 mb-3" />
                                <p className="text-gray-500 font-medium text-sm">No drafted claims available.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
