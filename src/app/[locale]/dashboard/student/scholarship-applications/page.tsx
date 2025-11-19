// SCHOLARSHIP APPLICATION TRACKING DASHBOARD - Complete Frontend
// src/app/[locale]/dashboard/student/scholarship-applications/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
    Calendar,
    Clock,
    DollarSign,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Send,
    Plus,
    TrendingUp,
    Award,
    Globe,
    Bell
} from 'lucide-react'

interface ScholarshipApplication {
    id: string
    status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted'
    appliedAt?: string
    decisionDate?: string
    personalStatement?: string
    contactEmail?: string
    gpa?: number
    notes?: string
    milestones?: any[]
    scholarship: {
        id: string
        title: string
        provider: string
        amount: string
        currency: string
        deadline: string
        country: string
        isActive: boolean
    }
    createdAt: string
    updatedAt: string
}

interface ApplicationSummary {
    total: number
    byStatus: Record<string, number>
}

export default function ScholarshipApplicationsPage() {
    const t = useTranslations('ScholarshipApplications')

    const [applications, setApplications] = useState<ScholarshipApplication[]>([])
    const [summary, setSummary] = useState<ApplicationSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedApp, setSelectedApp] = useState<ScholarshipApplication | null>(null)
    const [showDetails, setShowDetails] = useState(false)

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('updatedAt')
    const [currentPage, setCurrentPage] = useState(1)

    // Load applications
    useEffect(() => {
        fetchApplications()
    }, [statusFilter, currentPage, sortBy])

    const fetchApplications = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                status: statusFilter,
                page: currentPage.toString(),
                sortBy,
                sortOrder: 'desc'
            })

            const response = await fetch(`/api/student/scholarship-applications?${params}`)
            const data = await response.json()

            if (data.success) {
                setApplications(data.data.applications)
                setSummary(data.data.summary)
            } else {
                toast.error('Failed to load applications')
            }
        } catch (error) {
            console.error('Error fetching applications:', error)
            toast.error('Error loading applications')
        } finally {
            setLoading(false)
        }
    }

    // Filter applications by search term
    const filteredApplications = applications.filter(app =>
        app.scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Status badge styling
    const getStatusBadge = (status: string) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-700',
            submitted: 'bg-blue-100 text-blue-700',
            under_review: 'bg-yellow-100 text-yellow-700',
            accepted: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
            waitlisted: 'bg-purple-100 text-purple-700'
        }

        const icons = {
            draft: FileText,
            submitted: Send,
            under_review: Clock,
            accepted: CheckCircle,
            rejected: XCircle,
            waitlisted: AlertCircle
        }

        const Icon = icons[status as keyof typeof icons]

        return (
            <Badge className={styles[status as keyof typeof styles]}>
                <Icon className="w-3 h-3 mr-1" />
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        )
    }

    // Calculate application progress
    const getApplicationProgress = (app: ScholarshipApplication) => {
        const statusProgress = {
            draft: 25,
            submitted: 50,
            under_review: 75,
            accepted: 100,
            rejected: 100,
            waitlisted: 90
        }
        return statusProgress[app.status] || 0
    }

    // Handle application actions
    const handleViewApplication = (app: ScholarshipApplication) => {
        setSelectedApp(app)
        setShowDetails(true)
    }

    const handleDeleteApplication = async (appId: string) => {
        if (!confirm('Are you sure you want to delete this application?')) return

        try {
            const response = await fetch(`/api/student/scholarship-applications?id=${appId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                toast.success('Application deleted successfully')
                fetchApplications()
            } else {
                toast.error('Failed to delete application')
            }
        } catch (error) {
            toast.error('Error deleting application')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('title', 'Scholarship Applications')}
                    </h1>
                    <p className="text-gray-600">
                        {t('description', 'Track and manage your scholarship applications')}
                    </p>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Award className="h-8 w-8 text-blue-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Applications</p>
                                        <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Send className="h-8 w-8 text-green-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Submitted</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {(summary.byStatus.submitted || 0) + (summary.byStatus.under_review || 0)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Accepted</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {summary.byStatus.accepted || 0}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <FileText className="h-8 w-8 text-orange-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Draft</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {summary.byStatus.draft || 0}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters & Search */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search applications..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="under_review">Under Review</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="updatedAt">Last Updated</SelectItem>
                                    <SelectItem value="appliedAt">Application Date</SelectItem>
                                    <SelectItem value="deadline">Deadline</SelectItem>
                                    <SelectItem value="status">Status</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No applications found
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Start applying for scholarships to see them here
                                </p>
                                <Button asChild>
                                    <a href="/dashboard/student/scholarships">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Browse Scholarships
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredApplications.map((application) => (
                            <Card key={application.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        {/* Main Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-lg text-gray-900">
                                                        {application.scholarship.title}
                                                    </h3>
                                                    <p className="text-gray-600">
                                                        {application.scholarship.provider}
                                                    </p>
                                                </div>
                                                {getStatusBadge(application.status)}
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-3">
                                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                    <span>Progress</span>
                                                    <span>{getApplicationProgress(application)}%</span>
                                                </div>
                                                <Progress
                                                    value={getApplicationProgress(application)}
                                                    className="h-2"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div className="flex items-center text-gray-600">
                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                    {application.scholarship.amount}
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <Globe className="h-4 w-4 mr-1" />
                                                    {application.scholarship.country}
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Deadline: {new Date(application.scholarship.deadline).toLocaleDateString()}
                                                </div>
                                                {application.appliedAt && (
                                                    <div className="flex items-center text-gray-600">
                                                        <Send className="h-4 w-4 mr-1" />
                                                        Applied: {new Date(application.appliedAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 lg:flex-col">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewApplication(application)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>

                                            {application.status === 'draft' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <a href={`/dashboard/student/scholarships/${application.scholarship.id}/apply`}>
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </a>
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteApplication(application.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Application Details Modal */}
                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Application Details</DialogTitle>
                        </DialogHeader>

                        {selectedApp && (
                            <div className="space-y-6">
                                {/* Scholarship Info */}
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Scholarship Information</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h5 className="font-medium">{selectedApp.scholarship.title}</h5>
                                        <p className="text-gray-600">{selectedApp.scholarship.provider}</p>
                                        <div className="flex gap-4 mt-2 text-sm">
                                            <span>Amount: {selectedApp.scholarship.amount}</span>
                                            <span>Country: {selectedApp.scholarship.country}</span>
                                            <span>Deadline: {new Date(selectedApp.scholarship.deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Application Status */}
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Application Status</h4>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(selectedApp.status)}
                                        <Progress value={getApplicationProgress(selectedApp)} className="flex-1 h-3" />
                                        <span className="text-sm text-gray-600">
                      {getApplicationProgress(selectedApp)}% Complete
                    </span>
                                    </div>
                                </div>

                                {/* Timeline */}
                                {selectedApp.milestones && selectedApp.milestones.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-lg mb-2">Timeline</h4>
                                        <div className="space-y-2">
                                            {selectedApp.milestones.map((milestone: any, index: number) => (
                                                <div key={index} className="flex items-center gap-3 text-sm">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                    <span className="text-gray-600">
                            {new Date(milestone.date).toLocaleDateString()}
                          </span>
                                                    <span>{milestone.event}</span>
                                                    {milestone.note && (
                                                        <span className="text-gray-500">- {milestone.note}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Personal Statement */}
                                {selectedApp.personalStatement && (
                                    <div>
                                        <h4 className="font-semibold text-lg mb-2">Personal Statement</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700">{selectedApp.personalStatement}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {selectedApp.notes && (
                                    <div>
                                        <h4 className="font-semibold text-lg mb-2">Notes</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700">{selectedApp.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}