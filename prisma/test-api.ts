import axios from 'axios'

async function testAPI() {
    console.log('🧪 Testing University API...\n')

    // Test 1: Tüm veriyi çekmeyi dene
    console.log('Test 1: Fetching ALL data')
    try {
        const response = await axios.get('http://universities.hipolabs.com/search', {
            timeout: 10000
        })
        console.log(`✅ ALL data works! Found ${response.data.length} universities\n`)
    } catch (error: any) {
        console.log(`❌ ALL data failed: ${error.message}\n`)
    }

    // Test 2: Farklı ülke formatlarını dene
    const countryTests = [
        'United States',
        'united states',
        'United%20States',
        'united%20states',
        'USA',
        'Turkey',
        'turkey',
        'Türkiye',
        'Germany',
        'Japan',
        'Canada'
    ]

    console.log('Test 2: Testing different country formats')
    for (const country of countryTests) {
        try {
            const response = await axios.get(
                `http://universities.hipolabs.com/search?country=${country}`,
                { timeout: 5000 }
            )

            if (response.data && response.data.length > 0) {
                console.log(`✅ "${country}" → ${response.data.length} universities`)
                // İlk üniversiteyi göster
                if (response.data[0]) {
                    console.log(`   Sample: ${response.data[0].name} (${response.data[0].country})`)
                }
            } else {
                console.log(`⚠️ "${country}" → No data`)
            }
        } catch (error: any) {
            console.log(`❌ "${country}" → Error: ${error.message}`)
        }
    }

    // Test 3: Name parametresi ile dene
    console.log('\nTest 3: Testing with name parameter')
    try {
        const response = await axios.get(
            'http://universities.hipolabs.com/search?name=harvard',
            { timeout: 5000 }
        )
        console.log(`✅ Name search works! Found ${response.data.length} results for "harvard"`)
    } catch (error: any) {
        console.log(`❌ Name search failed: ${error.message}`)
    }

    // Test 4: Alternatif API endpoint'leri
    console.log('\nTest 4: Testing alternative approaches')

    // Küçük harf dene
    try {
        const response = await axios.get(
            'http://universities.hipolabs.com/search?country=united+states',
            { timeout: 5000 }
        )
        console.log(`✅ Lowercase with + works! Found ${response.data.length} universities`)
    } catch (error: any) {
        console.log(`❌ Lowercase with + failed: ${error.message}`)
    }

    // Test 5: Raw URL test
    console.log('\nTest 5: Direct browser-like request')
    const testUrls = [
        'http://universities.hipolabs.com/search?country=United+States',
        'http://universities.hipolabs.com/search?country=united+states',
        'http://universities.hipolabs.com/search?country=United%20States'
    ]

    for (const url of testUrls) {
        try {
            console.log(`Testing: ${url}`)
            const response = await axios.get(url, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json, text/plain, */*'
                }
            })

            if (response.data && response.data.length > 0) {
                console.log(`✅ SUCCESS! ${response.data.length} universities`)
                console.log('First few universities:')
                response.data.slice(0, 3).forEach((uni: any) => {
                    console.log(`  - ${uni.name}`)
                })
                break // Bir tane çalışan bulunca dur
            } else {
                console.log(`⚠️ No data returned`)
            }
        } catch (error: any) {
            console.log(`❌ Failed: ${error.message}`)
        }
    }
}

testAPI()
    .then(() => console.log('\n✅ Test completed'))
    .catch(console.error)