import { XMLParser } from 'fast-xml-parser';
import { ImportStrategy, NormalizedProperty, ImportFormat, SupportedCountry } from '../types';

export class ReaxmlStrategy implements ImportStrategy {
    name = 'REAXML Feed';
    format: ImportFormat = 'REAXML';
    supportedCountries: SupportedCountry[] = ['AU'];

    canHandle(source: string, country?: SupportedCountry): boolean {
        // Must be XML and ideally for Australia
        if (!source.trim().startsWith('<')) return false;

        // Check for REAXML-specific markers
        const isReaxml = source.includes('propertyList') || source.includes('<residential') || source.includes('<rental');

        // If country specified, only handle if Australia
        if (country && country !== 'AU') return false;

        return isReaxml;
    }

    async parse(content: string, country?: SupportedCountry): Promise<NormalizedProperty[]> {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_'
        });

        try {
            const result = parser.parse(content);
            const properties: NormalizedProperty[] = [];

            // REAXML usually has a root <propertyList> containing <residential>, <rental>, etc.
            const list = result.propertyList || result;

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

            // Handle commercial listings
            if (list.commercial) {
                const items = Array.isArray(list.commercial) ? list.commercial : [list.commercial];
                items.forEach((item: any) => properties.push(this.mapCommercial(item)));
            }

            // Handle commercialRental listings
            if (list.commercialRental) {
                const items = Array.isArray(list.commercialRental) ? list.commercialRental : [list.commercialRental];
                items.forEach((item: any) => properties.push(this.mapCommercialRental(item)));
            }

            // Handle land listings
            if (list.land) {
                const items = Array.isArray(list.land) ? list.land : [list.land];
                items.forEach((item: any) => properties.push(this.mapLand(item)));
            }

            // Handle rural listings
            if (list.rural) {
                const items = Array.isArray(list.rural) ? list.rural : [list.rural];
                items.forEach((item: any) => properties.push(this.mapRural(item)));
            }

            return properties;
        } catch (e) {
            console.error('REAXML Parse Error:', e);
            return [];
        }
    }

    private mapResidential(item: any): NormalizedProperty {
        return this.mapProperty(item, 'sale');
    }

    private mapRental(item: any): NormalizedProperty {
        return this.mapProperty(item, 'rent');
    }

    private mapCommercial(item: any): NormalizedProperty {
        return this.mapProperty(item, 'sale', 'commercial');
    }

    private mapCommercialRental(item: any): NormalizedProperty {
        return this.mapProperty(item, 'rent', 'commercial');
    }

    private mapLand(item: any): NormalizedProperty {
        return this.mapProperty(item, 'sale', 'land');
    }

    private mapRural(item: any): NormalizedProperty {
        return this.mapProperty(item, 'sale', 'rural');
    }

    private mapProperty(item: any, listingType: 'sale' | 'rent', forceType?: string): NormalizedProperty {
        const address = item.address || {};
        const features = item.features || {};
        const priceData = listingType === 'rent' ? item.rent : item.price;

        return {
            externalId: item.uniqueID || item['@_modtime'] || `rea-${Date.now()}-${Math.random()}`,
            title: item.headline || 'Property Listing',
            description: item.description || '',
            price: this.extractPrice(priceData),
            currency: 'AUD',
            address: this.buildAddress(address),
            city: address.suburb || address.locality || '',
            district: address.state || '',
            country: 'Australia',
            countryCode: 'AU',
            propertyType: forceType || this.mapCategory(item.category),
            listingType,
            bedrooms: parseInt(features.bedrooms || 0),
            bathrooms: parseInt(features.bathrooms || 0),
            area: this.extractArea(item),
            images: this.extractImages(item.objects || item.images),
            features: this.extractFeatures(features),
            url: item.externalLink || undefined,
            rawMetadata: item
        };
    }

    private buildAddress(address: any): string {
        const parts: string[] = [];
        if (address.subNumber) parts.push(`${address.subNumber}/`);
        if (address.streetNumber) parts.push(address.streetNumber);
        if (address.street) parts.push(address.street);
        return parts.join(' ').trim();
    }

    private extractPrice(priceData: any): number {
        if (!priceData) return 0;
        if (typeof priceData === 'number') return priceData;
        if (typeof priceData === 'string') return parseFloat(priceData.replace(/[^0-9.]/g, '')) || 0;
        return parseFloat(priceData.priceValue || priceData['#text'] || priceData.value || 0);
    }

    private extractArea(item: any): number | undefined {
        const landDetails = item.landDetails || {};
        const buildingDetails = item.buildingDetails || {};

        // Try land area first, then building area
        const landArea = landDetails.area?.value || landDetails.area?.['#text'];
        const buildingArea = buildingDetails.area?.value || buildingDetails.area?.['#text'];

        if (buildingArea) return parseFloat(buildingArea);
        if (landArea) return parseFloat(landArea);
        return undefined;
    }

    private mapCategory(category: string): string {
        const lower = (category || '').toLowerCase();
        if (lower.includes('apartment') || lower.includes('unit') || lower.includes('flat')) return 'apartment';
        if (lower.includes('house') || lower.includes('home')) return 'house';
        if (lower.includes('townhouse')) return 'townhouse';
        if (lower.includes('villa')) return 'villa';
        if (lower.includes('land') || lower.includes('vacant')) return 'land';
        if (lower.includes('rural') || lower.includes('farm') || lower.includes('acreage')) return 'rural';
        if (lower.includes('commercial') || lower.includes('office') || lower.includes('retail')) return 'commercial';
        return 'other';
    }

    private extractImages(objects: any): string[] {
        if (!objects) return [];

        // Handle different REAXML image structures
        let imgs: any[] = [];
        if (objects.img) {
            imgs = Array.isArray(objects.img) ? objects.img : [objects.img];
        } else if (objects.floorplan) {
            imgs = Array.isArray(objects.floorplan) ? objects.floorplan : [objects.floorplan];
        } else if (Array.isArray(objects)) {
            imgs = objects;
        }

        return imgs
            .map((img: any) => img['@_url'] || img.url || img['#text'] || (typeof img === 'string' ? img : null))
            .filter(Boolean);
    }

    private extractFeatures(features: any): string[] {
        const featureList: string[] = [];

        if (features.otherFeatures) {
            const other = Array.isArray(features.otherFeatures) ? features.otherFeatures : [features.otherFeatures];
            featureList.push(...other.map((f: any) => f['#text'] || f).filter(Boolean));
        }

        // Add common features as booleans
        if (features.airConditioning?.toLowerCase() === 'yes') featureList.push('Air Conditioning');
        if (features.pool?.toLowerCase() === 'yes') featureList.push('Pool');
        if (features.garage) featureList.push(`${features.garage} Garage`);
        if (features.carPorts) featureList.push(`${features.carPorts} Carport`);

        return featureList;
    }
}
