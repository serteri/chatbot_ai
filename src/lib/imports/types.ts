export interface NormalizedProperty {
    externalId: string;
    title: string;
    description?: string;
    price: number;
    currency: string;
    address?: string;
    city: string;
    country: string;
    propertyType: string; // apartment, house, etc.
    listingType: string; // sale, rent
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    images: string[];
    url?: string;
    rawMetadata: any;
}

export interface ImportStrategy {
    name: string;
    canHandle(source: string): boolean;
    parse(content: string): Promise<NormalizedProperty[]>;
}
