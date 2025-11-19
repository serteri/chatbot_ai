import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🛂 Seeding Visa Information...')

    // Clear existing visa data (optional)
    await prisma.visaInfo.deleteMany()

    // Insert sample visa data
    const visaData = [
        {
            id: 'visa_usa_student_001',
            country: 'USA',
            visaType: 'Student',
            duration: 'Program duration + 60 days',
            cost: 350,
            requirements: [
                'Kabul mektubu',
                'SEVIS I-20 formu',
                'Mali durum belgesi',
                'Pasaport',
                'DS-160 formu',
                'Visa başvuru ücreti makbuzu',
                'Fotoğraf'
            ],
            processingTime: '2-8 hafta',
            multiLanguage: {
                tr: {
                    title: 'Amerika F-1 Öğrenci Vizesi',
                    description: 'Amerika\'da eğitim almak için gerekli vize'
                },
                en: {
                    title: 'USA F-1 Student Visa',
                    description: 'Required visa for studying in the United States'
                }
            },
            website: 'https://travel.state.gov/content/travel/en/us-visas/study.html',
            description: 'F-1 vizesi Amerika Birleşik Devletleri\'nde akademik eğitim almak isteyen öğrenciler için gerekli vizedir. Bu vize programın süresi boyunca geçerlidir.'
        },
        {
            id: 'visa_germany_student_001',
            country: 'Germany',
            visaType: 'Student',
            duration: '1-4 yıl (program süresine göre)',
            cost: 75,
            requirements: [
                'Üniversite kabul mektubu',
                'Mali durum belgesi',
                'Pasaport',
                'Vize başvuru formu',
                'Biyometrik fotoğraf',
                'Sağlık sigortası',
                'Akademik belgeler'
            ],
            processingTime: '4-8 hafta',
            multiLanguage: {
                tr: {
                    title: 'Almanya Öğrenci Vizesi',
                    description: 'Almanya\'da eğitim için gerekli ulusal vize'
                },
                en: {
                    title: 'Germany Student Visa',
                    description: 'National visa required for studying in Germany'
                }
            },
            website: 'https://www.germany.travel/en/ms/german-visa/student-visa.html',
            description: 'Almanya öğrenci vizesi 90 günden uzun eğitim programları için gerekli ulusal vizedir. AB dışı öğrenciler için zorunludur.'
        },
        {
            id: 'visa_uk_student_001',
            country: 'UK',
            visaType: 'Student',
            duration: 'Program süresi + 4 ay',
            cost: 348,
            requirements: [
                'CAS (Confirmation of Acceptance)',
                'Mali durum belgesi',
                'İngilizce yeterlilik belgesi',
                'Pasaport',
                'Online başvuru formu',
                'Biyometrik bilgiler',
                'Tüberküloz testi'
            ],
            processingTime: '3-8 hafta',
            multiLanguage: {
                tr: {
                    title: 'İngiltere Öğrenci Vizesi',
                    description: 'İngiltere\'de eğitim için gerekli vize'
                },
                en: {
                    title: 'UK Student Visa',
                    description: 'Required visa for studying in the United Kingdom'
                }
            },
            website: 'https://www.gov.uk/student-visa',
            description: 'İngiltere öğrenci vizesi 6 aydan uzun eğitim programları için gereklidir. Tier 4 vizesinin yerini almıştır.'
        },
        {
            id: 'visa_canada_student_001',
            country: 'Canada',
            visaType: 'Student',
            duration: 'Program süresi + 90 gün',
            cost: 150,
            requirements: [
                'Kabul mektubu',
                'Mali durum belgesi',
                'Pasaport',
                'Online başvuru',
                'Biyometrik bilgiler',
                'Sağlık muayenesi',
                'Polis raporu'
            ],
            processingTime: '4-12 hafta',
            multiLanguage: {
                tr: {
                    title: 'Kanada Öğrenci İzni',
                    description: 'Kanada\'da eğitim için gerekli çalışma izni'
                },
                en: {
                    title: 'Canada Study Permit',
                    description: 'Required permit for studying in Canada'
                }
            },
            website: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html',
            description: 'Kanada çalışma izni 6 aydan uzun eğitim programları için gereklidir. Bu izinle sınırlı çalışma hakkı da verilir.'
        },
        {
            id: 'visa_australia_student_001',
            country: 'Australia',
            visaType: 'Student',
            duration: 'Program süresi + 2-4 ay',
            cost: 620,
            requirements: [
                'eCoE (Confirmation of Enrolment)',
                'OSHC sağlık sigortası',
                'Mali durum belgesi',
                'İngilizce yeterlilik',
                'Pasaport',
                'Online başvuru',
                'Sağlık muayenesi'
            ],
            processingTime: '4-12 hafta',
            multiLanguage: {
                tr: {
                    title: 'Avustralya Öğrenci Vizesi',
                    description: 'Avustralya\'da eğitim için gerekli vize'
                },
                en: {
                    title: 'Australia Student Visa',
                    description: 'Required visa for studying in Australia'
                }
            },
            website: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500',
            description: 'Avustralya Subclass 500 öğrenci vizesi tüm eğitim seviyelerini kapsar ve çalışma hakkı sağlar.'
        }
    ]

    // Insert all visa records
    for (const visa of visaData) {
        const created = await prisma.visaInfo.create({
            data: visa
        })
        console.log(`✅ Created visa info: ${created.country} - ${created.visaType}`)
    }

    console.log('🎉 Visa data seeding completed!')

    // Verify data
    const count = await prisma.visaInfo.count()
    console.log(`📊 Total visa records: ${count}`)
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })