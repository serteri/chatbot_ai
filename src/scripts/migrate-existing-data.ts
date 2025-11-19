// DATABASE MIGRATION SCRIPT - Fix NULL values before schema update
// src/scripts/migrate-existing-data.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateExistingData() {
    console.log('🔧 Starting data migration...')

    try {
        // 1. Update NULL model values in Chatbot table
        console.log('📊 Fixing Chatbot model NULL values...')

        const result = await prisma.chatbot.updateMany({
            where: {
                model: null
            },
            data: {
                model: 'gpt-3.5-turbo' // Set default value
            }
        })

        console.log(`✅ Updated ${result.count} chatbots with NULL model values`)

        // 2. Add systemPrompt to chatbots that might be missing it
        console.log('📝 Checking for missing systemPrompt values...')

        const chatbotsWithoutPrompt = await prisma.chatbot.findMany({
            where: {
                OR: [
                    { systemPrompt: null },
                    { systemPrompt: '' }
                ]
            }
        })

        if (chatbotsWithoutPrompt.length > 0) {
            console.log(`Found ${chatbotsWithoutPrompt.length} chatbots without systemPrompt`)

            for (const chatbot of chatbotsWithoutPrompt) {
                await prisma.chatbot.update({
                    where: { id: chatbot.id },
                    data: {
                        systemPrompt: 'You are a helpful AI assistant.'
                    }
                })
            }

            console.log(`✅ Updated ${chatbotsWithoutPrompt.length} chatbots with default systemPrompt`)
        }

        // 3. Check University table for any issues
        console.log('🏫 Checking University table...')

        const universityCount = await prisma.university.count()
        console.log(`Found ${universityCount} universities in database`)

        console.log('✅ Data migration completed successfully!')
        console.log('🚀 Now you can run: npx prisma db push')

    } catch (error) {
        console.error('❌ Migration failed:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

// Run the migration
if (require.main === module) {
    migrateExistingData()
        .catch((error) => {
            console.error('Migration error:', error)
            process.exit(1)
        })
}

export default migrateExistingData