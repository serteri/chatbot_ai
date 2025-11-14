// Scholarship API Integration - Multiple Sources
// src/lib/scholarship-apis/index.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Base scholarship interface
export interface ScholarshipData {
    externalId: string
    source: string
    title: string
    description: string
    provider: string
    amount: string
    currency: string
    deadline: Date
    startDate?: Date
    country: string
    city?: string
    studyLevel: string[]
    fieldOfStudy: string[]
    nationality: string[]
    requirements: string[]
    applicationUrl?: string
    tags: string[]
    minGPA?: number
    maxAge?: number
    universities: string[]
}

// 1. ScholarshipOwl API Client
export class ScholarshipOwlAPI {
    private apiKey: string
    private baseUrl = 'https://api.scholarshipowl.com/v1'

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    async fetchScholarships(): Promise<ScholarshipData[]> {
        try {
            const response = await fetch(`${this.baseUrl}/scholarships`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`ScholarshipOwl API error: ${response.status}`)
            }

            const data = await response.json()
            return data.data?.map(this.transformScholarshipOwlData) || []
        } catch (error) {
            console.error('ScholarshipOwl API error:', error)
            return []
        }
    }

    private transformScholarshipOwlData(item: any): ScholarshipData {
        return {
            externalId: `owl_${item.id}`,
            source: 'scholarshipowl',
            title: item.attributes.name || 'Unnamed Scholarship',
            description: item.attributes.description || 'No description available',
            provider: item.attributes.provider || 'Unknown',
            amount: item.attributes.amount || 'Variable',
            currency: item.attributes.currency || 'USD',
            deadline: new Date(item.attributes.deadline || Date.now() + 365 * 24 * 60 * 60 * 1000),
            country: item.attributes.country || 'Various',
            studyLevel: item.attributes.study_levels || ['Any'],
            fieldOfStudy: item.attributes.fields || ['Any'],
            nationality: item.attributes.eligible_countries || ['International'],
            requirements: item.attributes.requirements || [],
            applicationUrl: item.attributes.application_url,
            tags: item.attributes.tags || [],
            minGPA: item.attributes.min_gpa,
            maxAge: item.attributes.max_age,
            universities: item.attributes.universities || []
        }
    }
}

// 2. International Scholarships Web Scraper
export class InternationalScholarshipsAPI {
    private baseUrl = 'https://www.internationalscholarships.com'

    async fetchScholarships(): Promise<ScholarshipData[]> {
        // Note: Bu gerçek implementation için web scraping yapılabilir
        // Şu an için mock data dönüyoruz
        return this.getMockInternationalScholarships()
    }

    private getMockInternationalScholarships(): ScholarshipData[] {
        return [
            {
                externalId: 'intl_1',
                source: 'international',
                title: 'MPOWER Global Citizen Scholarship',
                description: 'Scholarship for international students studying in US/Canada with no cosigner required.',
                provider: 'Foundation',
                amount: '$5,000',
                currency: 'USD',
                deadline: new Date('2026-03-31'),
                startDate: new Date('2026-08-01'),
                country: 'USA',
                studyLevel: ['Master', 'PhD'],
                fieldOfStudy: ['Any'],
                nationality: ['International'],
                requirements: ['Enrolled in US university', 'International student', 'Academic merit'],
                applicationUrl: 'https://www.mpowerfinancing.com/scholarships',
                tags: ['international', 'no-cosigner', 'usa'],
                minGPA: 3.0,
                universities: ['Any accredited US university']
            },
            {
                externalId: 'intl_2',
                source: 'international',
                title: 'Joint Japan World Bank Graduate Scholarship',
                description: 'Full scholarship for developing country nationals to study development-related fields.',
                provider: 'Government',
                amount: 'Full tuition + living expenses',
                currency: 'USD',
                deadline: new Date('2026-04-15'),
                startDate: new Date('2026-09-01'),
                country: 'Japan',
                studyLevel: ['Master'],
                fieldOfStudy: ['Development Studies', 'Economics', 'Public Policy'],
                nationality: ['Developing Countries'],
                requirements: ['Development experience', 'TOEFL/IELTS', 'Academic excellence'],
                applicationUrl: 'https://www.worldbank.org/en/programs/scholarships',
                tags: ['japan', 'development', 'full-funding'],
                minGPA: 3.2,
                universities: ['Japanese universities', 'Partner institutions']
            }
        ]
    }
}

// 3. Government Programs API
export class GovernmentProgramsAPI {
    async fetchScholarships(): Promise<ScholarshipData[]> {
        return this.getMockGovernmentPrograms()
    }

    private getMockGovernmentPrograms(): ScholarshipData[] {
        return [
            {
                externalId: 'gov_1',
                source: 'government',
                title: 'Commonwealth Scholarships',
                description: 'Scholarships for students from Commonwealth countries to study in the UK.',
                provider: 'Government',
                amount: 'Full tuition + living allowance',
                currency: 'GBP',
                deadline: new Date('2026-12-31'),
                startDate: new Date('2026-09-01'),
                country: 'UK',
                studyLevel: ['Master', 'PhD'],
                fieldOfStudy: ['Any'],
                nationality: ['Commonwealth Countries'],
                requirements: ['Commonwealth citizenship', 'Academic excellence', 'Development impact'],
                applicationUrl: 'https://cscuk.fcdo.gov.uk',
                tags: ['commonwealth', 'uk', 'government'],
                minGPA: 3.5,
                universities: ['UK universities']
            }
        ]
    }
}

// 4. Main Sync Function
export class ScholarshipSyncManager {
    private owlAPI: ScholarshipOwlAPI
    private intlAPI: InternationalScholarshipsAPI
    private govAPI: GovernmentProgramsAPI

    constructor() {
        this.owlAPI = new ScholarshipOwlAPI(process.env.SCHOLARSHIPOWL_API_KEY || '')
        this.intlAPI = new InternationalScholarshipsAPI()
        this.govAPI = new GovernmentProgramsAPI()
    }

    async syncAllScholarships(): Promise<void> {
        console.log('🔄 Starting scholarship sync from multiple sources...')

        try {
            // Fetch from all sources in parallel
            const [owlData, intlData, govData] = await Promise.allSettled([
                this.owlAPI.fetchScholarships(),
                this.intlAPI.fetchScholarships(),
                this.govAPI.fetchScholarships()
            ])

            // Combine successful results
            const allScholarships: ScholarshipData[] = []

            if (owlData.status === 'fulfilled') {
                allScholarships.push(...owlData.value)
                console.log(`✅ ScholarshipOwl: ${owlData.value.length} scholarships`)
            } else {
                console.error('❌ ScholarshipOwl failed:', owlData.reason)
            }

            if (intlData.status === 'fulfilled') {
                allScholarships.push(...intlData.value)
                console.log(`✅ International: ${intlData.value.length} scholarships`)
            } else {
                console.error('❌ International failed:', intlData.reason)
            }

            if (govData.status === 'fulfilled') {
                allScholarships.push(...govData.value)
                console.log(`✅ Government: ${govData.value.length} scholarships`)
            } else {
                console.error('❌ Government failed:', govData.reason)
            }

            console.log(`📊 Total scholarships to sync: ${allScholarships.length}`)

            // Clear old external data (keep manual entries if any)
            await prisma.scholarship.deleteMany({
                where: {
                    source: {
                        in: ['scholarshipowl', 'international', 'government']
                    }
                }
            })

            // Insert new data
            let successCount = 0
            for (const scholarship of allScholarships) {
                try {
                    await prisma.scholarship.create({
                        data: {
                            ...scholarship,
                            lastSynced: new Date(),
                            isActive: true
                        }
                    })
                    successCount++
                } catch (error) {
                    console.error(`Failed to insert scholarship: ${scholarship.title}`, error)
                }
            }

            console.log(`✅ Sync completed: ${successCount}/${allScholarships.length} scholarships synced`)

        } catch (error) {
            console.error('❌ Sync failed:', error)
            throw error
        }
    }

    async getLastSyncInfo() {
        const lastSync = await prisma.scholarship.findFirst({
            where: { source: { not: null } },
            orderBy: { lastSynced: 'desc' },
            select: { lastSynced: true, source: true }
        })

        const totalCount = await prisma.scholarship.count()
        const externalCount = await prisma.scholarship.count({
            where: { source: { not: null } }
        })

        return {
            lastSyncDate: lastSync?.lastSynced,
            totalScholarships: totalCount,
            externalScholarships: externalCount,
            manualScholarships: totalCount - externalCount
        }
    }
}

// Export for use
export const scholarshipSyncManager = new ScholarshipSyncManager()