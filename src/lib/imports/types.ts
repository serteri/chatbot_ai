// Supported countries for property import
export type SupportedCountry = 'AU' | 'TR' | 'UK' | 'DE' | 'FR' | 'ES';

// Import format types
export type ImportFormat =
    | 'REAXML'       // Australia
    | 'OPENIMMO'     // Germany
    | 'BLM'          // UK (Bulk Load Mass)
    | 'RTDF'         // UK (Real-Time Data Feed)
    | 'KYERO'        // Spain
    | 'SAHIBINDEN'   // Turkey
    | 'HEPSIEMLAK'   // Turkey
    | 'EMLAKJET'     // Turkey
    | 'GENERIC_XML'  // Any country
    | 'GENERIC_JSON' // Any country
    | 'WEBSITE_SCRAPE'; // Schema.org / WP-JSON

// Country configuration
export interface CountryConfig {
    code: SupportedCountry;
    name: string;
    currency: string;
    defaultFormats: ImportFormat[];
    propertyTypes: Record<string, string>; // internal key -> localized display
}

export const COUNTRY_CONFIGS: Record<SupportedCountry, CountryConfig> = {
    AU: {
        code: 'AU',
        name: 'Australia',
        currency: 'AUD',
        defaultFormats: ['REAXML', 'WEBSITE_SCRAPE'],
        propertyTypes: {
            apartment: 'Unit/Apartment',
            house: 'House',
            townhouse: 'Townhouse',
            villa: 'Villa',
            land: 'Land',
            rural: 'Rural',
            commercial: 'Commercial'
        }
    },
    TR: {
        code: 'TR',
        name: 'Turkey',
        currency: 'TRY',
        defaultFormats: ['SAHIBINDEN', 'HEPSIEMLAK', 'EMLAKJET', 'GENERIC_XML', 'WEBSITE_SCRAPE'],
        propertyTypes: {
            apartment: 'Daire',
            villa: 'Villa',
            house: 'Müstakil Ev',
            land: 'Arsa',
            commercial: 'Ticari'
        }
    },
    UK: {
        code: 'UK',
        name: 'United Kingdom',
        currency: 'GBP',
        defaultFormats: ['BLM', 'RTDF', 'WEBSITE_SCRAPE'],
        propertyTypes: {
            flat: 'Flat',
            terraced: 'Terraced',
            semiDetached: 'Semi-Detached',
            detached: 'Detached',
            bungalow: 'Bungalow',
            land: 'Land',
            commercial: 'Commercial'
        }
    },
    DE: {
        code: 'DE',
        name: 'Germany',
        currency: 'EUR',
        defaultFormats: ['OPENIMMO', 'WEBSITE_SCRAPE'],
        propertyTypes: {
            wohnung: 'Wohnung',
            haus: 'Haus',
            grundstueck: 'Grundstück',
            gewerbe: 'Gewerbe'
        }
    },
    FR: {
        code: 'FR',
        name: 'France',
        currency: 'EUR',
        defaultFormats: ['GENERIC_XML', 'WEBSITE_SCRAPE'],
        propertyTypes: {
            appartement: 'Appartement',
            maison: 'Maison',
            terrain: 'Terrain',
            commercial: 'Commercial'
        }
    },
    ES: {
        code: 'ES',
        name: 'Spain',
        currency: 'EUR',
        defaultFormats: ['KYERO', 'GENERIC_XML', 'WEBSITE_SCRAPE'],
        propertyTypes: {
            piso: 'Piso',
            casa: 'Casa',
            villa: 'Villa',
            terreno: 'Terreno',
            comercial: 'Comercial'
        }
    }
};

export interface NormalizedProperty {
    externalId: string;
    title: string;
    description?: string;
    price: number;
    currency: string;
    address?: string;
    city: string;
    district?: string;
    country: string;
    countryCode: SupportedCountry;
    propertyType: string; // apartment, house, etc.
    listingType: string; // sale, rent
    bedrooms?: number;
    bathrooms?: number;
    rooms?: string; // For Turkish format like "3+1"
    area?: number;
    floor?: number;
    totalFloors?: number;
    buildingAge?: number;
    images: string[];
    url?: string;
    features?: string[];
    rawMetadata: any;
}

export interface ImportStrategy {
    name: string;
    format: ImportFormat;
    supportedCountries: SupportedCountry[];
    canHandle(source: string, country?: SupportedCountry): boolean;
    parse(content: string, country?: SupportedCountry): Promise<NormalizedProperty[]>;
}

export interface ImportResult {
    success: boolean;
    strategy: string;
    country: SupportedCountry;
    properties: NormalizedProperty[];
    imported: number;
    updated: number;
    skipped: number;
    errors: string[];
}
