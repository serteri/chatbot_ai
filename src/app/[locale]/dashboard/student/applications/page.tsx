'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Plus, Calendar, CheckCircle, Clock, XCircle, AlertCircle, FileText } from 'lucide-react'
import { format } from 'date-fns'

interface Application {
    id: string
    university: {
        name: string
        country: string
        city: string
    }
    program: string
    degree: string
    intake: string
    status: string
    deadline?: string
    appliedAt?: string
    decidedAt?: string
    documents?: any
    notes?: string
    createdAt: string
}

export default function ApplicationTrackerPage() {
    const t = useTranslations('ApplicationTracker')
    const router = useRouter()
    const params = useParams()
    const locale = params.locale as string

    const [loading, setLoading] = useState(true)
    const [applications, setApplications] = useState<Application[]>([])

    useEffect(() => {
        fetchApplications()
    }, [])

    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/student/applications')
            if (res.ok) {
                const data = await res.json()
                setApplications(data.applications || [])
            }
        } catch (error) {
            console.error('Error fetching applications:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (appId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/student/applications/${appId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                toast.success(t('statusUpdated'))
                fetchApplications()
            }
        } catch (error) {
            toast.error(t('updateError'))
        }
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { color: 'bg-gray-100 text-gray-800', icon: FileText, label: t('status.draft') },
            submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: t('status.submitted') },
            under_review: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: t('status.underReview') },
            accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: t('status.accepted') },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: t('status.rejected') },
            waitlisted: { color: 'bg-purple-100 text-purple-800', icon: Clock, label: t('status.waitlisted') }
        }

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
        const Icon = config.icon

        return (
            <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </Badge>
        )
    }

    const getDaysUntilDeadline = (deadline: string) => {
        const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        if (days < 0) return <span className="text-red-600 font-semibold">{t('overdue')}</span>
        if (days === 0) return <span className="text-red-600 font-semibold">{t('today')}</span>
        if (days <= 7) return <span className="text-orange-600 font-semibold">{days} {t('daysLeft')}</span>
        return <span className="text-gray-600">{days} {t('daysLeft')}</span>
    }

    const stats = {
        total: applications.length,
        draft: applications.filter(a => a.status === 'draft').length,
        submitted: applications.filter(a => a.status === 'submitted' || a.status === 'under_review').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">{t('title')}</h1>
                        <p className="text-gray-600">{t('subtitle')}</p>
                    </div>
                    <Button onClick={() => router.push(`/${locale}/dashboard/student/applications/new`)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('addApplication')}
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-sm text-gray-600">{t('stats.total')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
                            <div className="text-sm text-gray-600">{t('stats.draft')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
                            <div className="text-sm text-gray-600">{t('stats.submitted')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                            <div className="text-sm text-gray-600">{t('stats.accepted')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                            <div className="text-sm text-gray-600">{t('stats.rejected')}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Applications List */}
                {applications.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">{t('noApplications')}</h3>
                            <p className="text-gray-600 mb-4">{t('noApplicationsDesc')}</p>
                            <Button onClick={() => router.push(`/${locale}/dashboard/student/applications/new`)}>
                                <Plus className="w-4 h-4 mr-2" />
                                {t('addFirst')}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <Card key={app.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold">{app.university.name}</h3>
                                                {getStatusBadge(app.status)}
                                            </div>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <p>📍 {app.university.city}, {app.university.country}</p>
                                                <p>🎓 {app.program} ({app.degree})</p>
                                                <p>📅 {app.intake}</p>
                                                {app.deadline && (
                                                    <p className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{t('deadline')}: {format(new Date(app.deadline), 'MMM dd, yyyy')}</span>
                                                        <span>•</span>
                                                        {getDaysUntilDeadline(app.deadline)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Select value={app.status} onValueChange={(value) => updateStatus(app.id, value)}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">{t('status.draft')}</SelectItem>
                                                    <SelectItem value="submitted">{t('status.submitted')}</SelectItem>
                                                    <SelectItem value="under_review">{t('status.underReview')}</SelectItem>
                                                    <SelectItem value="accepted">{t('status.accepted')}</SelectItem>
                                                    <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
                                                    <SelectItem value="waitlisted">{t('status.waitlisted')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {app.notes && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-700">{app.notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}