import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    MapPin,
    Clock,
    Briefcase,
    Globe,
    DollarSign,
    Building,
    ArrowLeft,
    Star,
    Calendar,
    CheckCircle,
    Mail,
    ExternalLink
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ locale: string; id: string }>
}

export default async function JobDetailPage({ params }: PageProps) {
    const { locale, id } = await params
    const t = await getTranslations({ locale, namespace: 'careers' })

    // Fetch job and increment view count
    const job = await prisma.jobPosting.update({
        where: {
            id,
            isPublished: true,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        },
        data: {
            viewCount: { increment: 1 }
        }
    }).catch(() => null)

    if (!job) {
        notFound()
    }

    const locationTypeLabels: Record<string, string> = {
        'remote': 'Remote',
        'onsite': 'On-site',
        'hybrid': 'Hybrid'
    }

    const employmentTypeLabels: Record<string, string> = {
        'full-time': 'Full-time',
        'part-time': 'Part-time',
        'contract': 'Contract',
        'internship': 'Internship'
    }

    // Helper function to render content sections with bullet points
    const renderContent = (content: string | null) => {
        if (!content) return null

        // Split by newlines and render as list if it looks like bullet points
        const lines = content.split('\n').filter(line => line.trim())
        const isBulletList = lines.some(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))

        if (isBulletList) {
            return (
                <ul className="space-y-2">
                    {lines.map((line, index) => {
                        const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim()
                        if (!cleanLine) return null
                        return (
                            <li key={index} className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{cleanLine}</span>
                            </li>
                        )
                    })}
                </ul>
            )
        }

        return <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />
            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 lg:py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                    <div className="container mx-auto px-4 relative z-10 max-w-4xl">
                        <Link href={`/${locale}/careers`} className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {t('backToJobs')}
                        </Link>

                        <div className="flex items-start gap-4 mb-4">
                            {job.isFeatured && (
                                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                                    <Star className="h-3 w-3 mr-1 fill-white" />
                                    Featured
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                            {job.title}
                        </h1>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                <Building className="h-4 w-4" />
                                {job.department}
                            </span>
                            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                <MapPin className="h-4 w-4" />
                                {job.location || locationTypeLabels[job.locationType]}
                            </span>
                            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                <Clock className="h-4 w-4" />
                                {employmentTypeLabels[job.employmentType]}
                            </span>
                            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                <Globe className="h-4 w-4" />
                                {locationTypeLabels[job.locationType]}
                            </span>
                            {job.showSalary && job.salaryMin && (
                                <span className="flex items-center gap-2 bg-green-500/20 text-green-100 px-4 py-2 rounded-full backdrop-blur-sm">
                                    <DollarSign className="h-4 w-4" />
                                    {job.salaryMin.toLocaleString()}-{job.salaryMax?.toLocaleString()} {job.salaryCurrency}/{job.salaryPeriod}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 py-12 -mt-8 relative z-20">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Description */}
                                <Card className="shadow-lg">
                                    <CardContent className="p-8">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-blue-600" />
                                            {t('aboutRole')}
                                        </h2>
                                        <div className="prose prose-gray max-w-none">
                                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {job.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Responsibilities */}
                                {job.responsibilities && (
                                    <Card className="shadow-lg">
                                        <CardContent className="p-8">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                                {t('responsibilities')}
                                            </h2>
                                            {renderContent(job.responsibilities)}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Requirements */}
                                {job.requirements && (
                                    <Card className="shadow-lg">
                                        <CardContent className="p-8">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                                {t('requirements')}
                                            </h2>
                                            {renderContent(job.requirements)}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Nice to Have */}
                                {job.niceToHave && (
                                    <Card className="shadow-lg">
                                        <CardContent className="p-8">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                                {t('niceToHave')}
                                            </h2>
                                            {renderContent(job.niceToHave)}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Benefits */}
                                {job.benefits && (
                                    <Card className="shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                                        <CardContent className="p-8">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                                {t('benefits')}
                                            </h2>
                                            {renderContent(job.benefits)}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-8 space-y-6">
                                    {/* Apply Card */}
                                    <Card className="shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                                        <CardContent className="p-6">
                                            <h3 className="text-lg font-semibold mb-4">{t('applyNow')}</h3>
                                            <p className="text-blue-100 text-sm mb-6">
                                                {t('applyDesc')}
                                            </p>
                                            {job.applicationUrl ? (
                                                <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                                                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50">
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        {t('applyButton')}
                                                    </Button>
                                                </a>
                                            ) : job.applicationEmail ? (
                                                <a href={`mailto:${job.applicationEmail}?subject=Application for ${job.title}`}>
                                                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50">
                                                        <Mail className="h-4 w-4 mr-2" />
                                                        {t('applyByEmail')}
                                                    </Button>
                                                </a>
                                            ) : (
                                                <a href="mailto:careers@pylonchat.com?subject=Application for ${job.title}">
                                                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50">
                                                        <Mail className="h-4 w-4 mr-2" />
                                                        {t('applyByEmail')}
                                                    </Button>
                                                </a>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Job Details Card */}
                                    <Card className="shadow-lg">
                                        <CardContent className="p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('jobDetails')}</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Building className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-500">{t('department')}</div>
                                                        <div className="font-medium">{job.department}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <MapPin className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-500">{t('location')}</div>
                                                        <div className="font-medium">{job.location || locationTypeLabels[job.locationType]}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                        <Clock className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-500">{t('employmentType')}</div>
                                                        <div className="font-medium">{employmentTypeLabels[job.employmentType]}</div>
                                                    </div>
                                                </div>
                                                {job.expiresAt && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                            <Calendar className="h-5 w-5 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-gray-500">{t('deadline')}</div>
                                                            <div className="font-medium">{new Date(job.expiresAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Share Card */}
                                    <Card className="shadow-lg">
                                        <CardContent className="p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('shareJob')}</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                {t('shareDesc')}
                                            </p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="flex-1">
                                                    LinkedIn
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-1">
                                                    Twitter
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
