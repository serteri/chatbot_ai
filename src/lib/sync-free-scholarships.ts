// Free Scholarship Sync (No API Keys Required)
// src/lib/sync-free-scholarships.ts

import { freeScholarshipSync } from './scholarship-apis/free-sources'

export async function runFreeScholarshipSync() {
    console.log('🆓 ChatbotAI FREE Scholarship Sync')
    console.log('=' .repeat(40))
    console.log('✅ No API keys required!')
    console.log('')

    try {
        // Run free sync
        await freeScholarshipSync.syncAllScholarships()

        console.log('')
        console.log('🎯 Results:')
        console.log('  • Government programs: Fulbright, DAAD, Chevening')
        console.log('  • University scholarships: MIT, Oxford')
        console.log('  • Foundation programs: Gates Cambridge, Erasmus')
        console.log('')
        console.log('✅ FREE scholarship sync completed successfully!')
        console.log('🎓 Your students now have access to real scholarship opportunities!')

    } catch (error) {
        console.error('❌ FREE scholarship sync failed:', error)
        process.exit(1)
    }
}

// Run if called directly
if (process.argv[1]?.endsWith('sync-free-scholarships.ts') || process.argv[1]?.endsWith('sync-free-scholarships.js')) {
    runFreeScholarshipSync()
        .then(() => {
            process.exit(0)
        })
        .catch((error) => {
            console.error('Sync error:', error)
            process.exit(1)
        })
}