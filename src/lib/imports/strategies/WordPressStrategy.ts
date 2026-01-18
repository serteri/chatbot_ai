import { ImportStrategy, NormalizedProperty, ImportFormat, SupportedCountry, COUNTRY_CONFIGS } from '../types';

export class WordPressStrategy implements ImportStrategy {
    name = 'WordPress API Import';
    format: ImportFormat = 'WEBSITE_SCRAPE';
    supportedCountries: SupportedCountry[] = ['AU', 'TR', 'UK', 'DE', 'FR', 'ES'];

    canHandle(source: string, country?: SupportedCountry): boolean {
        return source.startsWith('http://') || source.startsWith('https://');
    }

    async parse(url: string, country?: SupportedCountry): Promise<NormalizedProperty[]> {
        try {
            // Normalize base URL
            const baseUrl = new URL(url).origin;
            const endpoints = [
                '/wp-json/wp/v2/properties',
                '/wp-json/wp/v2/listings',
                '/wp-json/wp/v2/property',
                '/wp-json/realestate/v1/properties',
                '/wp-json/estatik/v1/properties',
                '/wp-json/developer/v1/properties'
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(`${baseUrl}${endpoint}?per_page=100&_embed`, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (compatible; PropertyBot/1.0)'
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (Array.isArray(data) && data.length > 0) {
                            return data.map(item => this.mapToProperty(item, baseUrl, country));
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

    private mapToProperty(json: any, baseUrl: string, country?: SupportedCountry): NormalizedProperty {
        // Try to find ACF fields or common plugin fields
        const acf = json.acf || {};
        const meta = json.meta || {};
        const customFields = json.custom_fields || {};

        // Determine country and currency
        const countryCode: SupportedCountry = country || this.detectCountry(acf, meta) || 'AU';
        const config = COUNTRY_CONFIGS[countryCode];

        const price =
            parseFloat(json.price) ||
            parseFloat(acf.price) ||
            parseFloat(acf.property_price) ||
            parseFloat(meta.price) ||
            parseFloat(customFields.price) ||
            0;

        const bedrooms =
            parseInt(json.bedrooms) ||
            parseInt(acf.bedrooms) ||
            parseInt(acf.property_bedrooms) ||
            parseInt(meta.bedrooms) ||
            0;

        const bathrooms =
            parseInt(json.bathrooms) ||
            parseInt(acf.bathrooms) ||
            parseInt(acf.property_bathrooms) ||
            parseInt(meta.bathrooms) ||
            0;

        const area =
            parseFloat(json.area) ||
            parseFloat(acf.area) ||
            parseFloat(acf.property_size) ||
            parseFloat(meta.area) ||
            undefined;

        // City extraction
        const city =
            acf.city ||
            acf.suburb ||
            acf.property_city ||
            acf.location?.city ||
            meta.city ||
            customFields.city ||
            'Unknown';

        const district =
            acf.district ||
            acf.state ||
            acf.property_state ||
            acf.location?.state ||
            meta.state ||
            '';

        // Image extraction
        const images: string[] = this.extractImages(json);

        // Property type
        const propertyType = this.extractPropertyType(json, acf, meta);

        // Listing type
        const listingType = this.extractListingType(json, acf, meta);

        return {
            externalId: String(json.id),
            title: json.title?.rendered || json.title || 'Untitled',
            description: this.cleanHtml(json.content?.rendered || json.excerpt?.rendered || ''),
            price,
            currency: acf.currency || meta.currency || config.currency,
            address: acf.address || acf.property_address || meta.address || '',
            city,
            district,
            country: config.name,
            countryCode,
            propertyType,
            listingType,
            bedrooms,
            bathrooms,
            area,
            images,
            features: this.extractFeatures(acf, meta),
            url: json.link || `${baseUrl}/?p=${json.id}`,
            rawMetadata: json
        };
    }

    private detectCountry(acf: any, meta: any): SupportedCountry | undefined {
        const countryField = acf.country || meta.country || '';
        const countryMapping: Record<string, SupportedCountry> = {
            'australia': 'AU', 'au': 'AU',
            'turkey': 'TR', 'türkiye': 'TR', 'tr': 'TR',
            'united kingdom': 'UK', 'uk': 'UK', 'gb': 'UK',
            'germany': 'DE', 'deutschland': 'DE', 'de': 'DE',
            'france': 'FR', 'fr': 'FR',
            'spain': 'ES', 'españa': 'ES', 'es': 'ES'
        };
        return countryMapping[countryField.toLowerCase()];
    }

    private extractImages(json: any): string[] {
        const images: string[] = [];

        // Featured image from _embed
        if (json._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
            images.push(json._embedded['wp:featuredmedia'][0].source_url);
        }

        // Featured media src
        if (json.featured_media_src_url) {
            images.push(json.featured_media_src_url);
        }

        // ACF gallery
        const acf = json.acf || {};
        if (acf.gallery && Array.isArray(acf.gallery)) {
            images.push(...acf.gallery.map((img: any) => img.url || img).filter(Boolean));
        }
        if (acf.property_images && Array.isArray(acf.property_images)) {
            images.push(...acf.property_images.map((img: any) => img.url || img).filter(Boolean));
        }

        return [...new Set(images)]; // Remove duplicates
    }

    private extractPropertyType(json: any, acf: any, meta: any): string {
        const type = (json.property_type || acf.property_type || meta.property_type || '').toLowerCase();
        if (type.includes('apartment') || type.includes('unit') || type.includes('flat') || type.includes('daire')) return 'apartment';
        if (type.includes('house') || type.includes('villa') || type.includes('ev')) return 'house';
        if (type.includes('land') || type.includes('arsa')) return 'land';
        if (type.includes('commercial') || type.includes('ticari')) return 'commercial';
        return 'other';
    }

    private extractListingType(json: any, acf: any, meta: any): string {
        const type = (json.listing_type || acf.listing_type || acf.status || meta.listing_type || '').toLowerCase();
        if (type.includes('rent') || type.includes('lease') || type.includes('kiralık')) return 'rent';
        return 'sale';
    }

    private extractFeatures(acf: any, meta: any): string[] {
        const features: string[] = [];
        const featureFields = acf.features || acf.property_features || meta.features || [];

        if (Array.isArray(featureFields)) {
            features.push(...featureFields.map((f: any) => f.name || f.label || f).filter(Boolean));
        }

        // Common boolean features
        if (acf.has_garage || acf.garage) features.push('Garage');
        if (acf.has_pool || acf.pool) features.push('Pool');
        if (acf.has_garden || acf.garden) features.push('Garden');
        if (acf.air_conditioning) features.push('Air Conditioning');

        return features;
    }

    private cleanHtml(html: string): string {
        return html.replace(/<[^>]*>/g, '').trim();
    }
}
