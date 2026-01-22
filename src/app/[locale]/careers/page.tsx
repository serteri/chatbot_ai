import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Briefcase, Globe, DollarSign, Building, ChevronRight, Star, Users, Sparkles, ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function CareersPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'careers' })

    // Fetch published job postings
    const jobs = await prisma.jobPosting.findMany({
        where: {
            isPublished: true,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        },
        orderBy: [
            { isFeatured: 'desc' },
            { publishedAt: 'desc' }
        ]
    })

    // Group jobs by department
    const jobsByDepartment = jobs.reduce((acc, job) => {
        if (!acc[job.department]) {
            acc[job.department] = []
        }
        acc[job.department].push(job)
        return acc
    }, {} as Record<string, typeof jobs>)

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

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />
            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 lg:py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/20 to-transparent"></div>
                    <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                        <Badge className="mb-6 bg-white/20 hover:bg-white/30 border-white/30 text-white px-4 py-1.5 text-sm uppercase tracking-wide backdrop-blur-sm">
                            {t('badge')}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            {t('title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                            {t('subtitle')}
                        </p>
                        {jobs.length > 0 && (
                            <div className="flex justify-center gap-6 text-sm">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
                                    <span className="font-bold text-2xl">{jobs.length}</span>
                                    <span className="ml-2 text-blue-100">{t('openPositions')}</span>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
                                    <span className="font-bold text-2xl">{Object.keys(jobsByDepartment).length}</span>
                                    <span className="ml-2 text-blue-100">{t('departments')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 py-16 -mt-16 relative z-20">
                    {jobs.length === 0 ? (
                        /* No Openings State */
                        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="p-8 md:p-12 text-center">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Briefcase className="h-8 w-8" />
                                </div>

                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                    {t('noOpeningsTitle')}
                                </h2>
                                <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                                    {t('noOpeningsDesc')}
                                </p>

                                <div className="bg-gray-50 rounded-xl p-6 md:p-8 border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {t('sendCvTitle')}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {t('sendCvDesc')}
                                    </p>
                                    <a href="mailto:careers@pylonchat.com">
                                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                                            <Clock className="w-4 h-4 mr-2" />
                                            {t('sendButton')}
                                        </Button>
                                    </a>
                                    <div className="mt-4 text-sm text-gray-400">
                                        careers@pylonchat.com
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Job Listings */
                        <div className="max-w-5xl mx-auto">
                            {/* Why Join Us Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Globe className="h-7 w-7" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">Remote First</h3>
                                        <p className="text-blue-100 text-sm">Work from anywhere in the world</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="h-7 w-7" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">Cutting Edge Tech</h3>
                                        <p className="text-purple-100 text-sm">Work with latest AI technologies</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Users className="h-7 w-7" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">Great Team</h3>
                                        <p className="text-emerald-100 text-sm">Collaborate with talented people</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Job Listings by Department */}
                            {Object.entries(jobsByDepartment).map(([department, departmentJobs]) => (
                                <div key={department} className="mb-12">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <Building className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">{department}</h2>
                                            <p className="text-gray-500 text-sm">{departmentJobs.length} {departmentJobs.length === 1 ? 'open position' : 'open positions'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {departmentJobs.map((job, index) => {
                                            const colors = [
                                                'from-blue-500 to-indigo-500',
                                                'from-purple-500 to-pink-500',
                                                'from-emerald-500 to-teal-500',
                                                'from-orange-500 to-red-500'
                                            ]
                                            const colorClass = colors[index % colors.length]

                                            return (
                                                <Link key={job.id} href={`/${locale}/careers/${job.id}`}>
                                                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md">
                                                        <div className={`h-1.5 bg-gradient-to-r ${colorClass}`} />
                                                        <CardContent className="p-6 bg-white">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-3">
                                                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                            {job.title}
                                                                        </h3>
                                                                        {job.isFeatured && (
                                                                            <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-sm">
                                                                                <Star className="h-3 w-3 mr-1 fill-white" />
                                                                                Featured
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                                        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                                                            <MapPin className="h-4 w-4" />
                                                                            {job.location || locationTypeLabels[job.locationType]}
                                                                        </span>
                                                                        <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                                                            <Clock className="h-4 w-4" />
                                                                            {employmentTypeLabels[job.employmentType]}
                                                                        </span>
                                                                        <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                                                            <Globe className="h-4 w-4" />
                                                                            {locationTypeLabels[job.locationType]}
                                                                        </span>
                                                                        {job.showSalary && job.salaryMin && (
                                                                            <span className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                                                                <DollarSign className="h-4 w-4" />
                                                                                {job.salaryMin.toLocaleString()}-{job.salaryMax?.toLocaleString()} {job.salaryCurrency}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <p className="text-gray-600 line-clamp-2 leading-relaxed">
                                                                        {job.description.substring(0, 180)}...
                                                                    </p>
                                                                </div>

                                                                <div className="ml-6 flex-shrink-0">
                                                                    <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                                                        <ArrowRight className="h-5 w-5 text-white" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* CTA Section */}
                            <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Briefcase className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                        {t('dontSeeRole')}
                                    </h3>
                                    <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                                        {t('sendCvDesc')}
                                    </p>
                                    <a href="mailto:careers@pylonchat.com">
                                        <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8">
                                            {t('sendButton')}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </a>
                                    <p className="mt-4 text-gray-400 text-sm">careers@pylonchat.com</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
