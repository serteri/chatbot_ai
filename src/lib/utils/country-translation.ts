// COUNTRY TRANSLATION UTILITY
// src/lib/utils/country-translation.ts

export const countryTranslations = {
    // Turkish → English mapping for database search
    'Avustralya': 'Australia',
    'Türkiye': 'Turkey',
    'Amerika': 'United States',
    'Amerika Birleşik Devletleri': 'United States',
    'İngiltere': 'United Kingdom',
    'Almanya': 'Germany',
    'Fransa': 'France',
    'Kanada': 'Canada',
    'İtalya': 'Italy',
    'İspanya': 'Spain',
    'Japonya': 'Japan',
    'Çin': 'China',
    'Rusya': 'Russia',
    'Hollanda': 'Netherlands',
    'Belçika': 'Belgium',
    'İsviçre': 'Switzerland',
    'Avusturya': 'Austria',
    'İsveç': 'Sweden',
    'Norveç': 'Norway',
    'Danimarka': 'Denmark',
    'Finlandiya': 'Finland',
    'Hindistan': 'India',
    'Endonezya': 'Indonesia',
    'Malezya': 'Malaysia',
    'Singapur': 'Singapore',
    'Güney Kore': 'South Korea',
    'Yeni Zelanda': 'New Zealand'
}

export const reverseCountryTranslations = {
    // English → Turkish mapping for display
    'Australia': 'Avustralya',
    'Turkey': 'Türkiye',
    'United States': 'Amerika Birleşik Devletleri',
    'United Kingdom': 'İngiltere',
    'Germany': 'Almanya',
    'France': 'Fransa',
    'Canada': 'Kanada',
    'Italy': 'İtalya',
    'Spain': 'İspanya',
    'Japan': 'Japonya',
    'China': 'Çin',
    'Russia': 'Rusya',
    'Netherlands': 'Hollanda',
    'Belgium': 'Belçika',
    'Switzerland': 'İsviçre',
    'Austria': 'Avusturya',
    'Sweden': 'İsveç',
    'Norway': 'Norveç',
    'Denmark': 'Danimarka',
    'Finland': 'Finlandiya',
    'India': 'Hindistan',
    'Indonesia': 'Endonezya',
    'Malaysia': 'Malezya',
    'Singapore': 'Singapur',
    'South Korea': 'Güney Kore',
    'New Zealand': 'Yeni Zelanda'
}

export function translateCountryForDB(turkishCountry: string): string {
    return countryTranslations[turkishCountry] || turkishCountry
}

export function translateCountryForDisplay(englishCountry: string): string {
    return reverseCountryTranslations[englishCountry] || englishCountry
}