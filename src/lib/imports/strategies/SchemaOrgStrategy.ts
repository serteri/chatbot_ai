import * as cheerio from 'cheerio';
import { ImportStrategy, NormalizedProperty } from '../types';

export class SchemaOrgStrategy implements ImportStrategy {
    name = 'Schema.org Import';

    canHandle(source: string): boolean {
        return source.startsWith('http://') || source.startsWith('https://');
    }

    async parse(url: string): Promise<NormalizedProperty[]> {
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
                            properties.push(this.mapToProperty(item, url));
                        } else if (item['@graph']) {
                            // Handle graph structure common in Yoast/WP
                            for (const node of item['@graph']) {
                                if (this.isRealEstateListing(node)) {
                                    properties.push(this.mapToProperty(node, url));
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
            ['RealEstateListing', 'SingleFamilyResidence', 'Apartment', 'House', 'Product'].includes(t)
        );
    }

    private mapToProperty(json: any, sourceUrl: string): NormalizedProperty {
        // Extract price
        let price = 0;
        let currency = 'TRY';

        // Check offers
        const offers = Array.isArray(json.offers) ? json.offers[0] : json.offers;
        if (offers) {
            price = parseFloat(offers.price || 0);
            currency = offers.priceCurrency || 'TRY';
        }

        // Extract address
        let address = '';
        let city = '';
        let country = 'Turkey';

        if (json.address) {
            const addr = json.address;
            address = [addr.streetAddress, addr.addressLocality, addr.addressRegion]
                .filter(Boolean)
                .join(', ');
            city = addr.addressLocality || '';
            country = addr.addressCountry || 'Turkey';
        }

        // Image
        const images: string[] = [];
        if (json.image) {
            if (Array.isArray(json.image)) {
                images.push(...json.image.map((img: any) => typeof img === 'string' ? img : img.url));
            } else if (typeof json.image === 'string') {
                images.push(json.image);
            } else if (json.image.url) {
                images.push(json.image.url);
            }
        }

        return {
            externalId: json['@id'] || json.url || sourceUrl,
            title: json.name || json.headline || 'Unknown Property',
            description: json.description,
            price,
            currency,
            address,
            city,
            country,
            propertyType: this.mapPropertyType(json['@type']),
            listingType: 'sale', // Default, difficult to determine from Schema alone without explicit Offer type
            bedrooms: parseInt(json.numberOfRooms || 0), // Schema.org often uses numberOfRooms for generic rooms
            images,
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
            default: return 'other';
        }
    }
}
