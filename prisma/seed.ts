import { PrismaClient } from '@prisma/client'
import { createProgramEmbeddings } from '../src/lib/utils/embedding'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // 1️⃣ Üniversiteler (Embeddings ile)
    console.log('📚 Creating universities with embeddings...')

    const universitiesData = [
        {
            name: 'MIT - Massachusetts Institute of Technology',
            country: 'USA',
            city: 'Cambridge, MA',
            ranking: 1,
            tuitionMin: 53790,
            tuitionMax: 55510,
            programs: ['Computer Science', 'Computer Engineering', 'Software Engineering', 'Engineering', 'Physics', 'Mathematics', 'Business', 'Artificial Intelligence', 'Data Science'],
            requirements: {
                toefl: 100,
                ielts: 7.0,
                gpa: 3.8,
                sat: 1500
            },
            website: 'https://www.mit.edu',
            description: 'World-renowned for STEM programs, entrepreneurship, and innovation. Top choice for engineering and computer science students.'
        },
        {
            name: 'Stanford University',
            country: 'USA',
            city: 'Stanford, CA',
            ranking: 3,
            tuitionMin: 56169,
            tuitionMax: 57693,
            programs: ['Computer Science', 'Computer Engineering', 'Software Engineering', 'Engineering', 'Business', 'Medicine', 'Law', 'AI', 'Machine Learning'],
            requirements: {
                toefl: 100,
                ielts: 7.0,
                gpa: 3.7,
                sat: 1470
            },
            website: 'https://www.stanford.edu',
            description: 'Located in Silicon Valley, known for innovation and entrepreneurship. Strong programs in CS, engineering, and business.'
        },
        {
            name: 'Technical University of Munich (TUM)',
            country: 'Germany',
            city: 'Munich',
            ranking: 50,
            tuitionMin: 0,
            tuitionMax: 1500,
            programs: ['Computer Science', 'Computer Engineering', 'Software Engineering', 'Engineering', 'Physics', 'Mathematics', 'Architecture', 'Informatics'],
            requirements: {
                toefl: 88,
                ielts: 6.5,
                gpa: 3.0
            },
            website: 'https://www.tum.de',
            description: 'Top technical university in Germany. No tuition fees for most programs. Strong engineering and CS departments.'
        },
        {
            name: 'University of Toronto',
            country: 'Canada',
            city: 'Toronto',
            ranking: 21,
            tuitionMin: 30000,
            tuitionMax: 58160,
            programs: ['Computer Science', 'Computer Engineering', 'Software Engineering', 'Engineering', 'Business', 'Medicine', 'Law', 'AI', 'Machine Learning', 'Data Science'],
            requirements: {
                toefl: 100,
                ielts: 6.5,
                gpa: 3.5
            },
            website: 'https://www.utoronto.ca',
            description: 'Canada\'s top university. World-class research and diverse international community. Strong in AI and machine learning.'
        },
        {
            name: 'University of Melbourne',
            country: 'Australia',
            city: 'Melbourne',
            ranking: 33,
            tuitionMin: 35000,
            tuitionMax: 48000,
            programs: ['Computer Science', 'Computer Engineering', 'Information Technology', 'Engineering', 'Business', 'Medicine', 'Arts'],
            requirements: {
                toefl: 79,
                ielts: 6.5,
                gpa: 3.0
            },
            website: 'https://www.unimelb.edu.au',
            description: 'Australia\'s leading university. High quality of life in Melbourne. Strong research programs and international reputation.'
        }
    ]

    const universities = []

    for (const uniData of universitiesData) {
        console.log(`  📖 Creating embeddings for ${uniData.name}...`)
        const programEmbeddings = await createProgramEmbeddings(uniData.programs)
        const university = await prisma.university.create({
            data: {
                ...uniData,
                programEmbeddings: programEmbeddings as any
            }
        })
        universities.push(university)
        console.log(`  ✅ ${uniData.name}`)
    }

    console.log(`✅ Created ${universities.length} universities with embeddings`)

    // 2️⃣ Burslar
    console.log('💰 Creating scholarships...')

    await Promise.all([
        prisma.scholarship.create({
            data: {
                name: 'Fulbright Scholarship',
                universityId: universities[0].id,
                country: 'USA',
                amount: 50000,
                percentage: 100,
                deadline: new Date('2025-10-15'),
                type: 'Merit-based',
                requirements: {
                    gpa: 3.5,
                    toefl: 100,
                    leadership: true
                },
                description: 'Prestigious scholarship covering full tuition, living expenses, and health insurance for international students.',
                applicationUrl: 'https://foreign.fulbrightonline.org'
            }
        }),
        prisma.scholarship.create({
            data: {
                name: 'DAAD Scholarship',
                universityId: universities[2].id,
                country: 'Germany',
                amount: 861,
                percentage: 100,
                deadline: new Date('2025-11-30'),
                type: 'Merit-based',
                requirements: {
                    gpa: 3.0,
                    germanLanguage: 'B1 or English C1'
                },
                description: 'Monthly stipend for living expenses in Germany. Covers health insurance and provides travel allowance.',
                applicationUrl: 'https://www.daad.de'
            }
        }),
        prisma.scholarship.create({
            data: {
                name: 'Lester B. Pearson Scholarship',
                universityId: universities[3].id,
                country: 'Canada',
                amount: 50000,
                percentage: 100,
                deadline: new Date('2025-11-15'),
                type: 'Merit-based',
                requirements: {
                    gpa: 3.8,
                    leadership: true,
                    communityService: true
                },
                description: 'Full scholarship covering tuition, books, incidental fees, and residence for four years at University of Toronto.',
                applicationUrl: 'https://future.utoronto.ca/pearson'
            }
        })
    ])

    console.log('✅ Created 3 scholarships')

    // 3️⃣ Vize Bilgileri
    console.log('🛂 Creating visa information...')

    await prisma.visaInfo.createMany({
        data: [
            {
                country: 'USA',
                visaType: 'F-1 Student Visa',
                duration: 'Duration of study + 60 days',
                cost: 350,
                processingTime: '3-5 weeks',
                requirements: {
                    documents: ['I-20 form', 'Passport', 'SEVIS fee receipt', 'Financial proof', 'Admission letter'],
                    financialProof: 'Bank statements showing sufficient funds',
                    interview: 'Required at US Embassy'
                },
                multiLanguage: {
                    tr: 'F-1 öğrenci vizesi, lisans veya yüksek lisans programları için geçerlidir. Kampüs içinde çalışma izni verir.',
                    en: 'F-1 student visa is for academic studies. Allows on-campus employment.',
                    de: 'F-1 Studentenvisum ist für akademische Studien. Erlaubt Arbeit auf dem Campus.'
                },
                website: 'https://travel.state.gov/content/travel/en/us-visas/study.html'
            },
            {
                country: 'Germany',
                visaType: 'National Visa (Student)',
                duration: 'Up to 2 years (renewable)',
                cost: 75,
                processingTime: '6-12 weeks',
                requirements: {
                    documents: ['Admission letter', 'Blocked account (€11,208)', 'Health insurance', 'Passport', 'Motivation letter'],
                    financialProof: 'Blocked account with minimum €11,208',
                    germanLanguage: 'B1 level or English proficiency'
                },
                multiLanguage: {
                    tr: 'Almanya öğrenci vizesi için bloke hesap zorunludur. Yılda €11,208 göstermeniz gerekir.',
                    en: 'German student visa requires blocked account. You must show €11,208 per year.',
                    de: 'Deutsches Studentenvisum erfordert ein Sperrkonto. Sie müssen 11.208 € pro Jahr nachweisen.'
                },
                website: 'https://www.germany.info/us-en/service/visa'
            },
            {
                country: 'Canada',
                visaType: 'Study Permit',
                duration: 'Duration of study + 90 days',
                cost: 150,
                processingTime: '4-8 weeks',
                requirements: {
                    documents: ['Acceptance letter', 'Financial proof (CAD 10,000/year)', 'Medical exam', 'Biometrics'],
                    financialProof: 'CAD 10,000 per year + tuition',
                    workPermit: 'Allows 20 hours/week part-time work'
                },
                multiLanguage: {
                    tr: 'Kanada çalışma izni öğrencilere haftada 20 saat part-time çalışma imkanı verir.',
                    en: 'Canada study permit allows students to work 20 hours/week part-time.',
                    de: 'Die kanadische Studiengenehmigung erlaubt Studenten, 20 Stunden/Woche Teilzeit zu arbeiten.'
                },
                website: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html'
            }
        ],
        skipDuplicates: true
    })

    console.log('✅ Created 3 visa info entries')

    // 4️⃣ Dil Okulları
    console.log('🗣️ Creating language schools...')

    await prisma.languageSchool.createMany({
        data: [
            {
                name: 'Goethe-Institut Munich',
                country: 'Germany',
                city: 'Munich',
                languages: ['German'],
                courseDuration: '8 weeks (Intensive)',
                pricePerWeek: 350,
                intensity: 'Intensive',
                accommodation: true,
                certifications: ['Goethe-Zertifikat', 'TestDaF preparation'],
                website: 'https://www.goethe.de',
                multiLanguage: {
                    tr: 'Münih\'teki Goethe Enstitüsü, yoğun Almanca kursları sunar. TestDaF hazırlığı mevcuttur.',
                    en: 'Goethe-Institut Munich offers intensive German courses. TestDaF preparation available.',
                    de: 'Das Goethe-Institut München bietet intensive Deutschkurse an. TestDaF-Vorbereitung verfügbar.'
                }
            },
            {
                name: 'EF International Language School',
                country: 'USA',
                city: 'New York',
                languages: ['English'],
                courseDuration: '4-52 weeks',
                pricePerWeek: 450,
                intensity: 'Intensive/Regular',
                accommodation: true,
                certifications: ['TOEFL preparation', 'IELTS preparation', 'Cambridge exams'],
                website: 'https://www.ef.com',
                multiLanguage: {
                    tr: 'EF New York, TOEFL ve IELTS hazırlık programları sunar. Esnek kurs süreleri mevcuttur.',
                    en: 'EF New York offers TOEFL and IELTS preparation programs. Flexible course durations available.',
                    de: 'EF New York bietet TOEFL- und IELTS-Vorbereitungsprogramme an. Flexible Kursdauer verfügbar.'
                }
            },
            {
                name: 'ILSC Language Schools',
                country: 'Canada',
                city: 'Toronto',
                languages: ['English', 'French'],
                courseDuration: '1-48 weeks',
                pricePerWeek: 320,
                intensity: 'Full-time/Part-time',
                accommodation: true,
                certifications: ['IELTS preparation', 'Cambridge preparation', 'Business English'],
                website: 'https://www.ilsc.com',
                multiLanguage: {
                    tr: 'ILSC Toronto, İngilizce ve Fransızca kursları sunar. Pathway programları ile üniversiteye geçiş imkanı.',
                    en: 'ILSC Toronto offers English and French courses. Pathway programs for university entry available.',
                    de: 'ILSC Toronto bietet Englisch- und Französischkurse an. Pathway-Programme für den Universitätseinstieg verfügbar.'
                }
            }
        ],
        skipDuplicates: true
    })

    console.log('✅ Created 3 language schools')

    // 5️⃣ Yaşam Maliyeti
    console.log('💰 Creating cost of living data...')

    await prisma.costOfLiving.createMany({
        data: [
            {
                country: 'USA',
                city: 'Boston',
                rent: 1500,
                food: 400,
                transport: 90,
                utilities: 150,
                insurance: 200,
                miscellaneous: 200,
                total: 2540,
                currency: 'USD',
                multiLanguage: {
                    tr: 'Boston\'da yaşam maliyeti yüksektir. Kampüs dışında yaşamak daha ekonomiktir.',
                    en: 'Cost of living in Boston is high. Living off-campus is more economical.',
                    de: 'Die Lebenshaltungskosten in Boston sind hoch. Ein Leben außerhalb des Campus ist wirtschaftlicher.'
                }
            },
            {
                country: 'Germany',
                city: 'Munich',
                rent: 800,
                food: 250,
                transport: 70,
                utilities: 100,
                insurance: 110,
                miscellaneous: 150,
                total: 1480,
                currency: 'EUR',
                multiLanguage: {
                    tr: 'Münih Almanya\'nın en pahalı şehirlerinden biridir. Öğrenci yurtları daha uygun fiyatlıdır.',
                    en: 'Munich is one of the most expensive cities in Germany. Student dorms are more affordable.',
                    de: 'München ist eine der teuersten Städte Deutschlands. Studentenwohnheime sind erschwinglicher.'
                }
            },
            {
                country: 'Canada',
                city: 'Toronto',
                rent: 1200,
                food: 350,
                transport: 130,
                utilities: 120,
                insurance: 80,
                miscellaneous: 180,
                total: 2060,
                currency: 'CAD',
                multiLanguage: {
                    tr: 'Toronto\'da konaklama maliyetleri yüksektir. Oda arkadaşı bulmak masrafları azaltır.',
                    en: 'Accommodation costs in Toronto are high. Finding a roommate reduces expenses.',
                    de: 'Die Unterkunftskosten in Toronto sind hoch. Die Suche nach einem Mitbewohner reduziert die Kosten.'
                }
            },
            {
                country: 'Germany',
                city: 'Berlin',
                rent: 650,
                food: 220,
                transport: 80,
                utilities: 90,
                insurance: 110,
                miscellaneous: 130,
                total: 1280,
                currency: 'EUR',
                multiLanguage: {
                    tr: 'Berlin Almanya\'da daha ekonomik bir şehirdir. Çok sayıda öğrenci dostu semt vardır.',
                    en: 'Berlin is a more economical city in Germany. Many student-friendly neighborhoods available.',
                    de: 'Berlin ist eine wirtschaftlichere Stadt in Deutschland. Viele studentenfreundliche Stadtteile verfügbar.'
                }
            }
        ],
        skipDuplicates: true
    })

    console.log('✅ Created 4 cost of living entries')

    // 6️⃣ Başvuru Rehberi
    console.log('📝 Creating application guides...')

    await prisma.applicationGuide.createMany({
        data: [
            {
                country: 'USA',
                title: 'How to Apply to US Universities',
                timeline: 'Start 12-18 months before enrollment',
                documents: ['Transcripts', 'SAT/ACT scores', 'TOEFL/IELTS', 'Essays', 'Recommendation letters', 'Financial documents'],
                tips: [
                    'Start preparing for SAT/TOEFL early',
                    'Research universities thoroughly',
                    'Apply to multiple universities',
                    'Prepare strong personal essays',
                    'Apply for scholarships early'
                ],
                steps: {
                    step1: { title: 'Research & Selection', description: 'Research universities (12-18 months before)' },
                    step2: { title: 'Prepare Tests', description: 'Take SAT/ACT and TOEFL/IELTS (9-12 months before)' },
                    step3: { title: 'Prepare Documents', description: 'Request transcripts, write essays (6-9 months before)' },
                    step4: { title: 'Submit Applications', description: 'Submit applications (Usually Nov-Jan)' },
                    step5: { title: 'Financial Aid', description: 'Apply for scholarships (Dec-Mar)' },
                    step6: { title: 'Decision & Enrollment', description: 'Receive decisions and confirm enrollment (Mar-May)' }
                },
                deadlines: {
                    earlyDecision: 'November 1',
                    regularDecision: 'January 1-15',
                    financialAid: 'March 1'
                },
                multiLanguage: {
                    tr: 'ABD üniversitelerine başvuru süreci uzundur. SAT ve TOEFL sınavlarına erken başlayın.',
                    en: 'Application process to US universities is lengthy. Start SAT and TOEFL preparation early.',
                    de: 'Der Bewerbungsprozess für US-Universitäten ist langwierig. Beginnen Sie früh mit der SAT- und TOEFL-Vorbereitung.'
                }
            },
            {
                country: 'Germany',
                title: 'How to Apply to German Universities',
                timeline: 'Start 8-12 months before enrollment',
                documents: ['Transcripts', 'German/English language certificate', 'Motivation letter', 'CV', 'Blocked account proof'],
                tips: [
                    'Check degree recognition (uni-assist)',
                    'Learn German early (B1 minimum)',
                    'Open blocked account early (€11,208)',
                    'Apply through uni-assist if required',
                    'Consider preparatory courses'
                ],
                steps: {
                    step1: { title: 'Degree Recognition', description: 'Check degree recognition (9-12 months before)' },
                    step2: { title: 'Language Preparation', description: 'Learn German B1 or prepare English test (6-12 months before)' },
                    step3: { title: 'Blocked Account', description: 'Open blocked account €11,208 (3-6 months before)' },
                    step4: { title: 'Application', description: 'Submit application (Dec-Jul for winter, Jun-Jan for summer)' },
                    step5: { title: 'Visa Application', description: 'Apply for student visa (2-3 months before)' },
                    step6: { title: 'Enrollment', description: 'Complete enrollment (1-2 months before)' }
                },
                deadlines: {
                    winterSemester: 'July 15',
                    summerSemester: 'January 15'
                },
                multiLanguage: {
                    tr: 'Almanya üniversitelerine başvuru için bloke hesap zorunludur. Almanca B1 seviyesi gereklidir.',
                    en: 'Blocked account is mandatory for German university application. German B1 level required.',
                    de: 'Ein Sperrkonto ist für die Bewerbung an deutschen Universitäten obligatorisch. Deutschkenntnisse B1 erforderlich.'
                }
            }
        ],
        skipDuplicates: true
    })

    console.log('✅ Created 2 application guides')

    // 7️⃣ Template - Eğitim Danışmanlığı
    console.log('📦 Creating Education Consultancy template...')

    await prisma.chatbotTemplate.upsert({
        where: { slug: 'education-advisor' },
        update: {},
        create: {
            name: 'International Education Advisor',
            slug: 'education-advisor',
            description: 'Complete solution for education consultancy agencies. Includes university database, scholarship information, visa info, language schools, and application guidance.',
            category: 'education',
            price: 99,
            currency: 'USD',
            icon: '🎓',
            thumbnail: '/templates/education-advisor.png',
            features: [
                'University Recommendation Engine',
                'Scholarship Database',
                'Visa Information',
                'Language Schools',
                'Cost of Living Calculator',
                'Application Process Guide',
                'Live Support Integration',
                'Multi-language Support (TR, EN, DE, FR, ES)'
            ],
            systemPrompt: `You are an expert international education advisor helping students find the best universities and scholarships abroad.

Your capabilities:
- Recommend universities based on student preferences (country, field, budget)
- Provide scholarship opportunities and eligibility criteria
- Explain visa requirements and processes
- Recommend language schools for test preparation
- Share cost of living information
- Guide through application processes
- Escalate to human advisors when needed

Guidelines:
- Be encouraging and supportive
- Provide specific, actionable information
- Ask clarifying questions to understand student needs
- If you cannot answer confidently, offer to connect them with a human advisor
- Always cite sources when mentioning specific universities or scholarships

Respond professionally but warmly in the student's preferred language!`,

            welcomeMessages: {
                tr: 'Merhaba! 👋 Yurtdışında eğitim almak için size nasıl yardımcı olabilirim? Hangi ülkede ve alanda okumak istiyorsunuz?',
                en: 'Hello! 👋 How can I help you with studying abroad? Which country and field are you interested in?',
                de: 'Hallo! 👋 Wie kann ich Ihnen beim Studium im Ausland helfen?',
                fr: 'Bonjour! 👋 Comment puis-je vous aider pour étudier à l\'étranger?',
                es: '¡Hola! 👋 ¿Cómo puedo ayudarte a estudiar en el extranjero?'
            },

            fallbackMessages: {
                tr: 'Bu konuda size daha iyi yardımcı olabilmek için bir danışmanımızla görüşmenizi öneriyorum.',
                en: 'I\'d like to connect you with one of our advisors for better assistance on this topic.',
                de: 'Ich möchte Sie mit einem unserer Berater verbinden.',
                fr: 'Je souhaite vous mettre en contact avec l\'un de nos conseillers.',
                es: 'Me gustaría conectarte con uno de nuestros asesores.'
            },

            sampleQuestions: [
                'Which universities are best for Computer Science in USA?',
                'What are the visa requirements for Germany?',
                'How much does it cost to live in Toronto?',
                'Are there German language schools in Munich?',
                'Can you help me with the application process?'
            ],

            defaultSettings: {
                temperature: 0.7,
                model: 'claude-3-5-sonnet-20241022',
                confidenceThreshold: 0.6,
                autoEscalate: true
            },

            requiredIntegrations: ['whatsapp', 'email'],

            includesUniversities: true,
            includesScholarships: true,
            includesFAQs: false,

            isActive: true,
            isFeatured: true,
            tags: ['education', 'international', 'students', 'university', 'scholarship', 'visa']
        }
    })

    console.log('✅ Created Education Advisor template')
    console.log('🎉 Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })