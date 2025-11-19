import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTurkeyVisaData() {
    console.log('🇹🇷 Adding Turkey visa information...')

    try {
        // Check if Turkey already exists
        const existingTurkey = await prisma.visaInfo.findFirst({
            where: { country: 'Turkey' }
        })

        if (existingTurkey) {
            console.log('⚠️ Turkey visa info already exists, updating...')
            await prisma.visaInfo.delete({
                where: { id: existingTurkey.id }
            })
        }

        // Add Turkey student visa information
        const turkeyVisa = await prisma.visaInfo.create({
            data: {
                id: 'visa_turkey_student_001',
                country: 'Turkey',
                visaType: 'Student Visa (İkamet İzni)',
                duration: '1-4 years renewable',
                cost: 110,
                requirements: [
                    'Passport (6+ months valid)',
                    'University acceptance letter',
                    'Financial proof (€400-600/month)',
                    'Health insurance',
                    'Academic transcripts',
                    'Turkish/English proficiency certificate',
                    'Criminal record certificate',
                    'Medical report',
                    'Residence permit application',
                    'Student residence permit fee'
                ],
                processingTime: '2-6 weeks',
                multiLanguage: {
                    tr: {
                        title: 'Türkiye Öğrenci İkamet İzni',
                        description: 'Türkiye\'de eğitim almak isteyen yabancı öğrenciler için gerekli ikamet izni. Üniversite kabulü ve mali yeterlilik belgesi ile başvurulur.'
                    },
                    en: {
                        title: 'Turkey Student Residence Permit',
                        description: 'Required residence permit for international students who want to study in Turkey. Applied with university acceptance and financial proof.'
                    }
                },
                website: 'https://www.goc.gov.tr/student-residence-permit',
                description: 'Türkiye\'de 90 günden fazla eğitim alacak yabancı öğrenciler için zorunlu ikamet izni. YÖK onaylı üniversitelerde öğrenim için gereklidir.',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })

        console.log('✅ Turkey visa information added successfully!')
        console.log(`📝 Turkey visa details:`)
        console.log(`   - Cost: $${turkeyVisa.cost}`)
        console.log(`   - Processing: ${turkeyVisa.processingTime}`)
        console.log(`   - Requirements: ${turkeyVisa.requirements.length} items`)

        return turkeyVisa

    } catch (error) {
        console.error('❌ Error adding Turkey visa data:', error)
        throw error
    }
}

async function main() {
    try {
        await addTurkeyVisaData()

        // Verify total count
        const totalCount = await prisma.visaInfo.count()
        console.log(`🌍 Total visa records in database: ${totalCount}`)

        // Show Turkey in context
        const turkeyInfo = await prisma.visaInfo.findFirst({
            where: { country: 'Turkey' }
        })

        if (turkeyInfo) {
            console.log('🇹🇷 Turkey visa info verified in database')
        }

    } catch (error) {
        console.error('❌ Main execution error:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
    .catch(console.error)