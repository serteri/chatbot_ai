import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const additionalLanguageSchools = [
  // ============ LATIN AMERICA - Spanish Schools ============
  // Mexico
  {
    id: 'lang_spanish_mexico_001',
    name: 'Spanish Institute of Mexico City',
    country: 'Mexico',
    city: 'Mexico City',
    languages: ['Spanish'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 180,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['DELE', 'SIELE'],
    website: 'https://www.spanishinstitutemexico.com',
    description: 'Premier Spanish language school in the heart of Mexico City with cultural immersion programs.',
    multiLanguage: {
      tr: {
        name: 'Meksika İspanyolca Enstitüsü',
        description: 'Meksika City merkezinde kültürel entegrasyon programları ile İspanyolca eğitimi.'
      }
    }
  },
  {
    id: 'lang_spanish_mexico_002',
    name: 'Cancun Spanish School',
    country: 'Mexico',
    city: 'Cancun',
    languages: ['Spanish'],
    courseDuration: '1-16 weeks',
    pricePerWeek: 200,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['DELE'],
    website: 'https://www.cancunspanish.com',
    description: 'Learn Spanish in paradise with beach activities and cultural excursions.',
    multiLanguage: {
      tr: {
        name: 'Cancun İspanyolca Okulu',
        description: 'Plaj aktiviteleri ve kültürel gezilerle cennette İspanyolca öğrenin.'
      }
    }
  },
  {
    id: 'lang_spanish_mexico_003',
    name: 'Guadalajara Language Center',
    country: 'Mexico',
    city: 'Guadalajara',
    languages: ['Spanish'],
    courseDuration: '1-20 weeks',
    pricePerWeek: 160,
    intensity: 'Intensive (25 hours/week)',
    accommodation: true,
    certifications: ['DELE', 'SIELE'],
    website: 'https://www.guadalajaralanguage.com',
    description: 'Authentic Mexican Spanish learning experience in the cultural capital.',
    multiLanguage: {
      tr: {
        name: 'Guadalajara Dil Merkezi',
        description: 'Kültür başkentinde otantik Meksika İspanyolcası deneyimi.'
      }
    }
  },
  {
    id: 'lang_spanish_mexico_004',
    name: 'Oaxaca Spanish Immersion',
    country: 'Mexico',
    city: 'Oaxaca',
    languages: ['Spanish'],
    courseDuration: '1-12 weeks',
    pricePerWeek: 150,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['DELE'],
    website: 'https://www.oaxacaspanish.com',
    description: 'Traditional Spanish learning with indigenous culture experiences.',
    multiLanguage: {
      tr: {
        name: 'Oaxaca İspanyolca Yoğunlaştırma',
        description: 'Yerli kültür deneyimleri ile geleneksel İspanyolca eğitimi.'
      }
    }
  },
  {
    id: 'lang_spanish_mexico_005',
    name: 'Playa del Carmen Spanish Academy',
    country: 'Mexico',
    city: 'Playa del Carmen',
    languages: ['Spanish'],
    courseDuration: '1-16 weeks',
    pricePerWeek: 190,
    intensity: 'Semi-Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['DELE', 'SIELE'],
    website: 'https://www.playaspanish.com',
    description: 'Caribbean coast Spanish school with diving and water sports activities.',
    multiLanguage: {
      tr: {
        name: 'Playa del Carmen İspanyolca Akademisi',
        description: 'Dalış ve su sporları aktiviteleri ile Karayip kıyısında İspanyolca okulu.'
      }
    }
  },

  // Argentina
  {
    id: 'lang_spanish_argentina_001',
    name: 'Buenos Aires Spanish School',
    country: 'Argentina',
    city: 'Buenos Aires',
    languages: ['Spanish'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 220,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['DELE', 'SIELE', 'CELU'],
    website: 'https://www.baspanish.com',
    description: 'Learn Spanish in the Paris of South America with tango and cultural programs.',
    multiLanguage: {
      tr: {
        name: 'Buenos Aires İspanyolca Okulu',
        description: 'Güney Amerika\'nın Paris\'inde tango ve kültür programları ile İspanyolca öğrenin.'
      }
    }
  },
  {
    id: 'lang_spanish_argentina_002',
    name: 'Cordoba Language Institute',
    country: 'Argentina',
    city: 'Cordoba',
    languages: ['Spanish'],
    courseDuration: '1-20 weeks',
    pricePerWeek: 180,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['DELE', 'CELU'],
    website: 'https://www.cordobalanguage.com',
    description: 'University city atmosphere with affordable Spanish courses.',
    multiLanguage: {
      tr: {
        name: 'Cordoba Dil Enstitüsü',
        description: 'Üniversite şehri atmosferinde uygun fiyatlı İspanyolca kursları.'
      }
    }
  },
  {
    id: 'lang_spanish_argentina_003',
    name: 'Mendoza Wine Country Spanish',
    country: 'Argentina',
    city: 'Mendoza',
    languages: ['Spanish'],
    courseDuration: '1-16 weeks',
    pricePerWeek: 200,
    intensity: 'Semi-Intensive (18 hours/week)',
    accommodation: true,
    certifications: ['DELE'],
    website: 'https://www.mendozaspanish.com',
    description: 'Spanish courses combined with wine tasting and Andes mountain excursions.',
    multiLanguage: {
      tr: {
        name: 'Mendoza Şarap Bölgesi İspanyolca',
        description: 'Şarap tadımı ve And Dağları gezileri ile birleştirilmiş İspanyolca kursları.'
      }
    }
  },
  {
    id: 'lang_spanish_argentina_004',
    name: 'Bariloche Adventure Spanish',
    country: 'Argentina',
    city: 'San Carlos de Bariloche',
    languages: ['Spanish'],
    courseDuration: '1-12 weeks',
    pricePerWeek: 230,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['DELE'],
    website: 'https://www.barilochelanguage.com',
    description: 'Spanish learning with skiing, hiking and Patagonian adventure activities.',
    multiLanguage: {
      tr: {
        name: 'Bariloche Macera İspanyolca',
        description: 'Kayak, yürüyüş ve Patagonya macera aktiviteleri ile İspanyolca öğrenimi.'
      }
    }
  },

  // Colombia
  {
    id: 'lang_spanish_colombia_001',
    name: 'Bogota Spanish Academy',
    country: 'Colombia',
    city: 'Bogota',
    languages: ['Spanish'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 170,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['DELE', 'SIELE'],
    website: 'https://www.bogotaspanish.com',
    description: 'Learn neutral Spanish in Colombia\'s vibrant capital city.',
    multiLanguage: {
      tr: {
        name: 'Bogota İspanyolca Akademisi',
        description: 'Kolombiya\'nın canlı başkentinde nötr İspanyolca öğrenin.'
      }
    }
  },
  {
    id: 'lang_spanish_colombia_002',
    name: 'Medellin Spanish Experience',
    country: 'Colombia',
    city: 'Medellin',
    languages: ['Spanish'],
    courseDuration: '1-20 weeks',
    pricePerWeek: 160,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['DELE'],
    website: 'https://www.medellinspanish.com',
    description: 'Spring climate year-round with innovative teaching methods.',
    multiLanguage: {
      tr: {
        name: 'Medellin İspanyolca Deneyimi',
        description: 'Yıl boyu bahar iklimi ve yenilikçi öğretim yöntemleri.'
      }
    }
  },
  {
    id: 'lang_spanish_colombia_003',
    name: 'Cartagena Beach Spanish',
    country: 'Colombia',
    city: 'Cartagena',
    languages: ['Spanish'],
    courseDuration: '1-16 weeks',
    pricePerWeek: 190,
    intensity: 'Semi-Intensive (18 hours/week)',
    accommodation: true,
    certifications: ['DELE', 'SIELE'],
    website: 'https://www.cartagenaspanish.com',
    description: 'Caribbean colonial city with beach activities and historic tours.',
    multiLanguage: {
      tr: {
        name: 'Cartagena Sahil İspanyolca',
        description: 'Plaj aktiviteleri ve tarihi turlar ile Karayip kolonyal şehri.'
      }
    }
  },
  {
    id: 'lang_spanish_colombia_004',
    name: 'Cali Salsa & Spanish School',
    country: 'Colombia',
    city: 'Cali',
    languages: ['Spanish'],
    courseDuration: '1-12 weeks',
    pricePerWeek: 150,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['DELE'],
    website: 'https://www.calisalsaspanish.com',
    description: 'Combine Spanish learning with salsa dancing in the world salsa capital.',
    multiLanguage: {
      tr: {
        name: 'Cali Salsa ve İspanyolca Okulu',
        description: 'Dünya salsa başkentinde İspanyolca öğrenimini salsa dansı ile birleştirin.'
      }
    }
  },

  // Chile
  {
    id: 'lang_spanish_chile_001',
    name: 'Santiago Spanish Center',
    country: 'Chile',
    city: 'Santiago',
    languages: ['Spanish'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 200,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['DELE', 'SIELE'],
    website: 'https://www.santiagospanish.com',
    description: 'Modern Spanish school in Chile\'s cosmopolitan capital.',
    multiLanguage: {
      tr: {
        name: 'Santiago İspanyolca Merkezi',
        description: 'Şili\'nin kozmopolit başkentinde modern İspanyolca okulu.'
      }
    }
  },
  {
    id: 'lang_spanish_chile_002',
    name: 'Valparaiso Arts & Spanish',
    country: 'Chile',
    city: 'Valparaiso',
    languages: ['Spanish'],
    courseDuration: '1-16 weeks',
    pricePerWeek: 180,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['DELE'],
    website: 'https://www.valparaisospanish.com',
    description: 'Bohemian port city with street art tours and cultural activities.',
    multiLanguage: {
      tr: {
        name: 'Valparaiso Sanat ve İspanyolca',
        description: 'Sokak sanatı turları ve kültürel aktiviteler ile bohem liman şehri.'
      }
    }
  },

  // Peru
  {
    id: 'lang_spanish_peru_001',
    name: 'Lima Spanish Academy',
    country: 'Peru',
    city: 'Lima',
    languages: ['Spanish'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 160,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['DELE', 'SIELE'],
    website: 'https://www.limaspanish.com',
    description: 'Gastronomy capital of the Americas with cultural immersion programs.',
    multiLanguage: {
      tr: {
        name: 'Lima İspanyolca Akademisi',
        description: 'Amerika\'nın gastronomi başkentinde kültürel entegrasyon programları.'
      }
    }
  },
  {
    id: 'lang_spanish_peru_002',
    name: 'Cusco Inca Spanish School',
    country: 'Peru',
    city: 'Cusco',
    languages: ['Spanish', 'Quechua'],
    courseDuration: '1-16 weeks',
    pricePerWeek: 150,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['DELE'],
    website: 'https://www.cuscospanish.com',
    description: 'Learn Spanish near Machu Picchu with Inca cultural experiences.',
    multiLanguage: {
      tr: {
        name: 'Cusco İnka İspanyolca Okulu',
        description: 'İnka kültürel deneyimleri ile Machu Picchu yakınında İspanyolca öğrenin.'
      }
    }
  },

  // Ecuador
  {
    id: 'lang_spanish_ecuador_001',
    name: 'Quito Spanish Institute',
    country: 'Ecuador',
    city: 'Quito',
    languages: ['Spanish'],
    courseDuration: '1-20 weeks',
    pricePerWeek: 140,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['DELE', 'SIELE'],
    website: 'https://www.quitospanish.com',
    description: 'Learn Spanish at the equator with Amazon rainforest excursions.',
    multiLanguage: {
      tr: {
        name: 'Quito İspanyolca Enstitüsü',
        description: 'Amazon yağmur ormanı gezileri ile ekvator\'da İspanyolca öğrenin.'
      }
    }
  },

  // Guatemala
  {
    id: 'lang_spanish_guatemala_001',
    name: 'Antigua Guatemala Spanish School',
    country: 'Guatemala',
    city: 'Antigua Guatemala',
    languages: ['Spanish'],
    courseDuration: '1-16 weeks',
    pricePerWeek: 120,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['DELE'],
    website: 'https://www.antiguaspanish.com',
    description: 'Most affordable Spanish immersion in a UNESCO colonial city.',
    multiLanguage: {
      tr: {
        name: 'Antigua Guatemala İspanyolca Okulu',
        description: 'UNESCO kolonyal şehrinde en uygun fiyatlı İspanyolca yoğunlaştırma.'
      }
    }
  },

  // ============ ASIA ============
  // Japan - Additional
  {
    id: 'lang_japanese_japan_003',
    name: 'Osaka Communication Japanese',
    country: 'Japan',
    city: 'Osaka',
    languages: ['Japanese'],
    courseDuration: '3-24 months',
    pricePerWeek: 250,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['JLPT', 'NAT-TEST'],
    website: 'https://www.osakajapanese.jp',
    description: 'Fun Osaka dialect and business Japanese in Japan\'s kitchen.',
    multiLanguage: {
      tr: {
        name: 'Osaka İletişim Japoncası',
        description: 'Japonya\'nın mutfağında eğlenceli Osaka lehçesi ve iş Japoncası.'
      }
    }
  },
  {
    id: 'lang_japanese_japan_004',
    name: 'Fukuoka International Japanese',
    country: 'Japan',
    city: 'Fukuoka',
    languages: ['Japanese'],
    courseDuration: '3-18 months',
    pricePerWeek: 230,
    intensity: 'Semi-Intensive (18 hours/week)',
    accommodation: true,
    certifications: ['JLPT'],
    website: 'https://www.fukuokajapanese.jp',
    description: 'Gateway to Asia with affordable living and modern facilities.',
    multiLanguage: {
      tr: {
        name: 'Fukuoka Uluslararası Japonca',
        description: 'Uygun yaşam maliyeti ve modern tesisler ile Asya\'ya açılan kapı.'
      }
    }
  },
  {
    id: 'lang_japanese_japan_005',
    name: 'Sapporo Snow Country Japanese',
    country: 'Japan',
    city: 'Sapporo',
    languages: ['Japanese'],
    courseDuration: '3-12 months',
    pricePerWeek: 220,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['JLPT', 'NAT-TEST'],
    website: 'https://www.sapporojapanese.jp',
    description: 'Learn Japanese with skiing and snow festival experiences.',
    multiLanguage: {
      tr: {
        name: 'Sapporo Kar Ülkesi Japoncası',
        description: 'Kayak ve kar festivali deneyimleri ile Japonca öğrenin.'
      }
    }
  },
  {
    id: 'lang_japanese_japan_006',
    name: 'Kyoto Traditional Japanese Academy',
    country: 'Japan',
    city: 'Kyoto',
    languages: ['Japanese'],
    courseDuration: '3-18 months',
    pricePerWeek: 260,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['JLPT', 'J-TEST'],
    website: 'https://www.kyotojapanese.jp',
    description: 'Learn Japanese in the cultural heart of Japan with tea ceremony and calligraphy.',
    multiLanguage: {
      tr: {
        name: 'Kyoto Geleneksel Japonca Akademisi',
        description: 'Çay seremonisi ve kaligrafi ile Japonya\'nın kültürel kalbinde Japonca öğrenin.'
      }
    }
  },
  {
    id: 'lang_japanese_japan_007',
    name: 'Tokyo Shinjuku Japanese Institute',
    country: 'Japan',
    city: 'Tokyo',
    languages: ['Japanese'],
    courseDuration: '3-24 months',
    pricePerWeek: 290,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['JLPT', 'NAT-TEST', 'EJU'],
    website: 'https://www.tokyoshinjuku.jp',
    description: 'Premier Japanese school in Tokyo with university preparation courses.',
    multiLanguage: {
      tr: {
        name: 'Tokyo Shinjuku Japonca Enstitüsü',
        description: 'Üniversite hazırlık kursları ile Tokyo\'da birinci sınıf Japonca okulu.'
      }
    }
  },

  // South Korea - Additional
  {
    id: 'lang_korean_korea_003',
    name: 'Jeju Island Korean Retreat',
    country: 'South Korea',
    city: 'Jeju',
    languages: ['Korean'],
    courseDuration: '1-12 months',
    pricePerWeek: 240,
    intensity: 'Semi-Intensive (18 hours/week)',
    accommodation: true,
    certifications: ['TOPIK'],
    website: 'https://www.jejukorean.kr',
    description: 'Learn Korean on the beautiful volcanic island of Jeju.',
    multiLanguage: {
      tr: {
        name: 'Jeju Adası Korece İnzivası',
        description: 'Güzel volkanik Jeju adasında Korece öğrenin.'
      }
    }
  },
  {
    id: 'lang_korean_korea_004',
    name: 'Seoul Gangnam Korean Center',
    country: 'South Korea',
    city: 'Seoul',
    languages: ['Korean'],
    courseDuration: '3-24 months',
    pricePerWeek: 270,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['TOPIK', 'KLPT'],
    website: 'https://www.gangnamkorean.kr',
    description: 'K-pop and K-drama immersion with intensive Korean courses in trendy Gangnam.',
    multiLanguage: {
      tr: {
        name: 'Seul Gangnam Korece Merkezi',
        description: 'Trendy Gangnam\'da yoğun Korece kursları ile K-pop ve K-drama entegrasyonu.'
      }
    }
  },
  {
    id: 'lang_korean_korea_005',
    name: 'Busan Haeundae Korean Academy',
    country: 'South Korea',
    city: 'Busan',
    languages: ['Korean'],
    courseDuration: '3-18 months',
    pricePerWeek: 230,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['TOPIK'],
    website: 'https://www.busanhaeundae.kr',
    description: 'Beach city Korean learning with seafood and film festival culture.',
    multiLanguage: {
      tr: {
        name: 'Busan Haeundae Korece Akademisi',
        description: 'Deniz ürünleri ve film festivali kültürü ile sahil şehri Korece öğrenimi.'
      }
    }
  },

  // China - Additional
  {
    id: 'lang_chinese_china_003',
    name: 'Chengdu Panda Chinese School',
    country: 'China',
    city: 'Chengdu',
    languages: ['Mandarin Chinese'],
    courseDuration: '1-12 months',
    pricePerWeek: 170,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['HSK'],
    website: 'https://www.chengdumandarin.cn',
    description: 'Relaxed Sichuan lifestyle with panda sanctuary visits.',
    multiLanguage: {
      tr: {
        name: 'Chengdu Panda Çince Okulu',
        description: 'Panda koruma alanı ziyaretleri ile rahat Sichuan yaşam tarzı.'
      }
    }
  },
  {
    id: 'lang_chinese_china_004',
    name: 'Hangzhou West Lake Chinese',
    country: 'China',
    city: 'Hangzhou',
    languages: ['Mandarin Chinese'],
    courseDuration: '1-12 months',
    pricePerWeek: 190,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['HSK', 'HSKK'],
    website: 'https://www.hangzhoumandarin.cn',
    description: 'Beautiful lakeside city known for tea culture and nature.',
    multiLanguage: {
      tr: {
        name: 'Hangzhou Batı Gölü Çincesi',
        description: 'Çay kültürü ve doğa ile tanınan güzel göl kenarı şehri.'
      }
    }
  },
  {
    id: 'lang_chinese_china_005',
    name: 'Xian Ancient Capital Chinese',
    country: 'China',
    city: 'Xian',
    languages: ['Mandarin Chinese'],
    courseDuration: '1-12 months',
    pricePerWeek: 160,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['HSK'],
    website: 'https://www.xianmandarin.cn',
    description: 'Learn Chinese near the Terracotta Army with Silk Road history.',
    multiLanguage: {
      tr: {
        name: 'Xian Antik Başkent Çincesi',
        description: 'İpek Yolu tarihi ile Terracotta Ordusu yakınında Çince öğrenin.'
      }
    }
  },

  // Taiwan
  {
    id: 'lang_chinese_taiwan_001',
    name: 'Taipei Mandarin Training Center',
    country: 'Taiwan',
    city: 'Taipei',
    languages: ['Mandarin Chinese'],
    courseDuration: '3-24 months',
    pricePerWeek: 220,
    intensity: 'Intensive (15 hours/week)',
    accommodation: true,
    certifications: ['TOCFL', 'HSK'],
    website: 'https://www.taipeimandarintc.tw',
    description: 'Traditional Chinese characters with democratic society immersion.',
    multiLanguage: {
      tr: {
        name: 'Taipei Mandarin Eğitim Merkezi',
        description: 'Demokratik toplum entegrasyonu ile geleneksel Çin karakterleri.'
      }
    }
  },
  {
    id: 'lang_chinese_taiwan_002',
    name: 'Kaohsiung Southern Taiwan Chinese',
    country: 'Taiwan',
    city: 'Kaohsiung',
    languages: ['Mandarin Chinese'],
    courseDuration: '3-18 months',
    pricePerWeek: 190,
    intensity: 'Standard (12 hours/week)',
    accommodation: true,
    certifications: ['TOCFL'],
    website: 'https://www.kaohsiungmandarin.tw',
    description: 'Warm harbor city with affordable Chinese courses.',
    multiLanguage: {
      tr: {
        name: 'Kaohsiung Güney Tayvan Çincesi',
        description: 'Uygun fiyatlı Çince kursları ile sıcak liman şehri.'
      }
    }
  },

  // Thailand
  {
    id: 'lang_thai_thailand_001',
    name: 'Bangkok Thai Language School',
    country: 'Thailand',
    city: 'Bangkok',
    languages: ['Thai'],
    courseDuration: '1-12 months',
    pricePerWeek: 150,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['Thai Proficiency Test'],
    website: 'https://www.bangkokthai.th',
    description: 'Learn Thai in the vibrant capital with temple and market experiences.',
    multiLanguage: {
      tr: {
        name: 'Bangkok Tayland Dil Okulu',
        description: 'Tapınak ve pazar deneyimleri ile canlı başkentte Tayca öğrenin.'
      }
    }
  },
  {
    id: 'lang_thai_thailand_002',
    name: 'Chiang Mai Northern Thai Academy',
    country: 'Thailand',
    city: 'Chiang Mai',
    languages: ['Thai'],
    courseDuration: '1-12 months',
    pricePerWeek: 120,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['Thai Proficiency Test'],
    website: 'https://www.chiangmaithai.th',
    description: 'Mountain city retreat with traditional Lanna culture.',
    multiLanguage: {
      tr: {
        name: 'Chiang Mai Kuzey Tayland Akademisi',
        description: 'Geleneksel Lanna kültürü ile dağ şehri inzivası.'
      }
    }
  },
  {
    id: 'lang_thai_thailand_003',
    name: 'Phuket Beach Thai School',
    country: 'Thailand',
    city: 'Phuket',
    languages: ['Thai', 'English'],
    courseDuration: '1-6 months',
    pricePerWeek: 180,
    intensity: 'Semi-Intensive (18 hours/week)',
    accommodation: true,
    certifications: ['Thai Proficiency Test'],
    website: 'https://www.phuketthai.th',
    description: 'Island paradise Thai learning with diving and beach activities.',
    multiLanguage: {
      tr: {
        name: 'Phuket Plaj Tayland Okulu',
        description: 'Dalış ve plaj aktiviteleri ile ada cenneti Tayca öğrenimi.'
      }
    }
  },

  // Vietnam
  {
    id: 'lang_vietnamese_vietnam_001',
    name: 'Hanoi Vietnamese Language Center',
    country: 'Vietnam',
    city: 'Hanoi',
    languages: ['Vietnamese'],
    courseDuration: '1-12 months',
    pricePerWeek: 130,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['IVPT'],
    website: 'https://www.hanoivietnamese.vn',
    description: 'Northern Vietnamese accent in the historic capital.',
    multiLanguage: {
      tr: {
        name: 'Hanoi Vietnamca Dil Merkezi',
        description: 'Tarihi başkentte Kuzey Vietnam aksanı.'
      }
    }
  },
  {
    id: 'lang_vietnamese_vietnam_002',
    name: 'Ho Chi Minh City Vietnamese School',
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    languages: ['Vietnamese'],
    courseDuration: '1-12 months',
    pricePerWeek: 140,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['IVPT'],
    website: 'https://www.hcmvietnamese.vn',
    description: 'Southern Vietnamese dialect in the dynamic business hub.',
    multiLanguage: {
      tr: {
        name: 'Ho Chi Minh Şehri Vietnamca Okulu',
        description: 'Dinamik iş merkezinde Güney Vietnam lehçesi.'
      }
    }
  },
  {
    id: 'lang_vietnamese_vietnam_003',
    name: 'Da Nang Beach Vietnamese',
    country: 'Vietnam',
    city: 'Da Nang',
    languages: ['Vietnamese'],
    courseDuration: '1-6 months',
    pricePerWeek: 120,
    intensity: 'Semi-Intensive (18 hours/week)',
    accommodation: true,
    certifications: ['IVPT'],
    website: 'https://www.danangvietnamese.vn',
    description: 'Central coast Vietnamese with beach lifestyle.',
    multiLanguage: {
      tr: {
        name: 'Da Nang Plaj Vietnamcası',
        description: 'Plaj yaşam tarzı ile orta kıyı Vietnamcası.'
      }
    }
  },

  // Philippines
  {
    id: 'lang_english_philippines_001',
    name: 'Cebu English Academy',
    country: 'Philippines',
    city: 'Cebu',
    languages: ['English'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 180,
    intensity: 'Intensive (25 hours/week)',
    accommodation: true,
    certifications: ['IELTS', 'TOEIC', 'TOEFL'],
    website: 'https://www.cebuelts.ph',
    description: 'Affordable intensive English with one-on-one tutoring.',
    multiLanguage: {
      tr: {
        name: 'Cebu İngilizce Akademisi',
        description: 'Bire bir özel ders ile uygun fiyatlı yoğun İngilizce.'
      }
    }
  },
  {
    id: 'lang_english_philippines_002',
    name: 'Manila Business English Center',
    country: 'Philippines',
    city: 'Manila',
    languages: ['English'],
    courseDuration: '1-16 weeks',
    pricePerWeek: 200,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['IELTS', 'TOEIC', 'Business English'],
    website: 'https://www.manilaenglish.ph',
    description: 'Business English focus with corporate training programs.',
    multiLanguage: {
      tr: {
        name: 'Manila İş İngilizcesi Merkezi',
        description: 'Kurumsal eğitim programları ile iş İngilizcesi odaklı.'
      }
    }
  },
  {
    id: 'lang_english_philippines_003',
    name: 'Baguio Mountain English School',
    country: 'Philippines',
    city: 'Baguio',
    languages: ['English'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 160,
    intensity: 'Sparta (30 hours/week)',
    accommodation: true,
    certifications: ['IELTS', 'TOEFL'],
    website: 'https://www.baguioenglish.ph',
    description: 'Cool mountain climate with intensive Sparta-style programs.',
    multiLanguage: {
      tr: {
        name: 'Baguio Dağ İngilizce Okulu',
        description: 'Yoğun Sparta tarzı programlar ile serin dağ iklimi.'
      }
    }
  },

  // ============ EUROPE ============
  // Portugal
  {
    id: 'lang_portuguese_portugal_001',
    name: 'Lisbon Portuguese Academy',
    country: 'Portugal',
    city: 'Lisbon',
    languages: ['Portuguese'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 220,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['CAPLE', 'CELPE-Bras'],
    website: 'https://www.lisbonportugues.pt',
    description: 'European Portuguese in the sunny capital with fado music culture.',
    multiLanguage: {
      tr: {
        name: 'Lizbon Portekizce Akademisi',
        description: 'Fado müzik kültürü ile güneşli başkentte Avrupa Portekizcesi.'
      }
    }
  },
  {
    id: 'lang_portuguese_portugal_002',
    name: 'Porto Wine Country Portuguese',
    country: 'Portugal',
    city: 'Porto',
    languages: ['Portuguese'],
    courseDuration: '1-16 weeks',
    pricePerWeek: 200,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['CAPLE'],
    website: 'https://www.portoportugues.pt',
    description: 'Historic city with port wine tours and cultural experiences.',
    multiLanguage: {
      tr: {
        name: 'Porto Şarap Bölgesi Portekizcesi',
        description: 'Porto şarabı turları ve kültürel deneyimler ile tarihi şehir.'
      }
    }
  },

  // Netherlands
  {
    id: 'lang_dutch_netherlands_001',
    name: 'Amsterdam Dutch Language School',
    country: 'Netherlands',
    city: 'Amsterdam',
    languages: ['Dutch'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 280,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['NT2', 'CNaVT'],
    website: 'https://www.amsterdamdutch.nl',
    description: 'Learn Dutch in the liberal capital with canal culture.',
    multiLanguage: {
      tr: {
        name: 'Amsterdam Hollandaca Dil Okulu',
        description: 'Kanal kültürü ile liberal başkentte Hollandaca öğrenin.'
      }
    }
  },

  // Sweden
  {
    id: 'lang_swedish_sweden_001',
    name: 'Stockholm Swedish Academy',
    country: 'Sweden',
    city: 'Stockholm',
    languages: ['Swedish'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 300,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['Swedex', 'TISUS'],
    website: 'https://www.stockholmswedish.se',
    description: 'Scandinavian design capital with quality Swedish courses.',
    multiLanguage: {
      tr: {
        name: 'Stockholm İsveççe Akademisi',
        description: 'Kaliteli İsveççe kursları ile İskandinav tasarım başkenti.'
      }
    }
  },

  // Czech Republic
  {
    id: 'lang_czech_czech_001',
    name: 'Prague Czech Language School',
    country: 'Czech Republic',
    city: 'Prague',
    languages: ['Czech'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 200,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['CCE'],
    website: 'https://www.pragueczech.cz',
    description: 'Gothic architecture capital with beer culture immersion.',
    multiLanguage: {
      tr: {
        name: 'Prag Çekçe Dil Okulu',
        description: 'Bira kültürü entegrasyonu ile Gotik mimari başkenti.'
      }
    }
  },

  // Poland
  {
    id: 'lang_polish_poland_001',
    name: 'Warsaw Polish Language Center',
    country: 'Poland',
    city: 'Warsaw',
    languages: ['Polish'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 180,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['ECL'],
    website: 'https://www.warsawpolish.pl',
    description: 'Rapidly developing capital with rich history.',
    multiLanguage: {
      tr: {
        name: 'Varşova Lehçe Dil Merkezi',
        description: 'Zengin tarihi ile hızla gelişen başkent.'
      }
    }
  },
  {
    id: 'lang_polish_poland_002',
    name: 'Krakow Historic Polish Academy',
    country: 'Poland',
    city: 'Krakow',
    languages: ['Polish'],
    courseDuration: '1-16 weeks',
    pricePerWeek: 160,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['ECL'],
    website: 'https://www.krakowpolish.pl',
    description: 'Medieval city with vibrant student atmosphere.',
    multiLanguage: {
      tr: {
        name: 'Krakov Tarihi Lehçe Akademisi',
        description: 'Canlı öğrenci atmosferi ile ortaçağ şehri.'
      }
    }
  },

  // Greece
  {
    id: 'lang_greek_greece_001',
    name: 'Athens Greek Language Institute',
    country: 'Greece',
    city: 'Athens',
    languages: ['Greek'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 200,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['Greek Language Certificate'],
    website: 'https://www.athensgreek.gr',
    description: 'Cradle of democracy with ancient history immersion.',
    multiLanguage: {
      tr: {
        name: 'Atina Yunanca Dil Enstitüsü',
        description: 'Antik tarih entegrasyonu ile demokrasinin beşiği.'
      }
    }
  },

  // Russia
  {
    id: 'lang_russian_russia_001',
    name: 'Moscow Russian Language Academy',
    country: 'Russia',
    city: 'Moscow',
    languages: ['Russian'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 220,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['TORFL'],
    website: 'https://www.moscowrussian.ru',
    description: 'Capital city Russian with Red Square cultural experiences.',
    multiLanguage: {
      tr: {
        name: 'Moskova Rusça Dil Akademisi',
        description: 'Kızıl Meydan kültürel deneyimleri ile başkent Rusçası.'
      }
    }
  },
  {
    id: 'lang_russian_russia_002',
    name: 'Saint Petersburg Cultural Russian',
    country: 'Russia',
    city: 'Saint Petersburg',
    languages: ['Russian'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 200,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['TORFL'],
    website: 'https://www.spbrussian.ru',
    description: 'Venice of the North with Hermitage and ballet culture.',
    multiLanguage: {
      tr: {
        name: 'Saint Petersburg Kültürel Rusça',
        description: 'Hermitage ve bale kültürü ile Kuzey\'in Venedik\'i.'
      }
    }
  },

  // ============ MIDDLE EAST ============
  // UAE
  {
    id: 'lang_arabic_uae_001',
    name: 'Dubai Arabic Language Center',
    country: 'UAE',
    city: 'Dubai',
    languages: ['Arabic', 'English'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 350,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['ACTFL Arabic', 'IELTS'],
    website: 'https://www.dubaiarabic.ae',
    description: 'Modern Arabic and English in the business hub of the Middle East.',
    multiLanguage: {
      tr: {
        name: 'Dubai Arapça Dil Merkezi',
        description: 'Orta Doğu\'nun iş merkezinde modern Arapça ve İngilizce.'
      }
    }
  },

  // Jordan
  {
    id: 'lang_arabic_jordan_001',
    name: 'Amman Arabic Institute',
    country: 'Jordan',
    city: 'Amman',
    languages: ['Arabic'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 200,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['ACTFL Arabic', 'ALPT'],
    website: 'https://www.ammaninstitute.jo',
    description: 'Modern Standard Arabic with Levantine dialect options.',
    multiLanguage: {
      tr: {
        name: 'Amman Arapça Enstitüsü',
        description: 'Levanten lehçe seçenekleri ile Modern Standart Arapça.'
      }
    }
  },

  // Egypt
  {
    id: 'lang_arabic_egypt_001',
    name: 'Cairo Egyptian Arabic School',
    country: 'Egypt',
    city: 'Cairo',
    languages: ['Arabic'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 160,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['ACTFL Arabic'],
    website: 'https://www.cairoarabic.eg',
    description: 'Egyptian dialect and MSA with pyramids excursions.',
    multiLanguage: {
      tr: {
        name: 'Kahire Mısır Arapçası Okulu',
        description: 'Piramit gezileri ile Mısır lehçesi ve MSA.'
      }
    }
  },

  // ============ BRAZIL ============
  {
    id: 'lang_portuguese_brazil_001',
    name: 'Rio de Janeiro Portuguese School',
    country: 'Brazil',
    city: 'Rio de Janeiro',
    languages: ['Portuguese'],
    courseDuration: '1-24 weeks',
    pricePerWeek: 200,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['CELPE-Bras'],
    website: 'https://www.rioportugues.com.br',
    description: 'Brazilian Portuguese with samba and beach culture.',
    multiLanguage: {
      tr: {
        name: 'Rio de Janeiro Portekizce Okulu',
        description: 'Samba ve plaj kültürü ile Brezilya Portekizcesi.'
      }
    }
  },
  {
    id: 'lang_portuguese_brazil_002',
    name: 'Sao Paulo Business Portuguese',
    country: 'Brazil',
    city: 'Sao Paulo',
    languages: ['Portuguese'],
    courseDuration: '1-20 weeks',
    pricePerWeek: 220,
    intensity: 'Intensive (20 hours/week)',
    accommodation: true,
    certifications: ['CELPE-Bras'],
    website: 'https://www.saopauloportugues.com.br',
    description: 'Business Portuguese in South America\'s largest city.',
    multiLanguage: {
      tr: {
        name: 'Sao Paulo İş Portekizcesi',
        description: 'Güney Amerika\'nın en büyük şehrinde iş Portekizcesi.'
      }
    }
  },
  {
    id: 'lang_portuguese_brazil_003',
    name: 'Salvador Bahia Portuguese Experience',
    country: 'Brazil',
    city: 'Salvador',
    languages: ['Portuguese'],
    courseDuration: '1-16 weeks',
    pricePerWeek: 170,
    intensity: 'Standard (15 hours/week)',
    accommodation: true,
    certifications: ['CELPE-Bras'],
    website: 'https://www.salvadorportugues.com.br',
    description: 'Afro-Brazilian culture capital with capoeira and music.',
    multiLanguage: {
      tr: {
        name: 'Salvador Bahia Portekizce Deneyimi',
        description: 'Capoeira ve müzik ile Afro-Brezilya kültür başkenti.'
      }
    }
  }
]

async function main() {
  console.log('Starting to add additional language schools...')

  let created = 0
  let skipped = 0

  for (const school of additionalLanguageSchools) {
    try {
      const existing = await prisma.languageSchool.findUnique({
        where: { id: school.id }
      })

      if (existing) {
        skipped++
        continue
      }

      await prisma.languageSchool.create({
        data: school
      })
      created++
      console.log(`Created: ${school.name} (${school.country})`)
    } catch (error) {
      console.error(`Error creating ${school.name}:`, error)
    }
  }

  // Get final stats
  const totalCount = await prisma.languageSchool.count()
  const countryStats = await prisma.languageSchool.groupBy({
    by: ['country'],
    _count: { country: true },
    orderBy: { _count: { country: 'desc' } }
  })

  console.log(`\n========== SEEDING COMPLETED ==========`)
  console.log(`New schools added: ${created}`)
  console.log(`Skipped (already exists): ${skipped}`)
  console.log(`Total schools in database: ${totalCount}`)
  console.log(`Total countries: ${countryStats.length}`)
  console.log(`\nTop 10 countries:`)
  countryStats.slice(0, 10).forEach(c => {
    console.log(`  ${c.country}: ${c._count.country}`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
