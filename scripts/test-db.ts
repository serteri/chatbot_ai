import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Testing connection to Neon PostgreSQL (Sydney Region)...')
    try {
        const result = await prisma.$queryRaw`SELECT current_setting('server_version'), current_timestamp, current_database();`
        console.log('✅ Connection Successful!')
        console.log('Database details:', result)

        // Quick query test
        const userCount = await prisma.user.count()
        console.log('Total Users:', userCount)

    } catch (error) {
        console.error('❌ Connection Failed:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
