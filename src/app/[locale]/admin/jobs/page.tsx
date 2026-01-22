'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Loader2,
    Shield,
    Briefcase,
    Plus,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    MapPin,
    Clock,
    DollarSign,
    ArrowLeft,
    Globe,
    Building,
    Calendar,
    Mail
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface JobPosting {
    id: string
    title: string
    department: string
    location: string
    locationType: string
    employmentType: string
    salaryMin?: number
    salaryMax?: number
    salaryCurrency: string
    salaryPeriod: string
    showSalary: boolean
    description: string
    responsibilities?: string
    requirements?: string
    niceToHave?: string
    benefits?: string
    applicationUrl?: string
    applicationEmail?: string
    language: string
    isPublished: boolean
    isFeatured: boolean
    viewCount: number
    publishedAt?: string
    expiresAt?: string
    createdAt: string
    updatedAt: string
}

const emptyJob: Partial<JobPosting> = {
    title: '',
    department: '',
    location: '',
    locationType: 'remote',
    employmentType: 'full-time',
    salaryMin: undefined,
    salaryMax: undefined,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    showSalary: false,
    description: '',
    responsibilities: '',
    requirements: '',
    niceToHave: '',
    benefits: '',
    applicationUrl: '',
    applicationEmail: '',
    language: 'en',
    isPublished: false,
    isFeatured: false,
    expiresAt: ''
}

export default function AdminJobsPage() {
    const [authenticated, setAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [authLoading, setAuthLoading] = useState(false)
    const [jobs, setJobs] = useState<JobPosting[]>([])
    const [loading, setLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
    const [formData, setFormData] = useState<Partial<JobPosting>>(emptyJob)
    const [saving, setSaving] = useState(false)

    // Auth check
    const checkAuth = async () => {
        setAuthLoading(true)
        try {
            const response = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            })
            const data = await response.json()
            if (data.success) {
                setAuthenticated(true)
                toast.success('Admin panel access granted')
                fetchJobs()
            } else {
                toast.error('Wrong password')
            }
        } catch {
            toast.error('Connection error')
        } finally {
            setAuthLoading(false)
        }
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        checkAuth()
    }

    // Fetch jobs
    const fetchJobs = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/admin/jobs')
            const data = await response.json()
            if (data.jobs) {
                setJobs(data.jobs)
            }
        } catch {
            toast.error('Failed to fetch jobs')
        } finally {
            setLoading(false)
        }
    }

    // Open create dialog
    const handleCreate = () => {
        setSelectedJob(null)
        setFormData(emptyJob)
        setDialogOpen(true)
    }

    // Open edit dialog
    const handleEdit = (job: JobPosting) => {
        setSelectedJob(job)
        setFormData({
            ...job,
            expiresAt: job.expiresAt ? job.expiresAt.split('T')[0] : ''
        })
        setDialogOpen(true)
    }

    // Save job
    const handleSave = async () => {
        if (!formData.title || !formData.department || !formData.description) {
            toast.error('Please fill required fields (Title, Department, Description)')
            return
        }

        setSaving(true)
        try {
            const url = selectedJob ? `/api/admin/jobs/${selectedJob.id}` : '/api/admin/jobs'
            const method = selectedJob ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()
            if (data.success) {
                toast.success(selectedJob ? 'Job updated' : 'Job created')
                setDialogOpen(false)
                fetchJobs()
            } else {
                toast.error(data.error || 'Failed to save')
            }
        } catch {
            toast.error('Failed to save job')
        } finally {
            setSaving(false)
        }
    }

    // Toggle publish
    const handleTogglePublish = async (job: JobPosting) => {
        try {
            const response = await fetch(`/api/admin/jobs/${job.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...job,
                    isPublished: !job.isPublished,
                    publishedAt: !job.isPublished ? new Date().toISOString() : job.publishedAt
                })
            })
            const data = await response.json()
            if (data.success) {
                toast.success(job.isPublished ? 'Job unpublished' : 'Job published')
                fetchJobs()
            }
        } catch {
            toast.error('Failed to update job')
        }
    }

    // Delete job
    const handleDelete = async () => {
        if (!selectedJob) return
        try {
            const response = await fetch(`/api/admin/jobs/${selectedJob.id}`, {
                method: 'DELETE'
            })
            const data = await response.json()
            if (data.success) {
                toast.success('Job deleted')
                setDeleteDialogOpen(false)
                setSelectedJob(null)
                fetchJobs()
            }
        } catch {
            toast.error('Failed to delete job')
        }
    }

    // Auth screen
    if (!authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                        <CardTitle className="text-2xl">Job Postings Admin</CardTitle>
                        <CardDescription>
                            Enter password to access job management
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label htmlFor="password">Admin Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={authLoading}>
                                {authLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</>
                                ) : (
                                    <><Shield className="mr-2 h-4 w-4" /> Login</>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/tr/admin">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
                            <p className="text-gray-600">Manage career opportunities</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" /> New Job Posting
                        </Button>
                        <Button variant="outline" onClick={() => setAuthenticated(false)}>
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{jobs.length}</div>
                            <div className="text-sm text-gray-500">Total Jobs</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">
                                {jobs.filter(j => j.isPublished).length}
                            </div>
                            <div className="text-sm text-gray-500">Published</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-yellow-600">
                                {jobs.filter(j => !j.isPublished).length}
                            </div>
                            <div className="text-sm text-gray-500">Draft</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-blue-600">
                                {jobs.reduce((sum, j) => sum + j.viewCount, 0)}
                            </div>
                            <div className="text-sm text-gray-500">Total Views</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Job List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : jobs.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Briefcase className="h-16 w-16 text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Job Postings Yet</h3>
                            <p className="text-gray-500 mb-6">Create your first job posting to get started</p>
                            <Button onClick={handleCreate}>
                                <Plus className="h-4 w-4 mr-2" /> Create Job Posting
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <Card key={job.id} className={`${!job.isPublished ? 'border-yellow-200 bg-yellow-50/50' : ''}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold">{job.title}</h3>
                                                {job.isPublished ? (
                                                    <Badge className="bg-green-100 text-green-700">Published</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Draft</Badge>
                                                )}
                                                {job.isFeatured && (
                                                    <Badge className="bg-blue-100 text-blue-700">Featured</Badge>
                                                )}
                                                <Badge variant="outline" className="text-xs">
                                                    <Globe className="h-3 w-3 mr-1" />
                                                    {job.language.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Building className="h-4 w-4" /> {job.department}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" /> {job.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" /> {job.employmentType}
                                                </span>
                                                {job.showSalary && job.salaryMin && (
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4" />
                                                        {job.salaryMin.toLocaleString()}-{job.salaryMax?.toLocaleString()} {job.salaryCurrency}/{job.salaryPeriod}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 text-gray-400">
                                                    <Eye className="h-4 w-4" /> {job.viewCount} views
                                                </span>
                                            </div>
                                            {job.expiresAt && (
                                                <div className="mt-2 text-sm text-orange-600">
                                                    <Calendar className="h-4 w-4 inline mr-1" />
                                                    Expires: {new Date(job.expiresAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleTogglePublish(job)}
                                                title={job.isPublished ? 'Unpublish' : 'Publish'}
                                            >
                                                {job.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(job)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => {
                                                    setSelectedJob(job)
                                                    setDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create/Edit Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border shadow-2xl">
                        <DialogHeader className="border-b pb-4 mb-4">
                            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                </div>
                                {selectedJob ? 'Edit Job Posting' : 'Create New Job Posting'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 mt-2">
                                Fill in the job details below. The posting will be displayed in the language you write it.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            {/* Basic Info Section */}
                            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Label htmlFor="title" className="text-gray-700 font-medium">Job Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Senior Software Engineer"
                                            className="mt-1.5 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="department" className="text-gray-700 font-medium">Department *</Label>
                                        <Input
                                            id="department"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="e.g. Engineering"
                                            className="mt-1.5 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="language" className="text-gray-700 font-medium">Language</Label>
                                        <Select
                                            value={formData.language}
                                            onValueChange={(value) => setFormData({ ...formData, language: value })}
                                        >
                                            <SelectTrigger className="mt-1.5 bg-white border-gray-300 text-gray-900">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border shadow-lg">
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="tr">Turkish</SelectItem>
                                                <SelectItem value="de">German</SelectItem>
                                                <SelectItem value="es">Spanish</SelectItem>
                                                <SelectItem value="fr">French</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Type Section */}
                            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                                <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Location & Employment
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="location" className="text-gray-700 font-medium">Location</Label>
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="e.g. Istanbul, Turkey"
                                            className="mt-1.5 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="locationType" className="text-gray-700 font-medium">Location Type</Label>
                                        <Select
                                            value={formData.locationType}
                                            onValueChange={(value) => setFormData({ ...formData, locationType: value })}
                                        >
                                            <SelectTrigger className="mt-1.5 bg-white border-gray-300 text-gray-900">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border shadow-lg">
                                                <SelectItem value="remote">Remote</SelectItem>
                                                <SelectItem value="onsite">On-site</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="employmentType" className="text-gray-700 font-medium">Employment Type</Label>
                                        <Select
                                            value={formData.employmentType}
                                            onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                                        >
                                            <SelectTrigger className="mt-1.5 bg-white border-gray-300 text-gray-900">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border shadow-lg">
                                                <SelectItem value="full-time">Full-time</SelectItem>
                                                <SelectItem value="part-time">Part-time</SelectItem>
                                                <SelectItem value="contract">Contract</SelectItem>
                                                <SelectItem value="internship">Internship</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Salary Section */}
                            <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wide flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Salary Information
                                    </h3>
                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-purple-200">
                                        <Switch
                                            checked={formData.showSalary}
                                            onCheckedChange={(checked) => setFormData({ ...formData, showSalary: checked })}
                                        />
                                        <span className="text-sm text-gray-600">Show on posting</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <Label htmlFor="salaryMin" className="text-gray-700 font-medium">Min Salary</Label>
                                        <Input
                                            id="salaryMin"
                                            type="number"
                                            value={formData.salaryMin || ''}
                                            onChange={(e) => setFormData({ ...formData, salaryMin: parseInt(e.target.value) || undefined })}
                                            placeholder="50000"
                                            className="mt-1.5 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="salaryMax" className="text-gray-700 font-medium">Max Salary</Label>
                                        <Input
                                            id="salaryMax"
                                            type="number"
                                            value={formData.salaryMax || ''}
                                            onChange={(e) => setFormData({ ...formData, salaryMax: parseInt(e.target.value) || undefined })}
                                            placeholder="80000"
                                            className="mt-1.5 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="salaryCurrency" className="text-gray-700 font-medium">Currency</Label>
                                        <Select
                                            value={formData.salaryCurrency}
                                            onValueChange={(value) => setFormData({ ...formData, salaryCurrency: value })}
                                        >
                                            <SelectTrigger className="mt-1.5 bg-white border-gray-300 text-gray-900">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border shadow-lg">
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="TRY">TRY</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="salaryPeriod" className="text-gray-700 font-medium">Period</Label>
                                        <Select
                                            value={formData.salaryPeriod}
                                            onValueChange={(value) => setFormData({ ...formData, salaryPeriod: value })}
                                        >
                                            <SelectTrigger className="mt-1.5 bg-white border-gray-300 text-gray-900">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border shadow-lg">
                                                <SelectItem value="yearly">Yearly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="hourly">Hourly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Job Details Section */}
                            <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                                <h3 className="text-sm font-semibold text-orange-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Job Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="description" className="text-gray-700 font-medium">Job Description *</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe the role, team, and what makes this opportunity exciting..."
                                            rows={5}
                                            className="mt-1.5 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="responsibilities" className="text-gray-700 font-medium">Key Responsibilities</Label>
                                        <Textarea
                                            id="responsibilities"
                                            value={formData.responsibilities}
                                            onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                                            placeholder="• Lead development of new features&#10;• Collaborate with product team&#10;• Review code and mentor junior developers"
                                            rows={4}
                                            className="mt-1.5 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="requirements" className="text-gray-700 font-medium">Requirements</Label>
                                        <Textarea
                                            id="requirements"
                                            value={formData.requirements}
                                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                            placeholder="• 5+ years of experience with React&#10;• Strong understanding of TypeScript&#10;• Experience with cloud services"
                                            rows={4}
                                            className="mt-1.5 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="niceToHave" className="text-gray-700 font-medium">Nice to Have</Label>
                                        <Textarea
                                            id="niceToHave"
                                            value={formData.niceToHave}
                                            onChange={(e) => setFormData({ ...formData, niceToHave: e.target.value })}
                                            placeholder="• Experience with AI/ML&#10;• Open source contributions&#10;• Startup experience"
                                            rows={3}
                                            className="mt-1.5 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="benefits" className="text-gray-700 font-medium">Benefits & Perks</Label>
                                        <Textarea
                                            id="benefits"
                                            value={formData.benefits}
                                            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                            placeholder="• Competitive salary&#10;• Remote work flexibility&#10;• Health insurance&#10;• Learning budget"
                                            rows={3}
                                            className="mt-1.5 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Application Section */}
                            <div className="bg-cyan-50 rounded-xl p-5 border border-cyan-100">
                                <h3 className="text-sm font-semibold text-cyan-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Application Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="applicationUrl" className="text-gray-700 font-medium">Application URL</Label>
                                        <Input
                                            id="applicationUrl"
                                            value={formData.applicationUrl}
                                            onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                                            placeholder="https://..."
                                            className="mt-1.5 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="applicationEmail" className="text-gray-700 font-medium">Application Email</Label>
                                        <Input
                                            id="applicationEmail"
                                            type="email"
                                            value={formData.applicationEmail}
                                            onChange={(e) => setFormData({ ...formData, applicationEmail: e.target.value })}
                                            placeholder="careers@company.com"
                                            className="mt-1.5 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Settings Section */}
                            <div className="bg-gray-100 rounded-xl p-5 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Publishing Settings
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="expiresAt" className="text-gray-700 font-medium">Expiry Date (Optional)</Label>
                                        <Input
                                            id="expiresAt"
                                            type="date"
                                            value={formData.expiresAt?.split('T')[0] || ''}
                                            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                            className="mt-1.5 bg-white border-gray-300 text-gray-900"
                                        />
                                    </div>
                                    <div className="flex items-end gap-6">
                                        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-gray-200">
                                            <Switch
                                                checked={formData.isFeatured}
                                                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                                            />
                                            <span className="text-sm text-gray-700 font-medium">Featured</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-green-100 px-4 py-2.5 rounded-lg border border-green-200">
                                            <Switch
                                                checked={formData.isPublished}
                                                onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                                            />
                                            <span className="text-sm text-green-700 font-medium">Publish Now</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="border-t pt-4 mt-4">
                            <Button variant="outline" onClick={() => setDialogOpen(false)} className="text-gray-700">
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {saving ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                ) : (
                                    selectedJob ? 'Update Job' : 'Create Job'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="bg-white border shadow-xl">
                        <DialogHeader>
                            <DialogTitle className="text-gray-900">Delete Job Posting</DialogTitle>
                            <DialogDescription className="text-gray-600">
                                Are you sure you want to delete "{selectedJob?.title}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="text-gray-700">
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
