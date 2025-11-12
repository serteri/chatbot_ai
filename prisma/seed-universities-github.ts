import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

interface UniversityData {
  name: string
  country: string
  'state-province': string | null
  web_pages: string[]
  domains: string[]
  alpha_two_code?: string
}

// API'de çalışan ülkeler (test edildi)
const workingCountries = [
  'Germany', 'Japan', 'Canada', 'France', 'Italy', 'Spain',
  'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden',
  'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic',
  'Australia', 'New Zealand', 'India', 'China', 'South Korea',
  'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Philippines',
  'Brazil', 'Argentina', 'Mexico', 'Chile', 'Colombia',
  'South Africa', 'Egypt', 'Israel', 'Saudi Arabia', 'UAE'
]

// Problemli ülkeler için manuel veri
const manualDataForProblematicCountries: Record<string, UniversityData[]> = {
  'United States': [
    {
      name: 'Harvard University',
      country: 'United States',
      'state-province': 'MA',
      web_pages: ['https://www.harvard.edu'],
      domains: ['harvard.edu']
    },
    {
      name: 'Massachusetts Institute of Technology',
      country: 'United States',
      'state-province': 'MA',
      web_pages: ['https://www.mit.edu'],
      domains: ['mit.edu']
    },
    {
      name: 'Stanford University',
      country: 'United States',
      'state-province': 'CA',
      web_pages: ['https://www.stanford.edu'],
      domains: ['stanford.edu']
    },
    {
      name: 'Yale University',
      country: 'United States',
      'state-province': 'CT',
      web_pages: ['https://www.yale.edu'],
      domains: ['yale.edu']
    },
    {
      name: 'Princeton University',
      country: 'United States',
      'state-province': 'NJ',
      web_pages: ['https://www.princeton.edu'],
      domains: ['princeton.edu']
    },
    {
      name: 'Columbia University',
      country: 'United States',
      'state-province': 'NY',
      web_pages: ['https://www.columbia.edu'],
      domains: ['columbia.edu']
    },
    {
      name: 'University of Chicago',
      country: 'United States',
      'state-province': 'IL',
      web_pages: ['https://www.uchicago.edu'],
      domains: ['uchicago.edu']
    },
    {
      name: 'University of California, Berkeley',
      country: 'United States',
      'state-province': 'CA',
      web_pages: ['https://www.berkeley.edu'],
      domains: ['berkeley.edu']
    },
    {
      name: 'University of California, Los Angeles',
      country: 'United States',
      'state-province': 'CA',
      web_pages: ['https://www.ucla.edu'],
      domains: ['ucla.edu']
    },
    {
      name: 'University of Michigan',
      country: 'United States',
      'state-province': 'MI',
      web_pages: ['https://www.umich.edu'],
      domains: ['umich.edu']
    }
  ],
  'Turkey': [
    {
      name: 'Boğaziçi University',
      country: 'Turkey',
      'state-province': 'Istanbul',
      web_pages: ['https://www.boun.edu.tr'],
      domains: ['boun.edu.tr']
    },
    {
      name: 'Middle East Technical University',
      country: 'Turkey',
      'state-province': 'Ankara',
      web_pages: ['https://www.metu.edu.tr'],
      domains: ['metu.edu.tr']
    },
    {
      name: 'Istanbul Technical University',
      country: 'Turkey',
      'state-province': 'Istanbul',
      web_pages: ['https://www.itu.edu.tr'],
      domains: ['itu.edu.tr']
    },
    {
      name: 'Koç University',
      country: 'Turkey',
      'state-province': 'Istanbul',
      web_pages: ['https://www.ku.edu.tr'],
      domains: ['ku.edu.tr']
    },
    {
      name: 'Sabancı University',
      country: 'Turkey',
      'state-province': 'Istanbul',
      web_pages: ['https://www.sabanciuniv.edu'],
      domains: ['sabanciuniv.edu']
    },
    {
      name: 'Bilkent University',
      country: 'Turkey',
      'state-province': 'Ankara',
      web_pages: ['https://www.bilkent.edu.tr'],
      domains: ['bilkent.edu.tr']
    },
    {
      name: 'Hacettepe University',
      country: 'Turkey',
      'state-province': 'Ankara',
      web_pages: ['https://www.hacettepe.edu.tr'],
      domains: ['hacettepe.edu.tr']
    },
    {
      name: 'Istanbul University',
      country: 'Turkey',
      'state-province': 'Istanbul',
      web_pages: ['https://www.istanbul.edu.tr'],
      domains: ['istanbul.edu.tr']
    },
    {
      name: 'Ankara University',
      country: 'Turkey',
      'state-province': 'Ankara',
      web_pages: ['https://www.ankara.edu.tr'],
      domains: ['ankara.edu.tr']
    },
    {
      name: 'Ege University',
      country: 'Turkey',
      'state-province': 'Izmir',
      web_pages: ['https://www.ege.edu.tr'],
      domains: ['ege.edu.tr']
    }
  ],
  'United Kingdom': [
    {
      name: 'University of Oxford',
      country: 'United Kingdom',
      'state-province': 'Oxford',
      web_pages: ['https://www.ox.ac.uk'],
      domains: ['ox.ac.uk']
    },
    {
      name: 'University of Cambridge',
      country: 'United Kingdom',
      'state-province': 'Cambridge',
      web_pages: ['https://www.cam.ac.uk'],
      domains: ['cam.ac.uk']
    },
    {
      name: 'Imperial College London',
      country: 'United Kingdom',
      'state-province': 'London',
      web_pages: ['https://www.imperial.ac.uk'],
      domains: ['imperial.ac.uk']
    },
    {
      name: 'London School of Economics',
      country: 'United Kingdom',
      'state-province': 'London',
      web_pages: ['https://www.lse.ac.uk'],
      domains: ['lse.ac.uk']
    },
    {
      name: 'University College London',
      country: 'United Kingdom',
      'state-province': 'London',
      web_pages: ['https://www.ucl.ac.uk'],
      domains: ['ucl.ac.uk']
    },
    {
      name: 'University of Edinburgh',
      country: 'United Kingdom',
      'state-province': 'Edinburgh',
      web_pages: ['https://www.ed.ac.uk'],
      domains: ['ed.ac.uk']
    },
    {
      name: 'King\'s College London',
      country: 'United Kingdom',
      'state-province': 'London',
      web_pages: ['https://www.kcl.ac.uk'],
      domains: ['kcl.ac.uk']
    },
    {
      name: 'University of Manchester',
      country: 'United Kingdom',
      'state-province': 'Manchester',
      web_pages: ['https://www.manchester.ac.uk'],
      domains: ['manchester.ac.uk']
    },
    {
      name: 'University of Bristol',
      country: 'United Kingdom',
      'state-province': 'Bristol',
      web_pages: ['https://www.bristol.ac.uk'],
      domains: ['bristol.ac.uk']
    },
    {
      name: 'University of Warwick',
      country: 'United Kingdom',
      'state-province': 'Coventry',
      web_pages: ['https://www.warwick.ac.uk'],
      domains: ['warwick.ac.uk']
    }
  ]
}

// Ranking fonksiyonu
function estimateRanking(name: string): number | null {
  const nameLower = name.toLowerCase()
  
  const topRankings: Record<string, number> = {
    'harvard': 1,
    'massachusetts institute': 2,
    'mit': 2,
    'stanford': 3,
    'cambridge': 4,
    'oxford': 5,
    'caltech': 6,
    'princeton': 7,
    'yale': 8,
    'columbia': 9,
    'university of chicago': 10,
    'imperial college': 11,
    'ucl': 12,
    'university college london': 12,
    'eth zurich': 13,
    'berkeley': 15,
    'ucla': 18,
    'university of toronto': 20,
    'university of tokyo': 23,
    'peking': 25,
    'tsinghua': 26,
    'national university of singapore': 27,
    'melbourne': 30,
    'sydney': 32,
    'seoul national': 35,
    'boğaziçi': 500,
    'bogazici': 500,
    'middle east technical': 510,
    'odtü': 510,
    'metu': 510,
    'istanbul technical': 520,
    'itü': 520,
    'koç': 450,
    'koc': 450,
    'sabancı': 480,
    'sabanci': 480,
    'bilkent': 490
  }
  
  for (const [key, rank] of Object.entries(topRankings)) {
    if (nameLower.includes(key)) return rank
  }
  
  if (nameLower.includes('national') && nameLower.includes('university')) {
    return 100 + Math.floor(Math.random() * 400)
  }
  
  if (nameLower.includes('technical') || nameLower.includes('technology')) {
    return 200 + Math.floor(Math.random() * 500)
  }
  
  if (nameLower.includes('state university')) {
    return 300 + Math.floor(Math.random() * 600)
  }
  
  return null
}

// Şehir çıkarma
function extractCity(name: string, stateProvince: string | null, country: string): string {
  if (stateProvince && stateProvince.trim() && stateProvince !== 'null') {
    // US state codes
    if (stateProvince.length === 2) {
      const usStates: Record<string, string> = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
        'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
        'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
        'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
        'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
        'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
        'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
        'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
        'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
        'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
        'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'Washington DC'
      }
      return usStates[stateProvince.toUpperCase()] || stateProvince
    }
    return stateProvince
  }
  
  const capitals: Record<string, string> = {
    'United States': 'Washington DC',
    'United Kingdom': 'London',
    'Turkey': 'Ankara',
    'Germany': 'Berlin',
    'France': 'Paris',
    'Japan': 'Tokyo',
    'Canada': 'Ottawa',
    'Australia': 'Canberra',
    'China': 'Beijing',
    'India': 'New Delhi',
    'Brazil': 'Brasília',
    'Russia': 'Moscow'
  }
  
  return capitals[country] || country
}

// Tip belirleme
function detectType(name: string): string {
  const nameLower = name.toLowerCase()
  
  if (nameLower.includes('private') || nameLower.includes('özel') || 
      nameLower.includes('foundation') || nameLower.includes('vakıf') ||
      nameLower.includes('catholic') || nameLower.includes('christian')) {
    return 'Private'
  }
  
  if (nameLower.includes('state university') || nameLower.includes('national') ||
      nameLower.includes('federal') || nameLower.includes('public') ||
      nameLower.includes('devlet')) {
    return 'Public'
  }
  
  return 'Public'
}

async function fetchFromAPI(country: string): Promise<UniversityData[]> {
  try {
    const response = await axios.get<UniversityData[]>(
      `http://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`,
      { timeout: 10000 }
    )
    return response.data || []
  } catch (error) {
    return []
  }
}

async function seedUniversitiesHybrid() {
  console.log('🚀 Starting Hybrid University Seed')
  console.log('📊 Strategy: GitHub for all, API for working countries, Manual for problematic\n')
  
  let allUniversities: UniversityData[] = []
  
  // ADIM 1: GitHub'dan çekmeyi dene
  console.log('📡 Step 1: Trying GitHub...')
  try {
    const response = await axios.get<UniversityData[]>(
      'https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json',
      { timeout: 30000 }
    )
    console.log(`✅ GitHub SUCCESS! Got ${response.data.length} universities\n`)
    allUniversities = response.data
  } catch (error: any) {
    console.log(`⚠️ GitHub failed: ${error.message}`)
    console.log('📡 Step 2: Falling back to API + Manual data...\n')
    
    // ADIM 2: API'den çalışan ülkeleri çek
    for (const country of workingCountries) {
      console.log(`  Fetching ${country}...`)
      const data = await fetchFromAPI(country)
      if (data.length > 0) {
        console.log(`  ✅ ${country}: ${data.length} universities`)
        allUniversities.push(...data)
      }
    }
    
    // ADIM 3: Manuel veriyi ekle
    console.log('\n📝 Adding manual data for problematic countries...')
    for (const [country, unis] of Object.entries(manualDataForProblematicCountries)) {
      console.log(`  Adding ${unis.length} universities for ${country}`)
      allUniversities.push(...unis)
    }
  }
  
  if (allUniversities.length === 0) {
    console.log('❌ No data could be fetched!')
    return
  }
  
  console.log(`\n📊 Total universities to process: ${allUniversities.length}`)
  
  // Ülkelere göre grupla
  const byCountry = new Map<string, UniversityData[]>()
  for (const uni of allUniversities) {
    const country = uni.country
    if (!byCountry.has(country)) {
      byCountry.set(country, [])
    }
    byCountry.get(country)!.push(uni)
  }
  
  console.log(`📍 Countries: ${byCountry.size}\n`)
  
  // Database'e ekle
  let totalSuccess = 0
  let totalErrors = 0
  let totalSkipped = 0
  
  for (const [country, universities] of byCountry) {
    console.log(`\n🌍 Processing ${country} (${universities.length} universities)`)
    
    let countrySuccess = 0
    let countryErrors = 0
    let countrySkipped = 0
    
    for (const uni of universities) {
      try {
        const city = extractCity(uni.name, uni['state-province'], country)
        const type = detectType(uni.name)
        const ranking = estimateRanking(uni.name)
        const website = uni.web_pages?.[0] || null
        
        const existing = await prisma.university.findFirst({
          where: {
            name: uni.name,
            country: country
          }
        })
        
        if (existing) {
          await prisma.university.update({
            where: { id: existing.id },
            data: { city, type, ranking, website }
          })
          countrySkipped++
          totalSkipped++
        } else {
          await prisma.university.create({
            data: {
              name: uni.name,
              country: country,
              city,
              type,
              website,
              ranking
            }
          })
          countrySuccess++
          totalSuccess++
        }
      } catch (error) {
        countryErrors++
        totalErrors++
      }
    }
    
    console.log(`  ✅ New: ${countrySuccess} | 🔄 Updated: ${countrySkipped} | ❌ Errors: ${countryErrors}`)
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('📊 FINAL STATISTICS')
  console.log('='.repeat(70))
  console.log(`✅ New Universities: ${totalSuccess}`)
  console.log(`🔄 Updated Universities: ${totalSkipped}`)
  console.log(`❌ Errors: ${totalErrors}`)
  console.log(`📚 Total in Database: ${totalSuccess + totalSkipped}`)
  console.log('\n🎉 Seed completed!')
}

seedUniversitiesHybrid()
  .catch((e) => {
    console.error('❌ Fatal Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })