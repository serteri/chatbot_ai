// Scholarship Sync Command
// src/lib/sync-scholarships.ts

import { scholarshipSyncManager } from './scholarship-apis'

export async function runScholarshipSync() {
    console.log('🎓 ChatbotAI Scholarship Sync')
    console.log('=' .repeat(40))

    try {
        // Show current status
        const beforeInfo = await scholarshipSyncManager.getLastSyncInfo()
        console.log('📊 Current Status:')
        console.log(`  Total scholarships: ${beforeInfo.totalScholarships}`)
        console.log(`  External scholarships: ${beforeInfo.externalScholarships}`)
        console.log(`  Manual scholarships: ${beforeInfo.manualScholarships}`)
        console.log(`  Last sync: ${beforeInfo.lastSyncDate?.toISOString() || 'Never'}`)
        console.log('')

        // Run sync
        await scholarshipSyncManager.syncAllScholarships()

        // Show updated status
        const afterInfo = await scholarshipSyncManager.getLastSyncInfo()
        console.log('')
        console.log('📊 Updated Status:')
        console.log(`  Total scholarships: ${afterInfo.totalScholarships}`)
        console.log(`  External scholarships: ${afterInfo.externalScholarships}`)
        console.log(`  Manual scholarships: ${afterInfo.manualScholarships}`)
        console.log(`  Last sync: ${afterInfo.lastSyncDate?.toISOString()}`)

        console.log('')
        console.log('✅ Scholarship sync completed successfully!')

    } catch (error) {
        console.error('❌ Scholarship sync failed:', error)
        process.exit(1)
    }
}

// Run if called directly
if (process.argv[1]?.endsWith('sync-scholarships.ts') || process.argv[1]?.endsWith('sync-scholarships.js')) {
    runScholarshipSync()
        .then(() => {
            process.exit(0)
        })
        .catch((error) => {
            console.error('Sync error:', error)
            process.exit(1)
        })
}