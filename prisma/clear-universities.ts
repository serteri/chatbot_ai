import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clearUniversities() {
    console.log('Deleting all universities...');

    const { count } = await prisma.university.deleteMany({}); // Koşulsuz deleteMany = Hepsini sil

    console.log(`✅ Successfully deleted ${count} universities.`);
}

clearUniversities()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });