const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Starting Claims data fix with Raw SQL...')
    
    // Use raw SQL to update records, bypassing Prisma Client validation for enum types
    // This handles the transition from lowercase 'draft' string to uppercase 'DRAFT' enum
    const count = await prisma.$executeRaw`
        UPDATE "Claim" 
        SET "status" = 'DRAFT' 
        WHERE "status" = 'draft' OR "status" IS NULL
    `

    console.log(`✅ Updated ${count} claims to DRAFT status via Raw SQL.`)
}

main()
    .catch((e) => {
        console.error('❌ Error fixing claims data:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
