import { ImportStrategy, NormalizedProperty, ImportFormat, SupportedCountry, COUNTRY_CONFIGS } from '../types';

/**
 * Handles CSV and JSON file imports
 * This is the simplest option for agents who just want to upload a spreadsheet
 */
export class CsvJsonStrategy implements ImportStrategy {
    name = 'CSV/JSON Upload';
    format: ImportFormat = 'GENERIC_JSON';
    supportedCountries: SupportedCountry[] = ['AU', 'TR', 'UK', 'DE', 'FR', 'ES'];

    canHandle(source: string, country?: SupportedCountry): boolean {
        // Check if it's JSON (either array or object with properties key)
        if (source.trim().startsWith('[') || source.trim().startsWith('{')) {
            try {
                JSON.parse(source);
                return true;
            } catch {
                return false;
            }
        }

        // Check if it looks like CSV (has commas and newlines)
        if (source.includes(',') && source.includes('\n')) {
            return true;
        }

        return false;
    }

    async parse(content: string, country?: SupportedCountry): Promise<NormalizedProperty[]> {
        const countryCode = country || 'AU';

        // Try JSON first
        try {
            const json = JSON.parse(content);
            const items = Array.isArray(json) ? json : (json.properties || json.listings || json.data || []);
            return items.map((item: any) => this.mapToProperty(item, countryCode));
        } catch {
            // Not JSON, try CSV
        }

        // Parse CSV
        try {
            return this.parseCsv(content, countryCode);
        } catch (error) {
            console.error('CSV/JSON parse error:', error);
            return [];
        }
    }

    private parseCsv(content: string, countryCode: SupportedCountry): NormalizedProperty[] {
        const lines = content.trim().split('\n');
        if (lines.length < 2) return [];

        // Parse header row
        const headers = this.parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
        const properties: NormalizedProperty[] = [];

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCsvLine(lines[i]);
            if (values.length !== headers.length) continue;

            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });

            properties.push(this.mapCsvRow(row, countryCode, i));
        }

        return properties;
    }

    private parseCsvLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());

        return result;
    }

    private mapCsvRow(row: Record<string, string>, countryCode: SupportedCountry, index: number): NormalizedProperty {
        const config = COUNTRY_CONFIGS[countryCode];

        return {
            externalId: row.id || row.external_id || row.externalid || `csv-${index}`,
            title: row.title || row.name || row.headline || 'Untitled Property',
            description: row.description || row.desc || '',
            price: parseFloat(row.price || '0'),
            currency: row.currency || config.currency,
            address: row.address || row.street_address || '',
            city: row.city || row.suburb || row.locality || '',
            district: row.district || row.state || row.region || '',
            country: config.name,
            countryCode,
            propertyType: this.normalizePropertyType(row.property_type || row.type || 'other'),
            listingType: this.normalizeListingType(row.listing_type || row.status || 'sale'),
            bedrooms: parseInt(row.bedrooms || row.beds || '0') || undefined,
            bathrooms: parseInt(row.bathrooms || row.baths || '0') || undefined,
            rooms: row.rooms || undefined,
            area: parseFloat(row.area || row.size || row.sqm || '0') || undefined,
            floor: parseInt(row.floor || '0') || undefined,
            totalFloors: parseInt(row.total_floors || row.floors || '0') || undefined,
            buildingAge: parseInt(row.building_age || row.age || '0') || undefined,
            images: this.parseImages(row.images || row.image_urls || ''),
            features: this.parseFeatures(row.features || row.amenities || ''),
            url: row.url || row.link || undefined,
            rawMetadata: row
        };
    }

    private mapToProperty(item: any, countryCode: SupportedCountry): NormalizedProperty {
        const config = COUNTRY_CONFIGS[countryCode];

        return {
            externalId: item.id || item.externalId || item.external_id || `json-${Date.now()}-${Math.random()}`,
            title: item.title || item.name || item.headline || 'Untitled Property',
            description: item.description || item.desc || '',
            price: parseFloat(item.price || 0),
            currency: item.currency || config.currency,
            address: item.address || item.streetAddress || '',
            city: item.city || item.suburb || item.locality || '',
            district: item.district || item.state || item.region || '',
            country: config.name,
            countryCode,
            propertyType: this.normalizePropertyType(item.propertyType || item.property_type || item.type || 'other'),
            listingType: this.normalizeListingType(item.listingType || item.listing_type || item.status || 'sale'),
            bedrooms: parseInt(item.bedrooms || item.beds || 0) || undefined,
            bathrooms: parseInt(item.bathrooms || item.baths || 0) || undefined,
            rooms: item.rooms || undefined,
            area: parseFloat(item.area || item.size || item.sqm || 0) || undefined,
            floor: parseInt(item.floor || 0) || undefined,
            totalFloors: parseInt(item.totalFloors || item.total_floors || 0) || undefined,
            buildingAge: parseInt(item.buildingAge || item.building_age || 0) || undefined,
            images: this.extractImages(item),
            features: this.extractFeatures(item),
            url: item.url || item.link || undefined,
            rawMetadata: item
        };
    }

    private normalizePropertyType(type: string): string {
        const lower = type.toLowerCase();
        if (lower.includes('apartment') || lower.includes('unit') || lower.includes('flat') || lower.includes('daire')) return 'apartment';
        if (lower.includes('house') || lower.includes('villa') || lower.includes('ev')) return 'house';
        if (lower.includes('townhouse')) return 'townhouse';
        if (lower.includes('land') || lower.includes('arsa')) return 'land';
        if (lower.includes('commercial') || lower.includes('ticari')) return 'commercial';
        return 'other';
    }

    private normalizeListingType(type: string): string {
        const lower = type.toLowerCase();
        if (lower.includes('rent') || lower.includes('lease') || lower.includes('kiralık')) return 'rent';
        return 'sale';
    }

    private parseImages(value: string): string[] {
        if (!value) return [];
        // Handle comma or semicolon separated URLs
        return value.split(/[,;]/).map(url => url.trim()).filter(Boolean);
    }

    private parseFeatures(value: string): string[] {
        if (!value) return [];
        return value.split(/[,;]/).map(f => f.trim()).filter(Boolean);
    }

    private extractImages(item: any): string[] {
        if (item.images && Array.isArray(item.images)) {
            return item.images.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean);
        }
        if (item.image) {
            return [item.image];
        }
        return [];
    }

    private extractFeatures(item: any): string[] {
        if (item.features && Array.isArray(item.features)) {
            return item.features.map((f: any) => typeof f === 'string' ? f : f.name).filter(Boolean);
        }
        if (item.amenities && Array.isArray(item.amenities)) {
            return item.amenities;
        }
        return [];
    }
}
