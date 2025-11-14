// Automated Scholarship Sync with Cron Jobs
// src/lib/cron/scholarship-cron.ts

import cron from 'node-cron'
import { runScholarshipSync } from '../sync-scholarships'

export class ScholarshipCronManager {
    private isRunning = false

    // Daily sync at 2 AM
    startDailySync() {
        console.log('🕐 Setting up daily scholarship sync at 2:00 AM...')

        cron.schedule('0 2 * * *', async () => {
            if (this.isRunning) {
                console.log('⏳ Scholarship sync already running, skipping...')
                return
            }

            this.isRunning = true
            try {
                console.log('🌙 Running automated scholarship sync...')
                await runScholarshipSync()
                console.log('✅ Automated sync completed')
            } catch (error) {
                console.error('❌ Automated sync failed:', error)
            } finally {
                this.isRunning = false
            }
        }, {
            scheduled: true,
            timezone: "Europe/Istanbul" // Turkey timezone
        })

        console.log('✅ Daily sync scheduled')
    }

    // Weekly deep sync (Sundays at 1 AM)
    startWeeklySync() {
        console.log('📅 Setting up weekly deep sync on Sundays at 1:00 AM...')

        cron.schedule('0 1 * * 0', async () => {
            if (this.isRunning) {
                console.log('⏳ Scholarship sync already running, skipping...')
                return
            }

            this.isRunning = true
            try {
                console.log('🗓️ Running weekly deep scholarship sync...')

                // Could add additional logic here for deep cleaning/validation
                await runScholarshipSync()

                console.log('✅ Weekly deep sync completed')
            } catch (error) {
                console.error('❌ Weekly sync failed:', error)
            } finally {
                this.isRunning = false
            }
        }, {
            scheduled: true,
            timezone: "Europe/Istanbul"
        })

        console.log('✅ Weekly sync scheduled')
    }

    // Manual sync trigger (for testing)
    async runManualSync() {
        if (this.isRunning) {
            throw new Error('Sync already in progress')
        }

        this.isRunning = true
        try {
            console.log('🔄 Running manual scholarship sync...')
            await runScholarshipSync()
            console.log('✅ Manual sync completed')
            return true
        } catch (error) {
            console.error('❌ Manual sync failed:', error)
            throw error
        } finally {
            this.isRunning = false
        }
    }

    getSyncStatus() {
        return {
            isRunning: this.isRunning,
            nextDailySync: '2:00 AM daily',
            nextWeeklySync: '1:00 AM Sundays'
        }
    }
}

// Export singleton
export const scholarshipCron = new ScholarshipCronManager()

// Auto-start if in production
if (process.env.NODE_ENV === 'production') {
    scholarshipCron.startDailySync()
    scholarshipCron.startWeeklySync()
    console.log('🚀 Scholarship sync automation started in production mode')
}