import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Briefcase } from 'lucide-react'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function CareersPage({ params }: PageProps) {
    const { locale } = await params

    const positions = [
        {
            title: "Senior Full Stack Engineer",
            dept: "Engineering",
            location: "Remote / Brisbane",
            type: "Full-time"
        },
        {
            title: "AI Research Scientist",
            dept: "AI & ML",
            location: "Remote",
            type: "Full-time"
        },
        {
            title: "Product Marketing Manager",
            dept: "Marketing",
            location: "Brisbane, AU",
            type: "Full-time"
        },
        {
            title: "Customer Success Specialist",
            dept: "Support",
            location: "Remote",
            type: "Part-time"
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />

            {/* Hero */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 py-24 text-center text-white px-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Mission</h1>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">We're building the future of customer communication with AI. Come help us shape it.</p>
                <div className="flex justify-center gap-4">
                    <div className="flex flex-col items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                        <span className="text-3xl font-bold">100%</span>
                        <span className="text-sm opacity-80">Remote Friendly</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                        <span className="text-3xl font-bold">4.9</span>
                        <span className="text-sm opacity-80">Glassdoor Rating</span>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Open Positions</h2>

                    <div className="space-y-4">
                        {positions.map((job, index) => (
                            <Card key={index} className="hover:border-blue-300 transition-colors cursor-pointer">
                                <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
                                    <div className="mb-4 md:mb-0">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span className="flex items-center">
                                                <Briefcase className="w-4 h-4 mr-1.5" />
                                                {job.dept}
                                            </span>
                                            <span className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-1.5" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1.5" />
                                                {job.type}
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                                        Apply Now
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-gray-600 mb-4">Don't see a role that fits?</p>
                        <a href="#" className="font-semibold text-blue-600 hover:underline">
                            Send us your resume anyway
                        </a>
                    </div>
                </div>
            </main>

            <Footer locale={locale} />
        </div>
    )
}
