import { XMLParser } from 'fast-xml-parser';
import { ImportStrategy, NormalizedProperty } from '../types';

export class ReaxmlStrategy implements ImportStrategy {
    name = 'REAXML Feed';

    canHandle(source: string): boolean {
        return source.trim().startsWith('<');
    }

    async parse(content: string): Promise<NormalizedProperty[]> {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_'
        });

        try {
            const result = parser.parse(content);
            const properties: NormalizedProperty[] = [];

            // REAXML usually has a root <propertyList> containing <residential>, <rental>, etc.
            const list = result.propertyList || {};

            // Handle residential listings
            if (list.residential) {
                const items = Array.isArray(list.residential) ? list.residential : [list.residential];
                items.forEach((item: any) => properties.push(this.mapResidential(item)));
            }

            // Handle rental listings
            if (list.rental) {
                const items = Array.isArray(list.rental) ? list.rental : [list.rental];
                items.forEach((item: any) => properties.push(this.mapRental(item)));
            }

            return properties;
        } catch (e) {
            console.error('REAXML Parse Error:', e);
            return [];
        }
    }

    private mapResidential(item: any): NormalizedProperty {
        const address = item.address || {};
        const features = item.features || {};

        return {
            externalId: item.uniqueID || `rea-${Math.random()}`,
            title: item.headline || 'No Headline',
            description: item.description || '',
            price: parseFloat(item.price?.priceValue || 0),
            currency: 'AUD',
            address: `${address.subNumber ? address.subNumber + '/' : ''}${address.streetNumber} ${address.street}`,
            city: address.suburb,
            country: 'Australia',
            propertyType: this.mapCategory(item.category),
            listingType: 'sale',
            bedrooms: parseInt(features.bedrooms || 0),
            bathrooms: parseInt(features.bathrooms || 0),
            images: this.extractImages(item.objects),
            rawMetadata: item
        };
    }

    private mapRental(item: any): NormalizedProperty {
        const address = item.address || {};
        const features = item.features || {};

        return {
            externalId: item.uniqueID || `rea-${Math.random()}`,
            title: item.headline || 'No Headline',
            description: item.description || '',
            price: parseFloat(item.rent?.priceValue || 0),
            currency: 'AUD',
            address: `${address.subNumber ? address.subNumber + '/' : ''}${address.streetNumber} ${address.street}`,
            city: address.suburb,
            country: 'Australia',
            propertyType: this.mapCategory(item.category),
            listingType: 'rent',
            bedrooms: parseInt(features.bedrooms || 0),
            bathrooms: parseInt(features.bathrooms || 0),
            images: this.extractImages(item.objects),
            rawMetadata: item
        };
    }

    private mapCategory(category: string): string {
        const lower = (category || '').toLowerCase();
        if (lower.includes('apartment') || lower.includes('unit')) return 'apartment';
        if (lower.includes('house') || lower.includes('villa')) return 'house';
        return 'other';
    }

    private extractImages(objects: any): string[] {
        if (!objects || !objects.img) return [];
        const imgs = Array.isArray(objects.img) ? objects.img : [objects.img];
        return imgs.map((img: any) => img['@_url']).filter(Boolean);
    }
}
