import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🗣️ Seeding Global Language Schools Database...')

    // Clear existing language school data
    await prisma.languageSchool.deleteMany()

    const languageSchools = [
        // USA - ENGLISH SCHOOLS
        {
            id: 'lang_usa_els_001',
            name: 'ELS Language Centers',
            country: 'USA',
            city: 'Multiple locations (50+ cities)',
            languages: ['English'],
            courseDuration: '4-52 weeks',
            pricePerWeek: 390,
            intensity: 'Intensive (30 hours/week)',
            accommodation: true,
            certifications: ['TOEFL', 'IELTS', 'University Pathway', 'ELS Certificate'],
            website: 'https://www.els.edu',
            description: 'One of the largest English language school networks in the US with university pathway programs.',
            multiLanguage: {
                tr: {
                    name: 'ELS Dil Merkezleri',
                    description: 'Amerika\'da üniversite yolunda İngilizce eğitimi veren en büyük dil okulu ağlarından biri.'
                }
            }
        },
        {
            id: 'lang_usa_kaplan_001',
            name: 'Kaplan International English',
            country: 'USA',
            city: 'New York, Boston, Los Angeles, San Francisco',
            languages: ['English'],
            courseDuration: '2-52 weeks',
            pricePerWeek: 450,
            intensity: 'Semi-Intensive (20 hours/week)',
            accommodation: true,
            certifications: ['TOEFL', 'IELTS', 'Cambridge', 'GRE', 'GMAT'],
            website: 'https://www.kaplaninternational.com',
            description: 'Premium English language schools in major US cities with test preparation focus.',
            multiLanguage: {
                tr: {
                    name: 'Kaplan Uluslararası İngilizce',
                    description: 'ABD\'nin büyük şehirlerinde test hazırlığa odaklanan premium İngilizce dil okulu.'
                }
            }
        },
        {
            id: 'lang_usa_ec_001',
            name: 'EC English Language Schools',
            country: 'USA',
            city: 'New York, Boston, Los Angeles, San Diego, Miami',
            languages: ['English'],
            courseDuration: '1-52 weeks',
            pricePerWeek: 420,
            intensity: 'General English (20 hours/week)',
            accommodation: true,
            certifications: ['Cambridge', 'IELTS', 'TOEFL'],
            website: 'https://www.ecenglish.com',
            description: 'Modern English schools with innovative teaching methods and social programs.',
            multiLanguage: {
                tr: {
                    name: 'EC İngilizce Dil Okulları',
                    description: 'Yenilikçi öğretim yöntemleri ve sosyal programlarla modern İngilizce okulları.'
                }
            }
        },

        // UK - ENGLISH SCHOOLS
        {
            id: 'lang_uk_british_001',
            name: 'British Study Centres',
            country: 'UK',
            city: 'London, Oxford, Brighton, Edinburgh',
            languages: ['English'],
            courseDuration: '1-48 weeks',
            pricePerWeek: 380,
            intensity: 'Standard (15 hours/week)',
            accommodation: true,
            certifications: ['IELTS', 'Cambridge', 'Trinity'],
            website: 'https://www.british-study.com',
            description: 'Established English language schools across the UK with academic excellence.',
            multiLanguage: {
                tr: {
                    name: 'British Study Merkezleri',
                    description: 'İngiltere genelinde akademik mükemmellik ile İngilizce dil eğitimi veren kurumlar.'
                }
            }
        },
        {
            id: 'lang_uk_kings_001',
            name: 'Kings Education',
            country: 'UK',
            city: 'London, Oxford, Brighton, Bournemouth',
            languages: ['English'],
            courseDuration: '2-52 weeks',
            pricePerWeek: 450,
            intensity: 'Intensive (28 hours/week)',
            accommodation: true,
            certifications: ['IELTS', 'Cambridge', 'University Foundation'],
            website: 'https://www.kingseducation.com',
            description: 'Premium English language education with university preparation programs.',
            multiLanguage: {
                tr: {
                    name: 'Kings Eğitim',
                    description: 'Üniversite hazırlık programları ile premium İngilizce dil eğitimi.'
                }
            }
        },
        {
            id: 'lang_uk_lsi_001',
            name: 'LSI Language Schools',
            country: 'UK',
            city: 'London, Cambridge, Brighton',
            languages: ['English'],
            courseDuration: '1-48 weeks',
            pricePerWeek: 320,
            intensity: 'General (20 hours/week)',
            accommodation: true,
            certifications: ['Cambridge', 'IELTS'],
            website: 'https://www.lsi.edu',
            description: 'Affordable English language courses with flexible scheduling options.',
            multiLanguage: {
                tr: {
                    name: 'LSI Dil Okulları',
                    description: 'Esnek program seçenekleri ile uygun fiyatlı İngilizce dil kursları.'
                }
            }
        },

        // CANADA - ENGLISH SCHOOLS
        {
            id: 'lang_canada_ilac_001',
            name: 'ILAC International College',
            country: 'Canada',
            city: 'Toronto, Vancouver',
            languages: ['English', 'French'],
            courseDuration: '2-52 weeks',
            pricePerWeek: 350,
            intensity: 'Intensive (30 hours/week)',
            accommodation: true,
            certifications: ['IELTS', 'TOEFL', 'Cambridge', 'University Pathway'],
            website: 'https://www.ilac.com',
            description: 'Leading language school in Canada with bilingual programs and university pathways.',
            multiLanguage: {
                tr: {
                    name: 'ILAC Uluslararası Kolej',
                    description: 'Kanada\'da iki dilli programlar ve üniversite yolu ile önder dil okulu.'
                }
            }
        },
        {
            id: 'lang_canada_canadian_001',
            name: 'Canadian Language Schools',
            country: 'Canada',
            city: 'Toronto, Vancouver, Montreal',
            languages: ['English', 'French'],
            courseDuration: '4-48 weeks',
            pricePerWeek: 320,
            intensity: 'Standard (20 hours/week)',
            accommodation: true,
            certifications: ['IELTS', 'TEF', 'University Preparation'],
            website: 'https://www.canadianlanguageschools.com',
            description: 'Comprehensive English and French language programs across major Canadian cities.',
            multiLanguage: {
                tr: {
                    name: 'Kanada Dil Okulları',
                    description: 'Kanada\'nın büyük şehirlerinde kapsamlı İngilizce ve Fransızca dil programları.'
                }
            }
        },

        // AUSTRALIA - ENGLISH SCHOOLS
        {
            id: 'lang_australia_browns_001',
            name: 'Browns English Language School',
            country: 'Australia',
            city: 'Brisbane, Gold Coast, Melbourne',
            languages: ['English'],
            courseDuration: '1-52 weeks',
            pricePerWeek: 380,
            intensity: 'Intensive (25 hours/week)',
            accommodation: true,
            certifications: ['IELTS', 'Cambridge', 'University Pathway'],
            website: 'https://www.browns.edu.au',
            description: 'Award-winning English language school with innovative teaching methods.',
            multiLanguage: {
                tr: {
                    name: 'Browns İngilizce Dil Okulu',
                    description: 'Yenilikçi öğretim yöntemleri ile ödül sahibi İngilizce dil okulu.'
                }
            }
        },
        {
            id: 'lang_australia_navitas_001',
            name: 'Navitas English',
            country: 'Australia',
            city: 'Sydney, Melbourne, Brisbane, Perth',
            languages: ['English'],
            courseDuration: '1-60 weeks',
            pricePerWeek: 420,
            intensity: 'General (20 hours/week)',
            accommodation: true,
            certifications: ['IELTS', 'Cambridge', 'University Direct Entry'],
            website: 'https://www.navitasenglish.edu.au',
            description: 'Established English language provider with direct university entry programs.',
            multiLanguage: {
                tr: {
                    name: 'Navitas İngilizce',
                    description: 'Direkt üniversite giriş programları ile köklü İngilizce dil eğitimi sağlayıcısı.'
                }
            }
        },

        // IRELAND - ENGLISH SCHOOLS
        {
            id: 'lang_ireland_atlantic_001',
            name: 'Atlantic Language School',
            country: 'Ireland',
            city: 'Dublin, Galway',
            languages: ['English'],
            courseDuration: '1-25 weeks',
            pricePerWeek: 280,
            intensity: 'Standard (15 hours/week)',
            accommodation: true,
            certifications: ['Cambridge', 'IELTS', 'Trinity'],
            website: 'https://www.atlanticlanguage.com',
            description: 'Quality English education in Ireland with cultural immersion programs.',
            multiLanguage: {
                tr: {
                    name: 'Atlantic Dil Okulu',
                    description: 'İrlanda\'da kültürel daldırma programları ile kaliteli İngilizce eğitimi.'
                }
            }
        },

        // MALTA - ENGLISH SCHOOLS
        {
            id: 'lang_malta_ec_001',
            name: 'EC Malta English School',
            country: 'Malta',
            city: 'St. Julians',
            languages: ['English'],
            courseDuration: '1-52 weeks',
            pricePerWeek: 250,
            intensity: 'General (20 hours/week)',
            accommodation: true,
            certifications: ['Cambridge', 'IELTS'],
            website: 'https://www.ecenglish.com/malta',
            description: 'Affordable English education in Mediterranean setting with EU benefits.',
            multiLanguage: {
                tr: {
                    name: 'EC Malta İngilizce Okulu',
                    description: 'AB avantajları ile Akdeniz ortamında uygun fiyatlı İngilizce eğitimi.'
                }
            }
        },

        // GERMANY - GERMAN SCHOOLS
        {
            id: 'lang_germany_goethe_001',
            name: 'Goethe Institute',
            country: 'Germany',
            city: 'Berlin, Munich, Hamburg, Frankfurt',
            languages: ['German'],
            courseDuration: '2-48 weeks',
            pricePerWeek: 380,
            intensity: 'Intensive (20 hours/week)',
            accommodation: true,
            certifications: ['Goethe Zertifikat', 'DSH', 'TestDaF'],
            website: 'https://www.goethe.de',
            description: 'Official German language and cultural institute with worldwide recognition.',
            multiLanguage: {
                tr: {
                    name: 'Goethe Enstitüsü',
                    description: 'Dünya çapında tanınan resmi Almanca dil ve kültür enstitüsü.'
                }
            }
        },
        {
            id: 'lang_germany_did_001',
            name: 'DID Deutsch-Institut',
            country: 'Germany',
            city: 'Berlin, Munich, Hamburg, Frankfurt',
            languages: ['German'],
            courseDuration: '1-52 weeks',
            pricePerWeek: 320,
            intensity: 'Standard (20 hours/week)',
            accommodation: true,
            certifications: ['Goethe', 'TELC', 'DSH'],
            website: 'https://www.did.de',
            description: 'Professional German language schools with comprehensive course offerings.',
            multiLanguage: {
                tr: {
                    name: 'DID Almanca Enstitüsü',
                    description: 'Kapsamlı kurs seçenekleri ile profesyonel Almanca dil okulları.'
                }
            }
        },

        // FRANCE - FRENCH SCHOOLS
        {
            id: 'lang_france_alliance_001',
            name: 'Alliance Française',
            country: 'France',
            city: 'Paris, Lyon, Nice, Toulouse',
            languages: ['French'],
            courseDuration: '1-48 weeks',
            pricePerWeek: 350,
            intensity: 'Intensive (20 hours/week)',
            accommodation: true,
            certifications: ['DELF', 'DALF', 'TCF'],
            website: 'https://www.alliancefr.org',
            description: 'Prestigious French language and culture organization with global presence.',
            multiLanguage: {
                tr: {
                    name: 'Alliance Française',
                    description: 'Küresel varlığa sahip prestijli Fransızca dil ve kültür organizasyonu.'
                }
            }
        },
        {
            id: 'lang_france_accord_001',
            name: 'ACCORD Language School',
            country: 'France',
            city: 'Paris',
            languages: ['French'],
            courseDuration: '1-48 weeks',
            pricePerWeek: 380,
            intensity: 'Intensive (26 hours/week)',
            accommodation: true,
            certifications: ['DELF', 'DALF', 'TCF', 'University Preparation'],
            website: 'https://www.accord-langues.com',
            description: 'Premium French language school in the heart of Paris with cultural activities.',
            multiLanguage: {
                tr: {
                    name: 'ACCORD Dil Okulu',
                    description: 'Paris\'in kalbinde kültürel aktiviteler ile premium Fransızca dil okulu.'
                }
            }
        },

        // SPAIN - SPANISH SCHOOLS
        {
            id: 'lang_spain_cervantes_001',
            name: 'Instituto Cervantes',
            country: 'Spain',
            city: 'Madrid, Barcelona, Valencia, Seville',
            languages: ['Spanish'],
            courseDuration: '2-36 weeks',
            pricePerWeek: 280,
            intensity: 'Intensive (20 hours/week)',
            accommodation: true,
            certifications: ['DELE', 'SIELE', 'CCSE'],
            website: 'https://www.cervantes.es',
            description: 'Official Spanish language institution promoting Spanish culture worldwide.',
            multiLanguage: {
                tr: {
                    name: 'Instituto Cervantes',
                    description: 'Dünya çapında İspanyol kültürünü tanıtan resmi İspanyolca dil kurumu.'
                }
            }
        },
        {
            id: 'lang_spain_enforex_001',
            name: 'Enforex Spanish Schools',
            country: 'Spain',
            city: 'Madrid, Barcelona, Valencia, Malaga, Salamanca',
            languages: ['Spanish'],
            courseDuration: '1-52 weeks',
            pricePerWeek: 220,
            intensity: 'Intensive (20 hours/week)',
            accommodation: true,
            certifications: ['DELE', 'SIELE'],
            website: 'https://www.enforex.com',
            description: 'Largest network of Spanish language schools with immersive cultural programs.',
            multiLanguage: {
                tr: {
                    name: 'Enforex İspanyolca Okulları',
                    description: 'Sürükleyici kültürel programlarla en büyük İspanyolca dil okulu ağı.'
                }
            }
        },

        // ITALY - ITALIAN SCHOOLS
        {
            id: 'lang_italy_dante_001',
            name: 'Società Dante Alighieri',
            country: 'Italy',
            city: 'Rome, Florence, Milan, Venice',
            languages: ['Italian'],
            courseDuration: '1-48 weeks',
            pricePerWeek: 300,
            intensity: 'Standard (20 hours/week)',
            accommodation: true,
            certifications: ['PLIDA', 'CILS', 'University Preparation'],
            website: 'https://ladante.it',
            description: 'Historic Italian language and culture institution with artistic focus.',
            multiLanguage: {
                tr: {
                    name: 'Società Dante Alighieri',
                    description: 'Sanatsal odaklı tarihi İtalyanca dil ve kültür kurumu.'
                }
            }
        },

        // JAPAN - JAPANESE SCHOOLS
        {
            id: 'lang_japan_isi_001',
            name: 'ISI Language School',
            country: 'Japan',
            city: 'Tokyo, Kyoto, Nagano',
            languages: ['Japanese'],
            courseDuration: '3-104 weeks',
            pricePerWeek: 200,
            intensity: 'Intensive (20 hours/week)',
            accommodation: true,
            certifications: ['JLPT', 'EJU', 'University Preparation'],
            website: 'https://www.isi-edu.com',
            description: 'Comprehensive Japanese language education with university pathway programs.',
            multiLanguage: {
                tr: {
                    name: 'ISI Dil Okulu',
                    description: 'Üniversite yolunda kapsamlı Japonca dil eğitimi.'
                }
            }
        },

        // SOUTH KOREA - KOREAN SCHOOLS
        {
            id: 'lang_korea_yonsei_001',
            name: 'Yonsei University Korean Language Institute',
            country: 'South Korea',
            city: 'Seoul',
            languages: ['Korean'],
            courseDuration: '10-40 weeks',
            pricePerWeek: 160,
            intensity: 'Intensive (20 hours/week)',
            accommodation: true,
            certifications: ['TOPIK', 'University Admission'],
            website: 'https://www.yskli.com',
            description: 'Prestigious university-affiliated Korean language program with academic focus.',
            multiLanguage: {
                tr: {
                    name: 'Yonsei Üniversitesi Korece Dil Enstitüsü',
                    description: 'Akademik odaklı prestijli üniversite bağlı Korece dil programı.'
                }
            }
        },

        // CHINA - CHINESE SCHOOLS
        {
            id: 'lang_china_mandarin_001',
            name: 'Mandarin House',
            country: 'China',
            city: 'Beijing, Shanghai, Shenzhen',
            languages: ['Chinese (Mandarin)'],
            courseDuration: '1-52 weeks',
            pricePerWeek: 180,
            intensity: 'Intensive (20 hours/week)',
            accommodation: true,
            certifications: ['HSK', 'Business Chinese'],
            website: 'https://www.mandarinhouse.cn',
            description: 'Leading Mandarin Chinese language school with business-focused programs.',
            multiLanguage: {
                tr: {
                    name: 'Mandarin House',
                    description: 'İş odaklı programlarla önder Mandarin Çince dil okulu.'
                }
            }
        },

        // TURKEY - TURKISH SCHOOLS
        {
            id: 'lang_turkey_tomer_001',
            name: 'TÖMER (Ankara University)',
            country: 'Turkey',
            city: 'Ankara, Istanbul, Izmir',
            languages: ['Turkish'],
            courseDuration: '8-32 weeks',
            pricePerWeek: 120,
            intensity: 'Intensive (20 hours/week)',
            accommodation: true,
            certifications: ['TYS', 'University Preparation', 'YDS'],
            website: 'https://tomer.ankara.edu.tr',
            description: 'Premier Turkish language institute for international students and professionals.',
            multiLanguage: {
                tr: {
                    name: 'TÖMER (Ankara Üniversitesi)',
                    description: 'Uluslararası öğrenci ve profesyoneller için önder Türkçe dil enstitüsü.'
                }
            }
        },

        // NEW ZEALAND - ENGLISH SCHOOLS
        {
            id: 'lang_nz_auckland_001',
            name: 'Auckland English Academy',
            country: 'New Zealand',
            city: 'Auckland, Wellington',
            languages: ['English'],
            courseDuration: '1-52 weeks',
            pricePerWeek: 350,
            intensity: 'General (20 hours/week)',
            accommodation: true,
            certifications: ['IELTS', 'Cambridge', 'University Pathway'],
            website: 'https://www.aucklandenglish.com',
            description: 'Quality English education in New Zealand with stunning natural environment.',
            multiLanguage: {
                tr: {
                    name: 'Auckland İngilizce Akademisi',
                    description: 'Muhteşem doğal ortamda Yeni Zelanda\'da kaliteli İngilizce eğitimi.'
                }
            }
        }
    ]

    // Insert all language school records
    let successCount = 0
    let errorCount = 0

    console.log(`🔄 Attempting to insert ${languageSchools.length} language school records...`)

    for (const school of languageSchools) {
        try {
            const created = await prisma.languageSchool.create({
                data: school
            })
            console.log(`✅ Created: ${created.name} - ${created.country}`)
            successCount++
        } catch (error) {
            console.error(`❌ Failed to create ${school.name}:`, error.message)
            errorCount++
        }
    }

    console.log('\n🎉 Global Language Schools Database completed!')
    console.log(`📊 Success: ${successCount} schools`)
    console.log(`❌ Errors: ${errorCount} schools`)

    // Detailed Statistics
    const schools = await prisma.languageSchool.findMany({
        select: {
            name: true,
            country: true,
            languages: true,
            pricePerWeek: true,
            certifications: true
        },
        orderBy: { country: 'asc' }
    })

    console.log(`\n🌍 TOTAL SCHOOLS: ${schools.length}`)

    const validPrices = schools.filter(s => s.pricePerWeek).map(s => s.pricePerWeek!)
    console.log(`💰 Price range: $${Math.min(...validPrices)}/week - $${Math.max(...validPrices)}/week`)
    console.log(`📈 Average: $${Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length)}/week`)

    // Language breakdown
    const languageStats: Record<string, number> = {}
    schools.forEach(school => {
        school.languages.forEach(lang => {
            languageStats[lang] = (languageStats[lang] || 0) + 1
        })
    })

    console.log('\n🗣️ LANGUAGES OFFERED:')
    Object.entries(languageStats)
        .sort(([,a], [,b]) => b - a)
        .forEach(([language, count]) => {
            console.log(`   ${language}: ${count} schools`)
        })

    // Country breakdown
    const countryStats: Record<string, number> = {}
    schools.forEach(school => {
        countryStats[school.country] = (countryStats[school.country] || 0) + 1
    })

    console.log('\n🌍 COUNTRIES COVERED:')
    Object.entries(countryStats)
        .sort(([,a], [,b]) => b - a)
        .forEach(([country, count]) => {
            console.log(`   ${country}: ${count} schools`)
        })

    // Certification breakdown
    const certStats: Record<string, number> = {}
    schools.forEach(school => {
        school.certifications.forEach(cert => {
            certStats[cert] = (certStats[cert] || 0) + 1
        })
    })

    console.log('\n🏆 TOP CERTIFICATIONS:')
    Object.entries(certStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([cert, count]) => {
            console.log(`   ${cert}: ${count} schools`)
        })

    console.log('\n🎓 DATABASE READY FOR GLOBAL LANGUAGE EDUCATION!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })