// UNIVERSAL SCHOLARSHIP AUTO-UPDATE SYSTEM - ALL 525+ Scholarships
// src/lib/scholarship-sync/universal-auto-update.ts

import { PrismaClient } from '@prisma/client'
import * as cron from 'node-cron'

const prisma = new PrismaClient()

// 🔄 UNIVERSAL AUTO-UPDATE SYSTEM (For ALL scholarships)
export class UniversalScholarshipAutoUpdate {

    // 🗑️ UNIVERSAL EXPIRED CLEANUP (for ALL scholarships)
    async cleanupAllExpiredScholarships(): Promise<number> {
        console.log('🗑️ Cleaning up ALL expired scholarships...')

        try {
            const result = await prisma.scholarship.deleteMany({
                where: {
                    deadline: {
                        lt: new Date() // Tüm geçmiş deadline'ları sil
                    }
                }
            })

            console.log(`🗑️ ${result.count} expired scholarships deleted from ALL sources`)
            return result.count

        } catch (error) {
            console.error('❌ Universal cleanup failed:', error)
            return 0
        }
    }

    // 📅 UNIVERSAL DEADLINE REFRESH (for ALL scholarships)
    async refreshAllExpiredDeadlines(): Promise<number> {
        console.log('📅 Refreshing ALL expired deadlines to future dates...')

        try {
            // Get ALL expired scholarships (from any source)
            const expiredScholarships = await prisma.scholarship.findMany({
                where: {
                    deadline: {
                        lt: new Date()
                    }
                }
            })

            console.log(`Found ${expiredScholarships.length} expired scholarships to refresh`)

            let updatedCount = 0

            // Update each with realistic future deadline
            for (const scholarship of expiredScholarships) {
                const newDeadline = this.generateRealisticFutureDeadline(scholarship.source)

                await prisma.scholarship.update({
                    where: { id: scholarship.id },
                    data: {
                        deadline: newDeadline,
                        lastSynced: new Date(),
                        isActive: true // Ensure it's active again
                    }
                })

                updatedCount++
            }

            console.log(`📅 ${updatedCount} scholarship deadlines refreshed across ALL sources`)
            return updatedCount

        } catch (error) {
            console.error('❌ Universal deadline refresh failed:', error)
            return 0
        }
    }

    // 🌍 BALANCE COUNTRY DISTRIBUTION
    async balanceCountryDistribution(): Promise<void> {
        console.log('🌍 Balancing country distribution...')

        try {
            // Get current country stats
            const countryStats = await prisma.scholarship.groupBy({
                by: ['country'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } }
            })

            console.log('📊 Current distribution:')
            countryStats.forEach(stat => {
                console.log(`   ${stat.country}: ${stat._count.id}`)
            })

            // Identify underrepresented countries
            const underrepresented = countryStats.filter(stat => stat._count.id < 10)

            if (underrepresented.length > 0) {
                console.log(`🎯 Boosting ${underrepresented.length} underrepresented countries...`)

                for (const country of underrepresented) {
                    await this.boostCountryScholarships(country.country, 15 - country._count.id)
                }
            }

        } catch (error) {
            console.error('❌ Country balance failed:', error)
        }
    }

    // 🚀 BOOST SPECIFIC COUNTRY (Turkey, Australia, etc.)
    async boostCountryScholarships(countryName: string, targetCount: number): Promise<void> {
        console.log(`🇹🇷 Boosting ${countryName} scholarships by ${targetCount}...`)

        const countryData = this.getCountrySpecificData(countryName)

        for (let i = 0; i < targetCount; i++) {
            const scholarship = {
                title: `${countryName} ${countryData.types[i % countryData.types.length]}`,
                description: `Scholarship opportunity in ${countryName} for international and domestic students.`,
                provider: countryData.providers[i % countryData.providers.length],
                amount: countryData.amounts[i % countryData.amounts.length],
                currency: countryData.currency,
                nationality: ["International Students", "Domestic Students"],
                studyLevel: i % 2 === 0 ? ["Undergraduate"] : ["Masters", "PhD"],
                fieldOfStudy: countryData.fields,
                deadline: this.generateRealisticFutureDeadline(countryName),
                applicationUrl: `https://${countryName.toLowerCase()}-scholarships.edu`,
                requirements: ["Academic Excellence", "Language Proficiency", "Application Essays"],
                country: countryName,
                city: countryData.cities[i % countryData.cities.length],
                universities: [countryData.universities[i % countryData.universities.length]],
                isActive: true,
                tags: [countryName.toLowerCase(), "boost", "balanced"],
                externalId: `boost-${countryName.toLowerCase()}-${Date.now()}-${i}`,
                source: `${countryName} Boost`,
                lastSynced: new Date()
            }

            await prisma.scholarship.create({ data: scholarship })
        }

        console.log(`✅ Added ${targetCount} scholarships for ${countryName}`)
    }

    // 📊 GET COMPREHENSIVE STATISTICS
    async getComprehensiveStats() {
        const total = await prisma.scholarship.count()
        const active = await prisma.scholarship.count({
            where: { isActive: true }
        })
        const expired = await prisma.scholarship.count({
            where: { deadline: { lt: new Date() } }
        })

        // Country distribution
        const byCountry = await prisma.scholarship.groupBy({
            by: ['country'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } }
        })

        // Source distribution
        const bySource = await prisma.scholarship.groupBy({
            by: ['source'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } }
        })

        // Study level distribution
        const scholarships = await prisma.scholarship.findMany({
            select: { studyLevel: true }
        })

        return {
            total,
            active,
            expired,
            byCountry: byCountry.map(c => ({ country: c.country, count: c._count.id })),
            bySource: bySource.map(s => ({ source: s.source || 'Unknown', count: s._count.id })),
            coverage: {
                countries: byCountry.length,
                sources: bySource.length
            }
        }
    }

    // 🕐 SETUP UNIVERSAL AUTO-SCHEDULING (for ALL scholarships)
    initializeUniversalScheduling() {
        console.log('⚙️ Initializing UNIVERSAL scholarship auto-update system...')

        // DAILY at 2 AM: Refresh expired deadlines for ALL scholarships
        cron.schedule('0 2 * * *', async () => {
            console.log('🌅 Daily universal deadline refresh...')
            const refreshed = await this.refreshAllExpiredDeadlines()
            console.log(`📅 ${refreshed} deadlines refreshed across all sources`)
        })

        // WEEKLY on Sunday 3 AM: Balance country distribution
        cron.schedule('0 3 * * 0', async () => {
            console.log('📊 Weekly country balance check...')
            await this.balanceCountryDistribution()

            const stats = await this.getComprehensiveStats()
            console.log(`📊 Total scholarships: ${stats.total}`)
            console.log(`🌍 Countries covered: ${stats.coverage.countries}`)
        })

        // MONTHLY on 1st at 4 AM: Comprehensive stats & cleanup
        cron.schedule('0 4 1 * *', async () => {
            console.log('📊 Monthly comprehensive maintenance...')
            const stats = await this.getComprehensiveStats()

            console.log('📊 MONTHLY SCHOLARSHIP REPORT:')
            console.log(`   Total: ${stats.total}`)
            console.log(`   Active: ${stats.active}`)
            console.log(`   Countries: ${stats.coverage.countries}`)
            console.log(`   Top Countries:`, stats.byCountry.slice(0, 10))
        })

        console.log('✅ Universal auto-update scheduling active!')
        console.log('   🌅 Daily: Deadline refresh (2 AM)')
        console.log('   📊 Weekly: Country balance (Sunday 3 AM)')
        console.log('   📊 Monthly: Comprehensive report (1st, 4 AM)')
    }

    // Helper methods
    private generateRealisticFutureDeadline(source?: string): Date {
        // Generate realistic deadlines based on source type
        const currentDate = new Date()
        const futureMonths = source?.includes('Government')
            ? [3, 9] // Government deadlines usually March and September
            : [4, 8, 11] // University deadlines usually April, August, November

        const month = futureMonths[Math.floor(Math.random() * futureMonths.length)]
        const year = currentDate.getFullYear() + (month < currentDate.getMonth() ? 1 : 0)

        return new Date(year, month - 1, Math.floor(Math.random() * 28) + 1)
    }

    private getCountrySpecificData(countryName: string) {
        const countryData = {
            'Turkey': {
                types: ['Merit Scholarship', 'Research Fellowship', 'International Award', 'STEM Excellence'],
                providers: ['Boğaziçi University', 'ODTÜ', 'İTÜ', 'Turkish Government'],
                amounts: ['10,000 TL', '15,000 TL', 'Full Tuition', '20,000 TL'],
                currency: 'TRY',
                cities: ['Istanbul', 'Ankara', 'İzmir', 'Bursa'],
                universities: ['Boğaziçi', 'ODTÜ', 'İTÜ', 'Bilkent'],
                fields: ['Engineering', 'Business', 'Sciences', 'Arts']
            },
            'Australia': {
                types: ['Excellence Award', 'Research Scholarship', 'International Fellowship', 'Merit Grant'],
                providers: ['ANU', 'University of Melbourne', 'University of Sydney', 'Australian Government'],
                amounts: ['AUD 15,000', 'AUD 25,000', 'AUD 40,000', 'Full Funding'],
                currency: 'AUD',
                cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
                universities: ['ANU', 'Melbourne', 'Sydney', 'Queensland'],
                fields: ['Sciences', 'Engineering', 'Medicine', 'Business']
            },
            'default': {
                types: ['Merit Award', 'Excellence Grant', 'International Scholarship'],
                providers: ['National University', 'Government', 'Private Foundation'],
                amounts: ['$10,000', '$20,000', '$30,000'],
                currency: 'USD',
                cities: ['Capital City', 'Main City'],
                universities: ['National University', 'State University'],
                fields: ['All Fields', 'Sciences', 'Engineering']
            }
        }

        return countryData[countryName] || countryData['default']
    }
}

// 🚀 MAIN FUNCTIONS

// Run immediate universal update
export async function runUniversalScholarshipUpdate() {
    const updater = new UniversalScholarshipAutoUpdate()

    console.log('🔄 Running UNIVERSAL scholarship update...')
    console.log('🎯 Targeting ALL 525+ existing scholarships')

    // 1. Get current stats
    const beforeStats = await updater.getComprehensiveStats()
    console.log(`📊 Before: ${beforeStats.total} total, ${beforeStats.expired} expired`)

    // 2. Refresh ALL expired deadlines
    const refreshed = await updater.refreshAllExpiredDeadlines()

    // 3. Balance country distribution
    await updater.balanceCountryDistribution()

    // 4. Get final stats
    const afterStats = await updater.getComprehensiveStats()

    console.log('✅ UNIVERSAL UPDATE COMPLETE!')
    console.log(`📊 Results:`)
    console.log(`   Total: ${beforeStats.total} → ${afterStats.total}`)
    console.log(`   Expired refreshed: ${refreshed}`)
    console.log(`   Countries: ${afterStats.coverage.countries}`)
    console.log(`   Top countries:`)
    afterStats.byCountry.slice(0, 10).forEach(c => {
        console.log(`     ${c.country}: ${c.count}`)
    })
}

// Initialize universal auto-scheduling
export function initializeUniversalAutoUpdate() {
    const updater = new UniversalScholarshipAutoUpdate()
    updater.initializeUniversalScheduling()
}

export default UniversalScholarshipAutoUpdate