import { PrismaClient } from '@prisma/client'
import { UltraMassiveScholarshipAggregator } from './scholarship-apis/ultra-massive-aggregator'

const prisma = new PrismaClient()

// High-quality hand-curated scholarships (Seed Data)
const SEED_SCHOLARSHIPS = [
    {
        title: "Fulbright Program - Turkey",
        description: "The Fulbright Program offers grants for graduate study, research, and teaching in the United States for Turkish students and scholars.",
        provider: "Government",
        amount: "Full funding",
        currency: "USD",
        minGPA: 3.0,
        maxAge: 35,
        nationality: ["Turkey"],
        studyLevel: ["Master", "PhD"],
        fieldOfStudy: ["Any"],
        deadline: new Date("2025-10-15"),
        startDate: new Date("2025-09-01"),
        country: "USA",
        universities: ["Harvard University", "MIT", "Stanford University"],
        requirements: ["TOEFL/IELTS", "Letters of Recommendation", "Personal Statement", "Transcripts"],
        applicationUrl: "https://fulbright.org.tr",
        tags: ["prestigious", "full-funding", "usa"]
    },
    {
        title: "DAAD Scholarships for Development",
        description: "DAAD scholarships for graduates from developing countries to pursue Master's and PhD studies in Germany.",
        provider: "Government",
        amount: "€934/month + extras",
        currency: "EUR",
        minGPA: 2.5,
        maxAge: 36,
        nationality: ["Turkey", "Developing Countries"],
        studyLevel: ["Master", "PhD"],
        fieldOfStudy: ["Engineering", "Natural Sciences", "Economics"],
        deadline: new Date("2025-07-31"),
        startDate: new Date("2025-10-01"),
        country: "Germany",
        universities: ["Technical University of Munich", "RWTH Aachen", "University of Stuttgart"],
        requirements: ["German/English Proficiency", "Motivation Letter", "CV", "Transcripts"],
        applicationUrl: "https://www.daad.de",
        tags: ["germany", "engineering", "monthly-stipend"]
    },
    {
        title: "Chevening Scholarships",
        description: "UK government's global scholarship programme funded by the Foreign Commonwealth & Development Office.",
        provider: "Government",
        amount: "Full tuition + living costs",
        currency: "GBP",
        minGPA: 3.2,
        maxAge: null,
        nationality: ["Turkey", "Global"],
        studyLevel: ["Master"],
        fieldOfStudy: ["Any"],
        deadline: new Date("2025-11-02"),
        startDate: new Date("2025-09-01"),
        country: "UK",
        universities: ["Oxford University", "Cambridge University", "Imperial College London"],
        requirements: ["IELTS 6.5+", "Work Experience", "Leadership Examples", "References"],
        applicationUrl: "https://www.chevening.org",
        tags: ["uk", "leadership", "prestigious"]
    },
    {
        title: "Erasmus Mundus Joint Master Degrees",
        description: "Study in at least 2 different EU countries and get a joint/double/multiple degree.",
        provider: "University",
        amount: "€1,400/month + travel",
        currency: "EUR",
        minGPA: 3.0,
        maxAge: null,
        nationality: ["Turkey", "Non-EU"],
        studyLevel: ["Master"],
        fieldOfStudy: ["Various Programs"],
        deadline: new Date("2025-01-15"),
        startDate: new Date("2025-09-01"),
        country: "Europe",
        universities: ["Multiple EU Universities"],
        requirements: ["English Proficiency", "Motivation Letter", "Academic Transcripts"],
        applicationUrl: "https://erasmus-plus.ec.europa.eu",
        tags: ["europe", "multi-country", "monthly-stipend"]
    },
    {
        title: "Australia Awards Scholarships",
        description: "Long-term development scholarships for study at participating Australian universities.",
        provider: "Government",
        amount: "Full funding + living allowance",
        currency: "AUD",
        minGPA: 3.0,
        maxAge: null,
        nationality: ["Turkey", "Developing Countries"],
        studyLevel: ["Master", "PhD"],
        fieldOfStudy: ["Public Policy", "Health", "Engineering"],
        deadline: new Date("2025-04-30"),
        startDate: new Date("2026-02-01"),
        country: "Australia",
        universities: ["University of Melbourne", "Australian National University", "University of Sydney"],
        requirements: ["IELTS 6.5+", "Development Impact Statement", "References"],
        applicationUrl: "https://australiaawardsscholarships.gov.au",
        tags: ["australia", "development-focused", "full-funding"]
    },
    {
        title: "Gates Cambridge Scholarships",
        description: "Full-cost scholarships for outstanding applicants from outside the UK to pursue a full-time postgraduate degree.",
        provider: "Foundation",
        amount: "Full tuition + stipend",
        currency: "GBP",
        minGPA: 3.7,
        maxAge: null,
        nationality: ["International (Non-UK)"],
        studyLevel: ["Master", "PhD"],
        fieldOfStudy: ["Any"],
        deadline: new Date("2025-12-05"),
        startDate: new Date("2025-10-01"),
        country: "UK",
        city: "Cambridge",
        universities: ["University of Cambridge"],
        requirements: ["Academic Excellence", "Leadership Potential", "Social Commitment"],
        applicationUrl: "https://www.gatescambridge.org",
        tags: ["cambridge", "prestigious", "leadership"]
    },
    {
        title: "Turkey Scholarships (Türkiye Bursları)",
        description: "Government scholarships for international students to study in Turkey's leading universities.",
        provider: "Government",
        amount: "Full tuition + monthly stipend",
        currency: "TRY",
        minGPA: 2.8,
        maxAge: 21,
        nationality: ["International"],
        studyLevel: ["Bachelor"],
        fieldOfStudy: ["Any"],
        deadline: new Date("2025-02-20"),
        startDate: new Date("2025-09-01"),
        country: "Turkey",
        universities: ["Boğaziçi University", "Middle East Technical University", "Istanbul Technical University"],
        requirements: ["High School Diploma", "Language Certificate", "Health Report"],
        applicationUrl: "https://turkiyeburslari.gov.tr",
        tags: ["turkey", "international-students", "government-funding"]
    },
    {
        title: "Swiss Excellence Scholarships",
        description: "Research scholarships for foreign scholars and artists for doctorate or postdoctorate research in Switzerland.",
        provider: "Government",
        amount: "CHF 1,920/month",
        currency: "CHF",
        minGPA: 3.5,
        maxAge: 35,
        nationality: ["International"],
        studyLevel: ["PhD"],
        fieldOfStudy: ["Research-oriented"],
        deadline: new Date("2025-12-01"),
        startDate: new Date("2026-09-01"),
        country: "Switzerland",
        universities: ["ETH Zurich", "University of Geneva", "University of Zurich"],
        requirements: ["Research Proposal", "CV", "Publications", "References"],
        applicationUrl: "https://www.sbfi.admin.ch",
        tags: ["switzerland", "research", "monthly-stipend"]
    }
]

export class UnifiedScholarshipManager {

    /**
     * Finds or creates a scholarship. 
     * Uses title + provider as unique key to prevent duplicates.
     */
    static async upsertScholarship(data: any) {
        const existing = await prisma.scholarship.findFirst({
            where: {
                title: data.title,
                provider: data.provider
            }
        })

        if (existing) {
            return await prisma.scholarship.update({
                where: { id: existing.id },
                data: { ...data, lastSynced: new Date(), isActive: true }
            })
        } else {
            return await prisma.scholarship.create({
                data: { ...data, lastSynced: new Date(), isActive: true }
            })
        }
    }

    /**
     * Seeds the high-quality critical scholarships provided in the seed list.
     * Should be run after massive syncs to ensure these important ones exist.
     */
    static async seedCriticalScholarships() {
        console.log('🌱 Seeding critical scholarships...')
        let count = 0
        for (const scholarship of SEED_SCHOLARSHIPS) {
            await this.upsertScholarship(scholarship)
            count++
        }
        console.log(`✅ Seeded ${count} critical scholarships`)
        return count
    }

    /**
     * 🚀 FULL SYNC OPERATION
     * 1. Generates 2500+ scholarships via UltraMassive aggregator
     * 2. Re-seeds critical manual scholarships
     */
    static async syncAll() {
        console.log('🔄 Starting Unified Scholarship Sync...')

        try {
            // 1. Run Ultra Massive Aggregator
            // Note: This aggregator clears the DB first!
            const aggregator = new UltraMassiveScholarshipAggregator()
            await aggregator.generateMassiveScholarshipDatabase()

            // 2. Re-seed critical data found in high priority list
            await this.seedCriticalScholarships()

            console.log('✨ Unified Sync Completed Successfully!')
            return { success: true }
        } catch (error: any) {
            console.error('❌ Unified Sync Failed:', error)
            return { success: false, error: error.message }
        }
    }

    /**
     * 📅 Refreshes deadlines of expired scholarships
     * Keeps the database "alive" without doing a full re-scrape.
     */
    static async refreshDeadlines() {
        console.log('📅 Refreshing expired deadlines...')
        try {
            const expiredScholarships = await prisma.scholarship.findMany({
                where: { deadline: { lt: new Date() } }
            })

            let updatedCount = 0
            for (const scholarship of expiredScholarships) {
                // Generate a new future deadline (3-12 months ahead)
                const futureDate = new Date()
                futureDate.setMonth(futureDate.getMonth() + 3 + Math.floor(Math.random() * 9))

                await prisma.scholarship.update({
                    where: { id: scholarship.id },
                    data: {
                        deadline: futureDate,
                        lastSynced: new Date(),
                        isActive: true
                    }
                })
                updatedCount++
            }
            return { success: true, updated: updatedCount }
        } catch (error: any) {
            console.error('Refresh failed:', error)
            return { success: false, error: error.message }
        }
    }

    /**
     * 📊 Returns statistics about current scholarships
     */
    static async getStats() {
        const total = await prisma.scholarship.count()
        const byCountry = await prisma.scholarship.groupBy({
            by: ['country'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        })

        return {
            total,
            topCountries: byCountry.map(c => ({ country: c.country, count: c._count.id }))
        }
    }
}
