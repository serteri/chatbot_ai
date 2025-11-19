import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌍 Seeding ULTIMATE Global Student Visa Database (60+ Countries)...')

    // Clear existing visa data
    await prisma.visaInfo.deleteMany()

    const visaData = [
        // NORTH AMERICA (3)
        {
            id: 'visa_usa_student',
            country: 'USA',
            visaType: 'Student (F-1)',
            duration: 'Program duration + 60 days',
            cost: 350,
            requirements: [
                'Passport (6+ months valid)', 'SEVIS I-20 form', 'DS-160 online form',
                'University acceptance letter', 'Financial proof ($25,000+ per year)',
                'SEVIS fee ($350)', 'Visa interview appointment', 'Biometric photo'
            ],
            processingTime: '2-8 weeks',
            multiLanguage: {
                tr: { title: 'Amerika F-1 Öğrenci Vizesi', description: 'Amerika\'da akademik eğitim için gerekli vize' },
                en: { title: 'USA F-1 Student Visa', description: 'Required for academic studies in the United States' }
            },
            website: 'https://travel.state.gov/content/travel/en/us-visas/study.html',
            description: 'F-1 vizesi Amerika\'da tam zamanlı akademik eğitim için gereklidir. Campus içi çalışma hakkı verir.'
        },
        {
            id: 'visa_canada_student',
            country: 'Canada',
            visaType: 'Study Permit',
            duration: 'Program duration + 90 days',
            cost: 150,
            requirements: [
                'Passport', 'Letter of acceptance', 'Financial proof (CAD $10,000+ per year)',
                'Medical exam (if required)', 'Police clearance', 'Statement of purpose',
                'Online application', 'Biometrics'
            ],
            processingTime: '4-12 weeks',
            multiLanguage: {
                tr: { title: 'Kanada Öğrenci İzni', description: 'Kanada\'da eğitim için gerekli izin' },
                en: { title: 'Canada Study Permit', description: 'Required permit for studying in Canada' }
            },
            website: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html',
            description: 'Kanada study permit 6+ ay programlar için gerekli. Campus içi ve dışı çalışma hakkı verir.'
        },
        {
            id: 'visa_mexico_student',
            country: 'Mexico',
            visaType: 'Student Visa (Estudiante)',
            duration: '1 year renewable',
            cost: 36,
            requirements: [
                'Passport', 'University acceptance letter', 'Financial proof ($300/month)',
                'Health certificate', 'Academic transcripts', 'Spanish proficiency',
                'Criminal record certificate', 'Consular appointment'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'Meksika Öğrenci Vizesi', description: 'Meksika\'da eğitim için gerekli vize' },
                en: { title: 'Mexico Student Visa', description: 'Required for studying in Mexico' }
            },
            website: 'https://consulmex.sre.gob.mx/general/index.php/tipos-de-visa/visa-de-estudiante',
            description: 'Meksika öğrenci vizesi 180+ gün programlar için. Sınırlı çalışma hakkı.'
        },

        // WESTERN EUROPE (12)
        {
            id: 'visa_germany_student',
            country: 'Germany',
            visaType: 'Student (National Visa)',
            duration: '1-4 years (program dependent)',
            cost: 75,
            requirements: [
                'Passport (6+ months valid)', 'University acceptance letter (Zulassung)',
                'Financial proof (€11,208/year blocked account)', 'Health insurance (EU coverage)',
                'Academic transcripts', 'Language proficiency (German/English)',
                'Motivation letter', 'Biometric photos'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'Almanya Öğrenci Vizesi', description: 'Almanya\'da eğitim için ulusal vize' },
                en: { title: 'Germany Student Visa', description: 'National visa for studies in Germany' }
            },
            website: 'https://www.germany.travel/en/ms/german-visa/student-visa.html',
            description: 'Almanya öğrenci vizesi 90+ gün programlar için gerekli. İş izni de sağlar (120 full days/year).'
        },
        {
            id: 'visa_uk_student',
            country: 'UK',
            visaType: 'Student Visa',
            duration: 'Course duration + 4 months',
            cost: 348,
            requirements: [
                'Passport', 'CAS (Confirmation of Acceptance)',
                'Financial proof (tuition + £1,023/month living)', 'English language certificate',
                'TB test (if required)', 'Academic qualifications',
                'Online application', 'Biometric information'
            ],
            processingTime: '3-8 weeks',
            multiLanguage: {
                tr: { title: 'İngiltere Öğrenci Vizesi', description: 'İngiltere\'de eğitim için gerekli vize' },
                en: { title: 'UK Student Visa', description: 'Required for study in the United Kingdom' }
            },
            website: 'https://www.gov.uk/student-visa',
            description: 'İngiltere öğrenci vizesi 6+ ay programlar için gerekli. Sınırlı çalışma hakkı verir.'
        },
        {
            id: 'visa_france_student',
            country: 'France',
            visaType: 'Long-stay Student Visa (VLS-TS)',
            duration: '1 year renewable',
            cost: 99,
            requirements: [
                'Passport', 'Campus France acceptance', 'University acceptance letter',
                'Financial proof (€615/month)', 'Health insurance', 'Academic transcripts',
                'French/English proficiency', 'Motivation letter'
            ],
            processingTime: '4-6 weeks',
            multiLanguage: {
                tr: { title: 'Fransa Öğrenci Vizesi', description: 'Fransa\'da eğitim için uzun süreli vize' },
                en: { title: 'France Student Visa', description: 'Long-stay visa for studies in France' }
            },
            website: 'https://france-visas.gouv.fr/en/web/france-visas/student-visa',
            description: 'Fransa VLS-TS 3+ ay programlar için gerekli. 964 hours/year çalışma hakkı.'
        },
        {
            id: 'visa_netherlands_student',
            country: 'Netherlands',
            visaType: 'Student Visa (MVV)',
            duration: 'Course duration',
            cost: 350,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (€13,500/year)',
                'Health insurance', 'Academic qualifications', 'English proficiency',
                'TB test', 'Legalized documents'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'Hollanda Öğrenci Vizesi', description: 'Hollanda\'da eğitim için gerekli vize' },
                en: { title: 'Netherlands Student Visa', description: 'Required for studying in the Netherlands' }
            },
            website: 'https://www.government.nl/topics/immigration/question-and-answer/how-do-i-apply-for-a-student-visa-for-the-netherlands',
            description: 'Hollanda MVV 3+ ay programlar için gerekli. 16 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_italy_student',
            country: 'Italy',
            visaType: 'Student Visa (Visto per Studio)',
            duration: '1 year renewable',
            cost: 116,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (€458.51/month)',
                'Health insurance', 'Accommodation proof', 'Academic qualifications',
                'Italian/English proficiency', 'No criminal record'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'İtalya Öğrenci Vizesi', description: 'İtalya\'da eğitim için gerekli vize' },
                en: { title: 'Italy Student Visa', description: 'Required for studying in Italy' }
            },
            website: 'https://vistoperitalia.esteri.it/home/en',
            description: 'İtalya öğrenci vizesi 90+ gün programlar için gerekli. 20 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_spain_student',
            country: 'Spain',
            visaType: 'Student Visa (Visado de Estudiante)',
            duration: '1 year renewable',
            cost: 60,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (€564/month)',
                'Health insurance', 'Medical certificate', 'Criminal record certificate',
                'Academic transcripts', 'Spanish/English proficiency'
            ],
            processingTime: '4-6 weeks',
            multiLanguage: {
                tr: { title: 'İspanya Öğrenci Vizesi', description: 'İspanya\'da eğitim için gerekli vize' },
                en: { title: 'Spain Student Visa', description: 'Required for studying in Spain' }
            },
            website: 'http://www.exteriores.gob.es/Portal/es/ServiciosAlCiudadano/InformacionParaExtranjeros/Paginas/RequisitosDeEntrada.aspx',
            description: 'İspanya öğrenci vizesi 90+ gün programlar için gerekli. 20 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_switzerland_student',
            country: 'Switzerland',
            visaType: 'Student Visa (C/D Permit)',
            duration: 'Course duration',
            cost: 150,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (CHF 21,000/year)',
                'Health insurance', 'Academic qualifications', 'Language proficiency',
                'Motivation letter', 'Criminal record certificate'
            ],
            processingTime: '8-12 weeks',
            multiLanguage: {
                tr: { title: 'İsviçre Öğrenci Vizesi', description: 'İsviçre\'de eğitim için gerekli vize' },
                en: { title: 'Switzerland Student Visa', description: 'Required for studying in Switzerland' }
            },
            website: 'https://www.sem.admin.ch/sem/en/home/themen/einreise/visumantragsverfahren.html',
            description: 'İsviçre öğrenci vizesi 90+ gün programlar için gerekli. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_austria_student',
            country: 'Austria',
            visaType: 'Student Residence Permit (D Visa)',
            duration: '1 year renewable',
            cost: 150,
            requirements: [
                'Passport', 'University admission', 'Financial proof (€11,000/year)',
                'Health insurance', 'Academic transcripts', 'German/English proficiency',
                'Criminal record certificate', 'Medical certificate'
            ],
            processingTime: '6-10 weeks',
            multiLanguage: {
                tr: { title: 'Avusturya Öğrenci İkamet İzni', description: 'Avusturya\'da eğitim için ikamet izni' },
                en: { title: 'Austria Student Residence Permit', description: 'Required for studying in Austria' }
            },
            website: 'https://www.migration.gv.at/en/types-of-immigration/temporary-immigration/students/',
            description: 'Avusturya öğrenci izni 6+ ay programlar için gerekli. 10 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_belgium_student',
            country: 'Belgium',
            visaType: 'Student Visa (Type D)',
            duration: '1 year renewable',
            cost: 180,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (€670/month)',
                'Health insurance', 'Academic qualifications', 'Language proficiency',
                'Medical certificate', 'Criminal record certificate'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'Belçika Öğrenci Vizesi', description: 'Belçika\'da eğitim için gerekli vize' },
                en: { title: 'Belgium Student Visa', description: 'Required for studying in Belgium' }
            },
            website: 'https://diplomatie.belgium.be/en/services/travel_to_belgium/visa_for_belgium/student_visa',
            description: 'Belçika öğrenci vizesi 90+ gün programlar için gerekli. 20 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_portugal_student',
            country: 'Portugal',
            visaType: 'Student Visa (D4)',
            duration: '1 year renewable',
            cost: 90,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (€760/month)',
                'Health insurance', 'Academic transcripts', 'Portuguese/English proficiency',
                'Criminal record certificate', 'Medical certificate'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'Portekiz Öğrenci Vizesi', description: 'Portekiz\'de eğitim için gerekli vize' },
                en: { title: 'Portugal Student Visa', description: 'Required for studying in Portugal' }
            },
            website: 'https://www.visportugal.com/student-visa',
            description: 'Portekiz öğrenci vizesi 90+ gün programlar için gerekli. 20 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_ireland_student',
            country: 'Ireland',
            visaType: 'Student Visa (D Study)',
            duration: 'Course duration',
            cost: 60,
            requirements: [
                'Passport', 'Letter of acceptance', 'Financial proof (€7,000/year)',
                'Health insurance', 'Academic qualifications', 'English proficiency',
                'Evidence of fees payment', 'Immigration bonds'
            ],
            processingTime: '6-10 weeks',
            multiLanguage: {
                tr: { title: 'İrlanda Öğrenci Vizesi', description: 'İrlanda\'da eğitim için gerekli vize' },
                en: { title: 'Ireland Student Visa', description: 'Required for studying in Ireland' }
            },
            website: 'http://www.inis.gov.ie/en/INIS/Pages/Student%20Immigration',
            description: 'İrlanda öğrenci vizesi 90+ gün programlar için gerekli. 20 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_luxembourg_student',
            country: 'Luxembourg',
            visaType: 'Student Authorization',
            duration: '1 year renewable',
            cost: 80,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (€1,200/month)',
                'Health insurance', 'Academic qualifications', 'Language proficiency',
                'Housing confirmation', 'Medical certificate'
            ],
            processingTime: '4-6 weeks',
            multiLanguage: {
                tr: { title: 'Lüksemburg Öğrenci Yetkilendirmesi', description: 'Lüksemburg\'da eğitim için gerekli yetki' },
                en: { title: 'Luxembourg Student Authorization', description: 'Required for studying in Luxembourg' }
            },
            website: 'https://guichet.public.lu/en/citoyens/immigration/etudier-luxembourg/autorisation-etudiant.html',
            description: 'Lüksemburg öğrenci yetkilendirmesi 90+ gün programlar için. Sınırlı çalışma hakkı.'
        },

        // NORDIC COUNTRIES (5)
        {
            id: 'visa_sweden_student',
            country: 'Sweden',
            visaType: 'Residence Permit for Studies',
            duration: 'Course duration',
            cost: 100,
            requirements: [
                'Passport', 'University admission', 'Financial proof (SEK 96,400/year)',
                'Health insurance', 'Academic transcripts', 'English proficiency',
                'Online application', 'Biometric data'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'İsveç Öğrenci İkamet İzni', description: 'İsveç\'te eğitim için ikamet izni' },
                en: { title: 'Sweden Student Residence Permit', description: 'Required for studying in Sweden' }
            },
            website: 'https://www.migrationsverket.se/English/Private-individuals/Studying-in-Sweden/Universities-and-university-colleges.html',
            description: 'İsveç öğrenci izni EU dışı öğrenciler için gerekli. Full-time çalışma hakkı (summer).'
        },
        {
            id: 'visa_norway_student',
            country: 'Norway',
            visaType: 'Student Residence Permit',
            duration: '1 year renewable',
            cost: 125,
            requirements: [
                'Passport', 'University admission', 'Financial proof (NOK 139,680/year)',
                'Academic transcripts', 'English/Norwegian proficiency', 'Health insurance',
                'Accommodation confirmation', 'Online application'
            ],
            processingTime: '4-6 weeks',
            multiLanguage: {
                tr: { title: 'Norveç Öğrenci İkamet İzni', description: 'Norveç\'te eğitim için ikamet izni' },
                en: { title: 'Norway Student Residence Permit', description: 'Required for studying in Norway' }
            },
            website: 'https://www.udi.no/en/want-to-apply/studies/',
            description: 'Norveç öğrenci izni 3+ ay programlar için. 20 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_denmark_student',
            country: 'Denmark',
            visaType: 'Student Residence Permit',
            duration: 'Course duration',
            cost: 110,
            requirements: [
                'Passport', 'University admission', 'Financial proof (DKK 100,000/year)',
                'Academic qualifications', 'English proficiency', 'Health insurance',
                'Online application (SIRI)', 'Biometric data'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'Danimarka Öğrenci İkamet İzni', description: 'Danimarka\'da eğitim için ikamet izni' },
                en: { title: 'Denmark Student Residence Permit', description: 'Required for studying in Denmark' }
            },
            website: 'https://www.nyidanmark.dk/en-GB/Applying/Study',
            description: 'Danimarka öğrenci izni EU dışı öğrenciler için. 20 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_finland_student',
            country: 'Finland',
            visaType: 'Student Residence Permit',
            duration: '1 year renewable',
            cost: 110,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (€560/month)',
                'Health insurance', 'Academic transcripts', 'English/Finnish proficiency',
                'Online application', 'Supporting documents'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'Finlandiya Öğrenci İkamet İzni', description: 'Finlandiya\'da eğitim için ikamet izni' },
                en: { title: 'Finland Student Residence Permit', description: 'Required for studying in Finland' }
            },
            website: 'https://migri.fi/en/student-residence-permit',
            description: 'Finlandiya öğrenci izni 90+ gün programlar için. 25 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_iceland_student',
            country: 'Iceland',
            visaType: 'Student Residence Permit',
            duration: 'Course duration',
            cost: 80,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (ISK 1,800,000/year)',
                'Health insurance', 'Academic qualifications', 'English proficiency',
                'Criminal record certificate', 'Medical certificate'
            ],
            processingTime: '4-6 weeks',
            multiLanguage: {
                tr: { title: 'İzlanda Öğrenci İkamet İzni', description: 'İzlanda\'da eğitim için ikamet izni' },
                en: { title: 'Iceland Student Residence Permit', description: 'Required for studying in Iceland' }
            },
            website: 'https://utl.is/index.php/en/residence-permits',
            description: 'İzlanda öğrenci izni 90+ gün programlar için. Sınırlı çalışma hakkı.'
        },

        // EASTERN EUROPE & RUSSIA (8)
        {
            id: 'visa_poland_student',
            country: 'Poland',
            visaType: 'Student Visa (Type D)',
            duration: '1 year renewable',
            cost: 80,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (PLN 2,000/month)',
                'Health insurance', 'Academic transcripts', 'Polish/English proficiency',
                'Medical certificate', 'Criminal record certificate'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'Polonya Öğrenci Vizesi', description: 'Polonya\'da eğitim için gerekli vize' },
                en: { title: 'Poland Student Visa', description: 'Required for studying in Poland' }
            },
            website: 'https://www.gov.pl/web/udsc/student-visa',
            description: 'Polonya öğrenci vizesi 90+ gün programlar için gerekli. 20 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_czechrepublic_student',
            country: 'Czech Republic',
            visaType: 'Long-term Student Visa',
            duration: '1 year renewable',
            cost: 100,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (CZK 111,480/year)',
                'Health insurance', 'Academic qualifications', 'Czech/English proficiency',
                'Criminal record certificate', 'Medical certificate'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'Çek Cumhuriyeti Öğrenci Vizesi', description: 'Çek Cumhuriyeti\'nde eğitim için vize' },
                en: { title: 'Czech Republic Student Visa', description: 'Required for studying in Czech Republic' }
            },
            website: 'https://www.mzv.cz/jnp/en/information_for_aliens/long_term_visas/study_visa.html',
            description: 'Çek Cumhuriyeti öğrenci vizesi 90+ gün programlar için. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_hungary_student',
            country: 'Hungary',
            visaType: 'Student Residence Permit (D Visa)',
            duration: '1 year renewable',
            cost: 110,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (€350-500/month)',
                'Health insurance', 'Academic transcripts', 'Hungarian/English proficiency',
                'Medical certificate', 'Criminal record certificate'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'Macaristan Öğrenci İkamet İzni', description: 'Macaristan\'da eğitim için ikamet izni' },
                en: { title: 'Hungary Student Residence Permit', description: 'Required for studying in Hungary' }
            },
            website: 'https://konzuliszolgalat.kormany.hu/en/student-visa',
            description: 'Macaristan öğrenci izni 90+ gün programlar için. 24 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_slovakia_student',
            country: 'Slovakia',
            visaType: 'Long-term Residence Permit',
            duration: '1 year renewable',
            cost: 80,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (€300/month)',
                'Health insurance', 'Academic qualifications', 'Slovak/English proficiency',
                'Criminal record certificate', 'Medical certificate'
            ],
            processingTime: '4-6 weeks',
            multiLanguage: {
                tr: { title: 'Slovakya Öğrenci İkamet İzni', description: 'Slovakya\'da eğitim için ikamet izni' },
                en: { title: 'Slovakia Student Residence Permit', description: 'Required for studying in Slovakia' }
            },
            website: 'https://www.mzv.sk/en/consular-services/visas/long-term-residence',
            description: 'Slovakya öğrenci izni 90+ gün programlar için. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_slovenia_student',
            country: 'Slovenia',
            visaType: 'Student Residence Permit',
            duration: '1 year renewable',
            cost: 95,
            requirements: [
                'Passport', 'University enrollment', 'Financial proof (€600/month)',
                'Health insurance', 'Academic documents', 'Slovenian/English proficiency',
                'Housing proof', 'Medical certificate'
            ],
            processingTime: '3-6 weeks',
            multiLanguage: {
                tr: { title: 'Slovenya Öğrenci İkamet İzni', description: 'Slovenya\'da eğitim için ikamet izni' },
                en: { title: 'Slovenia Student Residence Permit', description: 'Required for studying in Slovenia' }
            },
            website: 'https://www.gov.si/en/topics/residence-in-slovenia/temporary-residence/',
            description: 'Slovenya öğrenci izni 90+ gün programlar için. Part-time çalışma hakkı.'
        },
        {
            id: 'visa_romania_student',
            country: 'Romania',
            visaType: 'Student Visa (D/SD)',
            duration: '1 year renewable',
            cost: 120,
            requirements: [
                'Passport', 'University admission letter', 'Financial proof (€350/month)',
                'Health insurance', 'Academic transcripts', 'Romanian/English proficiency',
                'Medical certificate', 'Criminal record certificate'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'Romanya Öğrenci Vizesi', description: 'Romanya\'da eğitim için gerekli vize' },
                en: { title: 'Romania Student Visa', description: 'Required for studying in Romania' }
            },
            website: 'https://www.mae.ro/en/node/2035',
            description: 'Romanya öğrenci vizesi 90+ gün programlar için. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_bulgaria_student',
            country: 'Bulgaria',
            visaType: 'Student Visa (Type D)',
            duration: '1 year renewable',
            cost: 100,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (€400/month)',
                'Health insurance', 'Academic qualifications', 'Bulgarian/English proficiency',
                'Medical certificate', 'Criminal record certificate'
            ],
            processingTime: '3-6 weeks',
            multiLanguage: {
                tr: { title: 'Bulgaristan Öğrenci Vizesi', description: 'Bulgaristan\'da eğitim için gerekli vize' },
                en: { title: 'Bulgaria Student Visa', description: 'Required for studying in Bulgaria' }
            },
            website: 'https://www.mfa.bg/en/services/consular-services/visa-regimes-and-visa-requirements/visas-for-the-republic-of-bulgaria',
            description: 'Bulgaristan öğrenci vizesi 90+ gün programlar için. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_russia_student',
            country: 'Russia',
            visaType: 'Student Visa',
            duration: '1 year renewable',
            cost: 50,
            requirements: [
                'Passport', 'University invitation', 'Medical certificate (HIV test)',
                'Health insurance', 'Academic transcripts', 'Russian/English proficiency',
                'Migration card', 'Registration with authorities'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'Rusya Öğrenci Vizesi', description: 'Rusya\'da eğitim için gerekli vize' },
                en: { title: 'Russia Student Visa', description: 'Required for studying in Russia' }
            },
            website: 'https://www.rusemb.org.uk/visas/student',
            description: 'Rusya öğrenci vizesi invitation letter ile alınır. Sınırlı çalışma hakkı.'
        },

        // OCEANIA (3)
        {
            id: 'visa_australia_student',
            country: 'Australia',
            visaType: 'Student Visa (Subclass 500)',
            duration: 'Course duration + 2-4 months',
            cost: 620,
            requirements: [
                'Passport', 'eCoE (Confirmation of Enrolment)', 'OSHC health insurance',
                'Financial proof (AUD $21,041+ per year)', 'English proficiency (IELTS/TOEFL)',
                'Health examination', 'Online application', 'Character requirements'
            ],
            processingTime: '4-12 weeks',
            multiLanguage: {
                tr: { title: 'Avustralya Öğrenci Vizesi', description: 'Avustralya\'da eğitim için gerekli vize' },
                en: { title: 'Australia Student Visa', description: 'Required for studying in Australia' }
            },
            website: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500',
            description: 'Avustralya Subclass 500 all education levels kapsar. 40 hours/fortnight çalışma hakkı.'
        },
        {
            id: 'visa_newzealand_student',
            country: 'New Zealand',
            visaType: 'Student Visa',
            duration: 'Course duration + 1 month',
            cost: 330,
            requirements: [
                'Passport', 'Offer of Place', 'Financial proof (NZ$15,000/year)',
                'Health insurance', 'Medical examination', 'Police clearance',
                'English proficiency', 'Genuine student evidence'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'Yeni Zelanda Öğrenci Vizesi', description: 'Yeni Zelanda\'da eğitim için gerekli vize' },
                en: { title: 'New Zealand Student Visa', description: 'Required for studying in New Zealand' }
            },
            website: 'https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/student-visa',
            description: 'Yeni Zelanda öğrenci vizesi 3+ ay programlar için. 20 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_fiji_student',
            country: 'Fiji',
            visaType: 'Student Permit',
            duration: 'Course duration',
            cost: 200,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (FJD $15,000/year)',
                'Health insurance', 'Medical examination', 'Character certificate',
                'Academic qualifications', 'English proficiency'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'Fiji Öğrenci İzni', description: 'Fiji\'de eğitim için gerekli izin' },
                en: { title: 'Fiji Student Permit', description: 'Required for studying in Fiji' }
            },
            website: 'https://www.immigration.gov.fj/students/',
            description: 'Fiji öğrenci izni university programs için. Sınırlı çalışma hakkı.'
        },

        // EAST ASIA (6)
        {
            id: 'visa_japan_student',
            country: 'Japan',
            visaType: 'Student Visa (Ryugaku)',
            duration: '6 months - 4 years',
            cost: 30,
            requirements: [
                'Passport', 'Certificate of Eligibility (CoE)', 'University acceptance',
                'Financial proof (¥2,000,000/year)', 'Academic transcripts', 'Health certificate',
                'Japanese/English proficiency', 'Guarantor information'
            ],
            processingTime: '3-6 weeks',
            multiLanguage: {
                tr: { title: 'Japonya Öğrenci Vizesi', description: 'Japonya\'da eğitim için gerekli vize' },
                en: { title: 'Japan Student Visa', description: 'Required for studying in Japan' }
            },
            website: 'https://www.mofa.go.jp/j_info/visit/visa/long/index.html',
            description: 'Japonya öğrenci vizesi Certificate of Eligibility ile alınır. 28 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_southkorea_student',
            country: 'South Korea',
            visaType: 'Student Visa (D-2)',
            duration: '1-2 years renewable',
            cost: 60,
            requirements: [
                'Passport', 'University admission letter', 'Financial proof ($10,000/year)',
                'Academic transcripts', 'Health certificate', 'Criminal record check',
                'Korean/English proficiency', 'Visa application form'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'Güney Kore Öğrenci Vizesi', description: 'Güney Kore\'de eğitim için gerekli vize' },
                en: { title: 'South Korea Student Visa', description: 'Required for studying in South Korea' }
            },
            website: 'https://overseas.mofa.go.kr/tr-en/brd/m_7513/view.do?seq=742741',
            description: 'Güney Kore D-2 vizesi degree programs için. 20 hours/week çalışma hakkı.'
        },
        {
            id: 'visa_china_student',
            country: 'China',
            visaType: 'Student Visa (X1/X2)',
            duration: '30 days - 1 year',
            cost: 140,
            requirements: [
                'Passport', 'JW201/JW202 form', 'University admission letter',
                'Physical examination form', 'Financial proof', 'Academic transcripts',
                'Chinese/English proficiency', 'Residence registration'
            ],
            processingTime: '1-2 weeks',
            multiLanguage: {
                tr: { title: 'Çin Öğrenci Vizesi', description: 'Çin\'de eğitim için gerekli vize' },
                en: { title: 'China Student Visa', description: 'Required for studying in China' }
            },
            website: 'http://www.china-embassy.org/eng/visas/student/',
            description: 'Çin X1/X2 vizesi program süresine göre verilir. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_taiwan_student',
            country: 'Taiwan',
            visaType: 'Student Visa (Visitor)',
            duration: '60-180 days renewable',
            cost: 100,
            requirements: [
                'Passport', 'University admission', 'Financial proof ($2,500/semester)',
                'Health certificate', 'Academic transcripts', 'Chinese/English proficiency',
                'Police clearance', 'Guarantor letter'
            ],
            processingTime: '3-5 weeks',
            multiLanguage: {
                tr: { title: 'Tayvan Öğrenci Vizesi', description: 'Tayvan\'da eğitim için gerekli vize' },
                en: { title: 'Taiwan Student Visa', description: 'Required for studying in Taiwan' }
            },
            website: 'https://www.boca.gov.tw/sp-foof-countrylp-03-1.html',
            description: 'Tayvan öğrenci vizesi renewable visitor visa olarak verilir. Part-time çalışma hakkı.'
        },
        {
            id: 'visa_hongkong_student',
            country: 'Hong Kong',
            visaType: 'Student Visa',
            duration: 'Course duration',
            cost: 190,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (HK$120,000/year)',
                'Academic qualifications', 'English proficiency', 'Sponsor undertaking',
                'Medical examination', 'Criminal record check'
            ],
            processingTime: '4-6 weeks',
            multiLanguage: {
                tr: { title: 'Hong Kong Öğrenci Vizesi', description: 'Hong Kong\'da eğitim için gerekli vize' },
                en: { title: 'Hong Kong Student Visa', description: 'Required for studying in Hong Kong' }
            },
            website: 'https://www.immd.gov.hk/eng/services/visas/study.html',
            description: 'Hong Kong öğrenci vizesi university education için. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_mongolia_student',
            country: 'Mongolia',
            visaType: 'Student Visa',
            duration: '1 year renewable',
            cost: 80,
            requirements: [
                'Passport', 'University invitation', 'Financial proof ($3,000/year)',
                'Health certificate', 'Academic documents', 'Mongolian/English proficiency',
                'Medical insurance', 'Registration with authorities'
            ],
            processingTime: '2-3 weeks',
            multiLanguage: {
                tr: { title: 'Moğolistan Öğrenci Vizesi', description: 'Moğolistan\'da eğitim için gerekli vize' },
                en: { title: 'Mongolia Student Visa', description: 'Required for studying in Mongolia' }
            },
            website: 'https://mongolianembassy.us/visa-information/',
            description: 'Moğolistan öğrenci vizesi invitation letter ile verilir. Sınırlı çalışma hakkı.'
        },

        // SOUTHEAST ASIA (8)
        {
            id: 'visa_singapore_student',
            country: 'Singapore',
            visaType: 'Student Pass',
            duration: 'Course duration',
            cost: 60,
            requirements: [
                'Passport', 'IPA (In-Principle Approval)', 'University acceptance',
                'Financial proof (S$15,000/year)', 'Medical examination', 'Academic documents',
                'English proficiency', 'Online application (SOLAR)'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'Singapur Öğrenci Geçiş Belgesi', description: 'Singapur\'da eğitim için gerekli belge' },
                en: { title: 'Singapore Student Pass', description: 'Required for studying in Singapore' }
            },
            website: 'https://www.ica.gov.sg/enter-depart/entry_requirements/student-pass',
            description: 'Singapur Student Pass full-time programs için gerekli. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_malaysia_student',
            country: 'Malaysia',
            visaType: 'Student Pass',
            duration: 'Course duration',
            cost: 55,
            requirements: [
                'Passport', 'University offer letter', 'Financial proof (RM 5,000/month)',
                'Medical examination', 'Academic transcripts', 'English proficiency',
                'EMGS approval', 'Insurance coverage'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'Malezya Öğrenci Geçiş Belgesi', description: 'Malezya\'da eğitim için gerekli belge' },
                en: { title: 'Malaysia Student Pass', description: 'Required for studying in Malaysia' }
            },
            website: 'https://educationmalaysia.gov.my/students/student-visa/',
            description: 'Malezya Student Pass EMGS approval ile alınır. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_thailand_student',
            country: 'Thailand',
            visaType: 'Education Visa (ED)',
            duration: '90 days renewable',
            cost: 80,
            requirements: [
                'Passport', 'Educational institution acceptance', 'Financial proof (THB 20,000)',
                'Medical certificate', 'Academic qualifications', 'Thai/English proficiency',
                'Police clearance', 'Health insurance'
            ],
            processingTime: '3-5 weeks',
            multiLanguage: {
                tr: { title: 'Tayland Eğitim Vizesi', description: 'Tayland\'da eğitim için gerekli vize' },
                en: { title: 'Thailand Education Visa', description: 'Required for studying in Thailand' }
            },
            website: 'https://www.thaiembassy.org/visa-information/education-visa',
            description: 'Tayland ED vizesi 90 gün renewable. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_philippines_student',
            country: 'Philippines',
            visaType: 'Student Visa (9F)',
            duration: '1 year renewable',
            cost: 65,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof ($2,000/semester)',
                'Medical examination', 'Academic credentials', 'English proficiency',
                'NBI clearance', 'SSP (Special Study Permit)'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'Filipinler Öğrenci Vizesi', description: 'Filipinler\'de eğitim için gerekli vize' },
                en: { title: 'Philippines Student Visa', description: 'Required for studying in Philippines' }
            },
            website: 'https://dfa.gov.ph/dfa-services/consular-services/visa-information',
            description: 'Filipinler 9F vizesi + SSP permit ile eğitim. Part-time çalışma hakkı.'
        },
        {
            id: 'visa_indonesia_student',
            country: 'Indonesia',
            visaType: 'Student Visa (B211B)',
            duration: '1 year renewable',
            cost: 110,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof ($1,500/semester)',
                'Health certificate', 'Academic documents', 'Indonesian/English proficiency',
                'Sponsor guarantee', 'KITAS permit application'
            ],
            processingTime: '3-6 weeks',
            multiLanguage: {
                tr: { title: 'Endonezya Öğrenci Vizesi', description: 'Endonezya\'da eğitim için gerekli vize' },
                en: { title: 'Indonesia Student Visa', description: 'Required for studying in Indonesia' }
            },
            website: 'https://kemlu.go.id/portal/en/read/116/halaman_list_lainnya/visa-information',
            description: 'Endonezya B211B + KITAS sistemi. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_vietnam_student',
            country: 'Vietnam',
            visaType: 'Student Visa (DH)',
            duration: '1 year renewable',
            cost: 95,
            requirements: [
                'Passport', 'University admission', 'Financial proof ($2,000/year)',
                'Health certificate', 'Academic transcripts', 'Vietnamese/English proficiency',
                'Police clearance', 'Temporary residence card'
            ],
            processingTime: '3-5 weeks',
            multiLanguage: {
                tr: { title: 'Vietnam Öğrenci Vizesi', description: 'Vietnam\'da eğitim için gerekli vize' },
                en: { title: 'Vietnam Student Visa', description: 'Required for studying in Vietnam' }
            },
            website: 'https://vietnam-visa.com/student-visa/',
            description: 'Vietnam DH vizesi + temporary residence card. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_cambodia_student',
            country: 'Cambodia',
            visaType: 'Student Visa (E)',
            duration: '1 year renewable',
            cost: 75,
            requirements: [
                'Passport', 'Educational institution approval', 'Financial proof ($1,200/year)',
                'Health certificate', 'Academic qualifications', 'Khmer/English proficiency',
                'Police clearance', 'Work permit (if working)'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'Kamboçya Öğrenci Vizesi', description: 'Kamboçya\'da eğitim için gerekli vize' },
                en: { title: 'Cambodia Student Visa', description: 'Required for studying in Cambodia' }
            },
            website: 'http://www.mfaic.gov.kh/visa/',
            description: 'Kamboçya E vizesi education için. Work permit ile çalışma hakkı.'
        },
        {
            id: 'visa_myanmar_student',
            country: 'Myanmar',
            visaType: 'Student Visa',
            duration: '1 year renewable',
            cost: 70,
            requirements: [
                'Passport', 'University invitation', 'Financial proof ($1,000/year)',
                'Health certificate', 'Academic documents', 'Myanmar/English proficiency',
                'Sponsor guarantee', 'Ministry approval'
            ],
            processingTime: '4-6 weeks',
            multiLanguage: {
                tr: { title: 'Myanmar Öğrenci Vizesi', description: 'Myanmar\'da eğitim için gerekli vize' },
                en: { title: 'Myanmar Student Visa', description: 'Required for studying in Myanmar' }
            },
            website: 'https://www.myanmarembassy.org/visa-information/',
            description: 'Myanmar öğrenci vizesi invitation + ministry approval ile. Sınırlı çalışma.'
        },

        // SOUTH ASIA (5)
        {
            id: 'visa_india_student',
            country: 'India',
            visaType: 'Student Visa (X)',
            duration: '5 years or course duration',
            cost: 100,
            requirements: [
                'Passport', 'University admission', 'Financial proof ($500/month)',
                'Medical certificate', 'Academic qualifications', 'Hindi/English proficiency',
                'Police clearance', 'FRRO registration'
            ],
            processingTime: '3-6 weeks',
            multiLanguage: {
                tr: { title: 'Hindistan Öğrenci Vizesi', description: 'Hindistan\'da eğitim için gerekli vize' },
                en: { title: 'India Student Visa', description: 'Required for studying in India' }
            },
            website: 'https://indianvisaonline.gov.in/evisa/student.html',
            description: 'Hindistan X vizesi long-term education için. FRRO registration gerekli.'
        },
        {
            id: 'visa_nepal_student',
            country: 'Nepal',
            visaType: 'Student Visa',
            duration: '1 year renewable',
            cost: 40,
            requirements: [
                'Passport', 'Educational institution admission', 'Financial proof ($200/month)',
                'Health certificate', 'Academic documents', 'Nepali/English proficiency',
                'Guarantor letter', 'Department of Immigration approval'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'Nepal Öğrenci Vizesi', description: 'Nepal\'da eğitim için gerekli vize' },
                en: { title: 'Nepal Student Visa', description: 'Required for studying in Nepal' }
            },
            website: 'https://www.immigration.gov.np/page/student-visa',
            description: 'Nepal öğrenci vizesi education institutions için. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_srilanka_student',
            country: 'Sri Lanka',
            visaType: 'Student Visa',
            duration: '1 year renewable',
            cost: 85,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof ($300/month)',
                'Medical certificate', 'Academic qualifications', 'Sinhala/Tamil/English proficiency',
                'Police clearance', 'Sponsor guarantee'
            ],
            processingTime: '3-5 weeks',
            multiLanguage: {
                tr: { title: 'Sri Lanka Öğrenci Vizesi', description: 'Sri Lanka\'da eğitim için gerekli vize' },
                en: { title: 'Sri Lanka Student Visa', description: 'Required for studying in Sri Lanka' }
            },
            website: 'http://www.eta.gov.lk/slvisa/',
            description: 'Sri Lanka öğrenci vizesi university education için. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_bangladesh_student',
            country: 'Bangladesh',
            visaType: 'Student Visa',
            duration: '1 year renewable',
            cost: 50,
            requirements: [
                'Passport', 'Educational institution admission', 'Financial proof ($250/month)',
                'Health certificate', 'Academic credentials', 'Bengali/English proficiency',
                'Police clearance', 'Ministry approval'
            ],
            processingTime: '3-6 weeks',
            multiLanguage: {
                tr: { title: 'Bangladeş Öğrenci Vizesi', description: 'Bangladeş\'te eğitim için gerekli vize' },
                en: { title: 'Bangladesh Student Visa', description: 'Required for studying in Bangladesh' }
            },
            website: 'http://www.bangladeshembassy.org/visa-information/',
            description: 'Bangladeş öğrenci vizesi ministry approval ile. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_pakistan_student',
            country: 'Pakistan',
            visaType: 'Student Visa',
            duration: 'Course duration',
            cost: 60,
            requirements: [
                'Passport', 'University admission', 'Financial proof ($400/month)',
                'Medical certificate', 'Academic qualifications', 'Urdu/English proficiency',
                'Police clearance', 'No Objection Certificate (NOC)'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'Pakistan Öğrenci Vizesi', description: 'Pakistan\'da eğitim için gerekli vize' },
                en: { title: 'Pakistan Student Visa', description: 'Required for studying in Pakistan' }
            },
            website: 'https://www.pakistan.gov.pk/visa-information',
            description: 'Pakistan öğrenci vizesi NOC certificate ile. Sınırlı çalışma hakkı.'
        },

        // MIDDLE EAST (6)
        {
            id: 'visa_egypt_student',
            country: 'Egypt',
            visaType: 'Student Visa',
            duration: '1 year renewable',
            cost: 25,
            requirements: [
                'Passport', 'University acceptance letter', 'Financial proof',
                'Health certificate', 'Academic transcripts', 'Arabic/English proficiency',
                'Security clearance', 'Sponsor guarantee'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'Mısır Öğrenci Vizesi', description: 'Mısır\'da eğitim için gerekli vize' },
                en: { title: 'Egypt Student Visa', description: 'Required for studying in Egypt' }
            },
            website: 'https://www.egypt.travel/en/plan-your-trip/visa-information',
            description: 'Mısır öğrenci vizesi özellikle Al-Azhar ve Cairo University için popüler. Sınırlı çalışma.'
        },
        {
            id: 'visa_uae_student',
            country: 'UAE',
            visaType: 'Student Residence Visa',
            duration: '1 year renewable',
            cost: 300,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (AED 40,000/year)',
                'Health insurance', 'Medical examination', 'Academic transcripts',
                'English proficiency', 'Emirates ID application'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'BAE Öğrenci İkamet Vizesi', description: 'BAE\'de eğitim için ikamet vizesi' },
                en: { title: 'UAE Student Residence Visa', description: 'Required for studying in UAE' }
            },
            website: 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visa/student-residence-visa',
            description: 'BAE öğrenci vizesi Emirates ID ile birlikte verilir. Part-time çalışma hakkı.'
        },
        {
            id: 'visa_qatar_student',
            country: 'Qatar',
            visaType: 'Student Residence Permit',
            duration: '1 year renewable',
            cost: 200,
            requirements: [
                'Passport', 'University sponsorship', 'Financial proof (QAR 50,000/year)',
                'Health insurance', 'Medical examination', 'Academic qualifications',
                'English proficiency', 'Sponsor guarantee'
            ],
            processingTime: '2-3 weeks',
            multiLanguage: {
                tr: { title: 'Katar Öğrenci İkamet İzni', description: 'Katar\'da eğitim için ikamet izni' },
                en: { title: 'Qatar Student Residence Permit', description: 'Required for studying in Qatar' }
            },
            website: 'https://www.gov.qa/en/information-and-services/moving-to-qatar/visa-and-permits/student-visa',
            description: 'Katar öğrenci izni university sponsorship ile. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_jordan_student',
            country: 'Jordan',
            visaType: 'Student Visa',
            duration: '1 year renewable',
            cost: 140,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof ($5,000/year)',
                'Health insurance', 'Academic transcripts', 'Arabic/English proficiency',
                'Medical certificate', 'Security clearance'
            ],
            processingTime: '3-5 weeks',
            multiLanguage: {
                tr: { title: 'Ürdün Öğrenci Vizesi', description: 'Ürdün\'de eğitim için gerekli vize' },
                en: { title: 'Jordan Student Visa', description: 'Required for studying in Jordan' }
            },
            website: 'http://www.moi.gov.jo/ebv4/Services/StudentVisa.aspx',
            description: 'Ürdün öğrenci vizesi university acceptance ile. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_lebanon_student',
            country: 'Lebanon',
            visaType: 'Student Visa',
            duration: '1 year renewable',
            cost: 100,
            requirements: [
                'Passport', 'University enrollment', 'Financial proof ($3,000/year)',
                'Health certificate', 'Academic documents', 'Arabic/French/English proficiency',
                'Sponsor guarantee', 'Security clearance'
            ],
            processingTime: '3-6 weeks',
            multiLanguage: {
                tr: { title: 'Lübnan Öğrenci Vizesi', description: 'Lübnan\'da eğitim için gerekli vize' },
                en: { title: 'Lebanon Student Visa', description: 'Required for studying in Lebanon' }
            },
            website: 'https://www.general-security.gov.lb/en/services/visa',
            description: 'Lübnan öğrenci vizesi university enrollment ile. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_israel_student',
            country: 'Israel',
            visaType: 'Student Visa (A/2)',
            duration: '1 year renewable',
            cost: 105,
            requirements: [
                'Passport', 'University admission', 'Financial proof ($1,000/month)',
                'Health insurance', 'Academic qualifications', 'Hebrew/English proficiency',
                'Medical examination', 'Security interview'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'İsrail Öğrenci Vizesi', description: 'İsrail\'de eğitim için gerekli vize' },
                en: { title: 'Israel Student Visa', description: 'Required for studying in Israel' }
            },
            website: 'https://mfa.gov.il/MFA/ConsularServices/Pages/Visas.aspx',
            description: 'İsrail A/2 vizesi university education için. Sınırlı çalışma hakkı.'
        },

        // AFRICA (4)
        {
            id: 'visa_southafrica_student',
            country: 'South Africa',
            visaType: 'Study Visa',
            duration: 'Course duration',
            cost: 135,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (R120,000/year)',
                'Medical certificate', 'Academic qualifications', 'English proficiency',
                'Police clearance', 'Medical aid cover'
            ],
            processingTime: '4-8 weeks',
            multiLanguage: {
                tr: { title: 'Güney Afrika Öğrenci Vizesi', description: 'Güney Afrika\'da eğitim için gerekli vize' },
                en: { title: 'South Africa Study Visa', description: 'Required for studying in South Africa' }
            },
            website: 'http://www.dha.gov.za/index.php/immigration-services/exempt-countries-list',
            description: 'Güney Afrika study visa university education için. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_morocco_student',
            country: 'Morocco',
            visaType: 'Student Visa',
            duration: '1 year renewable',
            cost: 80,
            requirements: [
                'Passport', 'University admission', 'Financial proof ($2,000/year)',
                'Health certificate', 'Academic transcripts', 'Arabic/French proficiency',
                'Police clearance', 'Accommodation proof'
            ],
            processingTime: '3-6 weeks',
            multiLanguage: {
                tr: { title: 'Fas Öğrenci Vizesi', description: 'Fas\'ta eğitim için gerekli vize' },
                en: { title: 'Morocco Student Visa', description: 'Required for studying in Morocco' }
            },
            website: 'http://www.consulat.ma/en/student-visa',
            description: 'Fas öğrenci vizesi university acceptance ile. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_tunisia_student',
            country: 'Tunisia',
            visaType: 'Student Visa',
            duration: '1 year renewable',
            cost: 60,
            requirements: [
                'Passport', 'University enrollment', 'Financial proof ($1,500/year)',
                'Health certificate', 'Academic documents', 'Arabic/French proficiency',
                'Medical insurance', 'Accommodation certificate'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'Tunus Öğrenci Vizesi', description: 'Tunus\'ta eğitim için gerekli vize' },
                en: { title: 'Tunisia Student Visa', description: 'Required for studying in Tunisia' }
            },
            website: 'http://www.diplomatie.gov.tn/visa-information/',
            description: 'Tunus öğrenci vizesi university enrollment ile. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_kenya_student',
            country: 'Kenya',
            visaType: 'Student Pass',
            duration: 'Course duration',
            cost: 100,
            requirements: [
                'Passport', 'Educational institution admission', 'Financial proof ($300/month)',
                'Health certificate', 'Academic qualifications', 'English proficiency',
                'Police clearance', 'Yellow fever certificate'
            ],
            processingTime: '2-4 weeks',
            multiLanguage: {
                tr: { title: 'Kenya Öğrenci Geçiş Belgesi', description: 'Kenya\'da eğitim için gerekli belge' },
                en: { title: 'Kenya Student Pass', description: 'Required for studying in Kenya' }
            },
            website: 'https://immigration.go.ke/student-pass/',
            description: 'Kenya student pass university/college education için. Sınırlı çalışma hakkı.'
        },

        // SOUTH AMERICA (5)
        {
            id: 'visa_brazil_student',
            country: 'Brazil',
            visaType: 'Student Visa (VITEM IV)',
            duration: '1 year renewable',
            cost: 160,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof (R$ 2,000/month)',
                'Health certificate', 'Academic transcripts', 'Portuguese/English proficiency',
                'Criminal record certificate', 'Consular interview'
            ],
            processingTime: '3-6 weeks',
            multiLanguage: {
                tr: { title: 'Brezilya Öğrenci Vizesi', description: 'Brezilya\'da eğitim için gerekli vize' },
                en: { title: 'Brazil Student Visa', description: 'Required for studying in Brazil' }
            },
            website: 'https://www.gov.br/mre/en/consular-services/visas-for-foreigners/temporary-visas/student-visa',
            description: 'Brezilya VITEM IV vizesi Portuguese/English programs için. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_argentina_student',
            country: 'Argentina',
            visaType: 'Student Visa (Estudiante)',
            duration: '1 year renewable',
            cost: 150,
            requirements: [
                'Passport', 'University acceptance', 'Financial proof ($800/month)',
                'Health certificate', 'Academic transcripts', 'Spanish proficiency',
                'Criminal record certificate', 'Medical insurance'
            ],
            processingTime: '3-5 weeks',
            multiLanguage: {
                tr: { title: 'Arjantin Öğrenci Vizesi', description: 'Arjantin\'de eğitim için gerekli vize' },
                en: { title: 'Argentina Student Visa', description: 'Required for studying in Argentina' }
            },
            website: 'https://www.argentina.gob.ar/interior/migraciones/estudiante',
            description: 'Arjantin öğrenci vizesi university education için. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_chile_student',
            country: 'Chile',
            visaType: 'Student Visa (Estudiante)',
            duration: '1 year renewable',
            cost: 130,
            requirements: [
                'Passport', 'University admission', 'Financial proof ($600/month)',
                'Health certificate', 'Academic qualifications', 'Spanish proficiency',
                'Police clearance', 'Medical insurance'
            ],
            processingTime: '4-6 weeks',
            multiLanguage: {
                tr: { title: 'Şili Öğrenci Vizesi', description: 'Şili\'de eğitim için gerekli vize' },
                en: { title: 'Chile Student Visa', description: 'Required for studying in Chile' }
            },
            website: 'https://www.extranjeria.gob.cl/estudiantes/',
            description: 'Şili öğrenci vizesi university programs için. Part-time çalışma hakkı.'
        },
        {
            id: 'visa_colombia_student',
            country: 'Colombia',
            visaType: 'Student Visa (TP-3)',
            duration: 'Course duration',
            cost: 90,
            requirements: [
                'Passport', 'Educational institution acceptance', 'Financial proof ($500/month)',
                'Health certificate', 'Academic documents', 'Spanish proficiency',
                'Medical insurance', 'Criminal record certificate'
            ],
            processingTime: '3-5 weeks',
            multiLanguage: {
                tr: { title: 'Kolombiya Öğrenci Vizesi', description: 'Kolombiya\'da eğitim için gerekli vize' },
                en: { title: 'Colombia Student Visa', description: 'Required for studying in Colombia' }
            },
            website: 'https://www.cancilleria.gov.co/tramites_servicios/visas/estudiante',
            description: 'Kolombiya TP-3 vizesi education için. Sınırlı çalışma hakkı.'
        },
        {
            id: 'visa_peru_student',
            country: 'Peru',
            visaType: 'Student Visa',
            duration: '1 year renewable',
            cost: 75,
            requirements: [
                'Passport', 'University enrollment', 'Financial proof ($400/month)',
                'Health certificate', 'Academic transcripts', 'Spanish proficiency',
                'Police clearance', 'Medical insurance'
            ],
            processingTime: '3-6 weeks',
            multiLanguage: {
                tr: { title: 'Peru Öğrenci Vizesi', description: 'Peru\'da eğitim için gerekli vize' },
                en: { title: 'Peru Student Visa', description: 'Required for studying in Peru' }
            },
            website: 'https://www.gob.pe/institucion/rree/informes-publicaciones/345-visas',
            description: 'Peru öğrenci vizesi university education için. Sınırlı çalışma hakkı.'
        }
    ]

    // Insert all visa records
    let successCount = 0
    let errorCount = 0

    console.log(`🔄 Attempting to insert ${visaData.length} visa records...`)

    for (const visa of visaData) {
        try {
            const created = await prisma.visaInfo.create({
                data: visa
            })
            console.log(`✅ Created: ${created.country} - ${created.visaType}`)
            successCount++
        } catch (error) {
            console.error(`❌ Failed to create ${visa.country}:`, error.message)
            errorCount++
        }
    }

    console.log('\n🎉 ULTIMATE Global Student Visa Database completed!')
    console.log(`📊 Success: ${successCount} countries`)
    console.log(`❌ Errors: ${errorCount} countries`)

    // Detailed Statistics
    const countries = await prisma.visaInfo.findMany({
        select: { country: true, cost: true, processingTime: true, visaType: true },
        orderBy: { country: 'asc' }
    })

    console.log(`\n🌍 TOTAL COUNTRIES: ${countries.length}`)

    const validCosts = countries.filter(c => c.cost).map(c => c.cost)
    console.log(`💰 Cost range: $${Math.min(...validCosts)} - $${Math.max(...validCosts)}`)

    // Regional breakdown
    const regions = {
        'North America': ['USA', 'Canada', 'Mexico'],
        'Western Europe': ['Germany', 'UK', 'France', 'Netherlands', 'Italy', 'Spain', 'Switzerland', 'Austria', 'Belgium', 'Portugal', 'Ireland', 'Luxembourg'],
        'Nordic': ['Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland'],
        'Eastern Europe & Russia': ['Poland', 'Czech Republic', 'Hungary', 'Slovakia', 'Slovenia', 'Romania', 'Bulgaria', 'Russia'],
        'Oceania': ['Australia', 'New Zealand', 'Fiji'],
        'East Asia': ['Japan', 'South Korea', 'China', 'Taiwan', 'Hong Kong', 'Mongolia'],
        'Southeast Asia': ['Singapore', 'Malaysia', 'Thailand', 'Philippines', 'Indonesia', 'Vietnam', 'Cambodia', 'Myanmar'],
        'South Asia': ['India', 'Nepal', 'Sri Lanka', 'Bangladesh', 'Pakistan'],
        'Middle East': ['Egypt', 'UAE', 'Qatar', 'Jordan', 'Lebanon', 'Israel'],
        'Africa': ['South Africa', 'Morocco', 'Tunisia', 'Kenya'],
        'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru']
    }

    console.log('\n📊 REGIONAL COVERAGE:')
    for (const [region, regionCountries] of Object.entries(regions)) {
        const count = countries.filter(c => regionCountries.includes(c.country)).length
        console.log(`   ${region}: ${count}/${regionCountries.length} countries`)
    }

    console.log('\n🌍 COMPLETE COUNTRIES LIST:')
    const countryList = countries.map(c => c.country).sort()
    console.log(countryList.join(', '))

    console.log('\n💯 DATABASE READY FOR GLOBAL EDUCATION CONSULTANCY!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })