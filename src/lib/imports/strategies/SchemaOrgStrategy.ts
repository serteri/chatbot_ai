import * as cheerio from 'cheerio';
import { ImportStrategy, NormalizedProperty, ImportFormat, SupportedCountry, COUNTRY_CONFIGS } from '../types';

export class SchemaOrgStrategy implements ImportStrategy {
    name = 'Schema.org Import';
    format: ImportFormat = 'WEBSITE_SCRAPE';
    supportedCountries: SupportedCountry[] = ['AU', 'TR', 'UK', 'DE', 'FR', 'ES'];

    canHandle(source: string, country?: SupportedCountry): boolean {
        return source.startsWith('http://') || source.startsWith('https://');
    }

    async parse(url: string, country?: SupportedCountry): Promise<NormalizedProperty[]> {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch URL: ${response.statusText}`);
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            const properties: NormalizedProperty[] = [];

            // Find all JSON-LD scripts
            $('script[type="application/ld+json"]').each((_, element) => {
                try {
                    const json = JSON.parse($(element).html() || '{}');
                    const items = Array.isArray(json) ? json : [json];

                    for (const item of items) {
                        if (this.isRealEstateListing(item)) {
                            properties.push(this.mapToProperty(item, url, country));
                        } else if (item['@graph']) {
                            // Handle graph structure common in Yoast/WP
                            for (const node of item['@graph']) {
                                if (this.isRealEstateListing(node)) {
                                    properties.push(this.mapToProperty(node, url, country));
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error parsing JSON-LD:', e);
                }
            });

            return properties;
        } catch (error) {
            console.error('Schema.org strategy failed:', error);
            return [];
        }
    }

    private isRealEstateListing(json: any): boolean {
        const type = json['@type'];
        if (!type) return false;

        const types = Array.isArray(type) ? type : [type];
        return types.some(t =>
            ['RealEstateListing', 'SingleFamilyResidence', 'Apartment', 'House', 'Product', 'Residence', 'Place'].includes(t)
        );
    }

    private mapToProperty(json: any, sourceUrl: string, country?: SupportedCountry): NormalizedProperty {
        // Extract price
        let price = 0;
        let currency = country ? COUNTRY_CONFIGS[country].currency : 'USD';

        // Check offers
        const offers = Array.isArray(json.offers) ? json.offers[0] : json.offers;
        if (offers) {
            price = parseFloat(offers.price || 0);
            currency = offers.priceCurrency || currency;
        }

        // Extract address and determine country
        let address = '';
        let city = '';
        let district = '';
        let detectedCountry = country ? COUNTRY_CONFIGS[country].name : 'Unknown';
        let countryCode: SupportedCountry = country || 'AU';

        if (json.address) {
            const addr = json.address;
            address = [addr.streetAddress, addr.addressLocality, addr.addressRegion]
                .filter(Boolean)
                .join(', ');
            city = addr.addressLocality || '';
            district = addr.addressRegion || '';

            // Try to detect country from address
            if (addr.addressCountry) {
                const countryMapping: Record<string, SupportedCountry> = {
                    'Australia': 'AU', 'AU': 'AU',
                    'Turkey': 'TR', 'TR': 'TR', 'Türkiye': 'TR',
                    'United Kingdom': 'UK', 'UK': 'UK', 'GB': 'UK',
                    'Germany': 'DE', 'DE': 'DE', 'Deutschland': 'DE',
                    'France': 'FR', 'FR': 'FR',
                    'Spain': 'ES', 'ES': 'ES', 'España': 'ES'
                };
                const mappedCode = countryMapping[addr.addressCountry];
                if (mappedCode) {
                    countryCode = mappedCode;
                    detectedCountry = COUNTRY_CONFIGS[mappedCode].name;
                    currency = COUNTRY_CONFIGS[mappedCode].currency;
                } else {
                    detectedCountry = addr.addressCountry;
                }
            }
        }

        // Image
        const images: string[] = [];
        if (json.image) {
            if (Array.isArray(json.image)) {
                images.push(...json.image.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean));
            } else if (typeof json.image === 'string') {
                images.push(json.image);
            } else if (json.image.url) {
                images.push(json.image.url);
            }
        }

        // Extract features
        const features: string[] = [];
        if (json.amenityFeature) {
            const amenities = Array.isArray(json.amenityFeature) ? json.amenityFeature : [json.amenityFeature];
            features.push(...amenities.map((a: any) => a.name || a).filter(Boolean));
        }

        return {
            externalId: json['@id'] || json.url || sourceUrl,
            title: json.name || json.headline || 'Unknown Property',
            description: json.description,
            price,
            currency,
            address,
            city,
            district,
            country: detectedCountry,
            countryCode,
            propertyType: this.mapPropertyType(json['@type']),
            listingType: this.detectListingType(json),
            bedrooms: parseInt(json.numberOfBedrooms || json.numberOfRooms || 0),
            bathrooms: parseInt(json.numberOfBathroomsTotal || 0),
            area: this.extractArea(json),
            images,
            features,
            url: json.url || sourceUrl,
            rawMetadata: json
        };
    }

    private mapPropertyType(type: string | string[]): string {
        const t = Array.isArray(type) ? type[0] : type;
        switch (t) {
            case 'Apartment': return 'apartment';
            case 'SingleFamilyResidence':
            case 'House': return 'house';
            case 'Townhouse': return 'townhouse';
            default: return 'other';
        }
    }

    private detectListingType(json: any): string {
        // Check offer type or any rent-related keywords
        const offers = Array.isArray(json.offers) ? json.offers[0] : json.offers;
        if (offers) {
            const offerType = offers['@type'] || '';
            if (offerType.toLowerCase().includes('rent')) return 'rent';
        }

        // Check description for rent keywords
        const desc = (json.description || '').toLowerCase();
        if (desc.includes('for rent') || desc.includes('to let') || desc.includes('kiralık')) {
            return 'rent';
        }

        return 'sale';
    }

    private extractArea(json: any): number | undefined {
        if (json.floorSize) {
            const size = json.floorSize.value || json.floorSize;
            if (typeof size === 'number') return size;
            if (typeof size === 'string') return parseFloat(size.replace(/[^0-9.]/g, '')) || undefined;
        }
        return undefined;
    }
}
