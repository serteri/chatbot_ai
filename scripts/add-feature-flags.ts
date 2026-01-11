import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addFeatureFlags() {
    try {
        // Add feature flag columns using raw SQL - one at a time
        console.log('Adding hasAnalytics...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "hasAnalytics" BOOLEAN DEFAULT false`);

        console.log('Adding hasAdvancedAnalytics...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "hasAdvancedAnalytics" BOOLEAN DEFAULT false`);

        console.log('Adding hasCustomBranding...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "hasCustomBranding" BOOLEAN DEFAULT false`);

        console.log('Adding hasTeamCollaboration...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "hasTeamCollaboration" BOOLEAN DEFAULT false`);

        console.log('Adding hasCustomDomain...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "hasCustomDomain" BOOLEAN DEFAULT false`);

        console.log('Adding hasApiAccess...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "hasApiAccess" BOOLEAN DEFAULT false`);

        console.log('Adding hasPrioritySupport...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "hasPrioritySupport" BOOLEAN DEFAULT false`);

        console.log('Adding hasWhiteLabel...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "hasWhiteLabel" BOOLEAN DEFAULT false`);

        console.log('✅ Feature flag columns added successfully!');

        // Now update existing enterprise subscription with all features
        console.log('Updating enterprise subscriptions...');
        await prisma.$executeRawUnsafe(`
      UPDATE "Subscription" 
      SET 
        "hasAnalytics" = true,
        "hasAdvancedAnalytics" = true,
        "hasCustomBranding" = true,
        "hasTeamCollaboration" = true,
        "hasCustomDomain" = true,
        "hasApiAccess" = true,
        "hasPrioritySupport" = true,
        "hasWhiteLabel" = true
      WHERE "planType" = 'enterprise'
    `);

        console.log('✅ Enterprise subscriptions updated with all features!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addFeatureFlags();
