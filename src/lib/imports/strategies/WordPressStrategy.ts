import { ImportStrategy, NormalizedProperty } from '../types';

export class WordPressStrategy implements ImportStrategy {
    name = 'WordPress API Import';

    canHandle(source: string): boolean {
        return source.startsWith('http://') || source.startsWith('https://');
    }

    async parse(url: string): Promise<NormalizedProperty[]> {
        try {
            // Normalize base URL
            const baseUrl = new URL(url).origin;
            const endpoints = [
                '/wp-json/wp/v2/properties',
                '/wp-json/wp/v2/listings',
                '/wp-json/realestate/v1/properties' // Common custom endpoint
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(`${baseUrl}${endpoint}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (Array.isArray(data) && data.length > 0) {
                            return data.map(item => this.mapToProperty(item, baseUrl));
                        }
                    }
                } catch {
                    // Continue to next endpoint
                }
            }

            return [];
        } catch (error) {
            console.error('WordPress strategy failed:', error);
            return [];
        }
    }

    private mapToProperty(json: any, baseUrl: string): NormalizedProperty {
        // Try to find ACF fields or common plugin fields
        const acf = json.acf || {};
        const meta = json.meta || {};

        const price =
            parseFloat(json.price) ||
            parseFloat(acf.price) ||
            parseFloat(meta.price) ||
            0;

        const bedrooms =
            parseInt(json.bedrooms) ||
            parseInt(acf.bedrooms) ||
            parseInt(meta.bedrooms) ||
            0;

        // Image extraction
        const images: string[] = [];
        if (json.featured_media_src_url) {
            images.push(json.featured_media_src_url);
        } else if (json._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
            images.push(json._embedded['wp:featuredmedia'][0].source_url);
        }

        return {
            externalId: String(json.id),
            title: json.title?.rendered || json.title || 'Untitled',
            description: json.content?.rendered?.replace(/<[^>]*>/g, '') || '',
            price,
            currency: 'TRY', // Default, hard to guess from generic WP
            city: acf.city || 'Unknown',
            country: 'Turkey',
            propertyType: 'house', // Placeholder
            listingType: 'sale',
            bedrooms,
            images,
            url: json.link || `${baseUrl}/?p=${json.id}`,
            rawMetadata: json
        };
    }
}
