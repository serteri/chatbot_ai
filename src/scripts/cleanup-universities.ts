import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupUniversityDatabase() {
    console.log('🧹 Starting University Database Cleanup...')

    try {
        // 1. First, let's see what we have
        const totalBefore = await prisma.university.count()
        console.log(`📊 Total universities before cleanup: ${totalBefore}`)

        // 2. Find all universities
        const allUniversities = await prisma.university.findMany({
            select: {
                id: true,
                name: true,
                country: true,
                ranking: true,
                programs: true,
                tuitionMin: true,
                tuitionMax: true
            }
        })

        // 3. Group by normalized name and country
        const universityGroups: Record<string, any[]> = {}

        for (const uni of allUniversities) {
            // Normalize university name (remove campus suffixes)
            let normalizedName = uni.name
                .replace(/ - Main Campus$/i, '')
                .replace(/ - City Campus$/i, '')
                .replace(/ - Online$/i, '')
                .replace(/ - Campus$/i, '')
                .replace(/ Campus$/i, '')
                .replace(/\s+/g, ' ')
                .trim()

            const key = `${normalizedName}|${uni.country}`

            if (!universityGroups[key]) {
                universityGroups[key] = []
            }
            universityGroups[key].push(uni)
        }

        console.log(`📋 Found ${Object.keys(universityGroups).length} unique universities`)

        // 4. Process duplicates
        let duplicatesFound = 0
        let duplicatesRemoved = 0

        const universitiesToDelete: string[] = []
        const universitiesToUpdate: { id: string, name: string }[] = []

        for (const [key, universities] of Object.entries(universityGroups)) {
            const [normalizedName, country] = key.split('|')

            if (universities.length > 1) {
                duplicatesFound++
                console.log(`🔍 Found ${universities.length} duplicates for: ${normalizedName} (${country})`)

                // Sort by ranking (best first), then by name length (shorter first)
                universities.sort((a, b) => {
                    if (a.ranking && b.ranking) return a.ranking - b.ranking
                    if (a.ranking && !b.ranking) return -1
                    if (!a.ranking && b.ranking) return 1
                    return a.name.length - b.name.length
                })

                // Keep the best one (first after sorting)
                const keeper = universities[0]
                const duplicates = universities.slice(1)

                // Update keeper's name to normalized version if needed
                if (keeper.name !== normalizedName) {
                    universitiesToUpdate.push({
                        id: keeper.id,
                        name: normalizedName
                    })
                }

                // Mark duplicates for deletion
                for (const duplicate of duplicates) {
                    universitiesToDelete.push(duplicate.id)
                }

                console.log(`   ✅ Keeping: ${keeper.name} (Ranking: ${keeper.ranking || 'N/A'})`)
                console.log(`   ❌ Removing: ${duplicates.map(d => d.name).join(', ')}`)
            }
        }

        console.log(`\n📈 Summary:`)
        console.log(`   🔍 Groups with duplicates: ${duplicatesFound}`)
        console.log(`   📝 Universities to update: ${universitiesToUpdate.length}`)
        console.log(`   🗑️ Universities to delete: ${universitiesToDelete.length}`)

        // 5. Execute cleanup
        if (universitiesToDelete.length > 0) {
            console.log('\n🗑️ Deleting duplicates...')
            const deleteResult = await prisma.university.deleteMany({
                where: {
                    id: {
                        in: universitiesToDelete
                    }
                }
            })
            console.log(`✅ Deleted ${deleteResult.count} duplicate universities`)
            duplicatesRemoved = deleteResult.count
        }

        // 6. Update names
        if (universitiesToUpdate.length > 0) {
            console.log('\n📝 Updating university names...')
            for (const update of universitiesToUpdate) {
                await prisma.university.update({
                    where: { id: update.id },
                    data: { name: update.name }
                })
            }
            console.log(`✅ Updated ${universitiesToUpdate.length} university names`)
        }

        // 7. Final count
        const totalAfter = await prisma.university.count()
        console.log(`\n🎉 Cleanup Complete!`)
        console.log(`   📊 Universities before: ${totalBefore}`)
        console.log(`   📊 Universities after: ${totalAfter}`)
        console.log(`   ✅ Duplicates removed: ${duplicatesRemoved}`)
        console.log(`   📉 Space saved: ${totalBefore - totalAfter} entries`)

        // 8. Show some samples
        console.log('\n📋 Sample universities after cleanup:')
        const sampleUnis = await prisma.university.findMany({
            select: { name: true, country: true, ranking: true },
            orderBy: { ranking: { sort: 'asc', nulls: 'last' } },
            take: 10
        })

        sampleUnis.forEach((uni, index) => {
            console.log(`   ${index + 1}. ${uni.name} (${uni.country}) - Ranking: ${uni.ranking || 'N/A'}`)
        })

    } catch (error) {
        console.error('❌ Cleanup failed:', error)
        throw error
    }
}

async function removeSpecificDuplicatePatterns() {
    console.log('\n🎯 Removing specific duplicate patterns...')

    try {
        // Remove entries with these suffixes (keep the main entry)
        const patternsToRemove = [
            '- Main Campus',
            '- City Campus',
            '- Online',
            '- Campus',
            ' Campus',
            ' - Online',
            ' - City',
            ' - Main'
        ]

        for (const pattern of patternsToRemove) {
            const result = await prisma.university.deleteMany({
                where: {
                    name: {
                        endsWith: pattern
                    }
                }
            })

            if (result.count > 0) {
                console.log(`   ✅ Removed ${result.count} entries ending with "${pattern}"`)
            }
        }

    } catch (error) {
        console.error('❌ Pattern cleanup failed:', error)
    }
}

// Run cleanup
async function runCleanup() {
    try {
        // First remove obvious patterns
        await removeSpecificDuplicatePatterns()

        // Then do comprehensive cleanup
        await cleanupUniversityDatabase()

    } catch (error) {
        console.error('💥 Cleanup script failed:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
        console.log('✅ Database connection closed')
    }
}

runCleanup()