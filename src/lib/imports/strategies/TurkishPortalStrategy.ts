import { XMLParser } from 'fast-xml-parser';
import { ImportStrategy, NormalizedProperty, ImportFormat, SupportedCountry } from '../types';

/**
 * Strategy for parsing Turkish real estate portal XML formats
 * Supports: Sahibinden, Hepsiemlak, EmlakJet, and generic Turkish XML
 */
export class TurkishPortalStrategy implements ImportStrategy {
    name = 'Turkish Portal XML';
    format: ImportFormat = 'SAHIBINDEN';
    supportedCountries: SupportedCountry[] = ['TR'];

    canHandle(source: string, country?: SupportedCountry): boolean {
        if (!source.trim().startsWith('<')) return false;

        // Check for Turkish portal markers
        const isTurkish =
            source.includes('sahibinden') ||
            source.includes('hepsiemlak') ||
            source.includes('emlakjet') ||
            source.includes('ilan') ||
            source.includes('emlak') ||
            source.includes('konut') ||
            source.includes('daire') ||
            (country === 'TR' && source.includes('property'));

        return isTurkish || country === 'TR';
    }

    async parse(content: string, country?: SupportedCountry): Promise<NormalizedProperty[]> {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            textNodeName: '#text'
        });

        try {
            const result = parser.parse(content);
            const properties: NormalizedProperty[] = [];

            // Try different root element patterns
            const listings = this.findListings(result);

            for (const item of listings) {
                try {
                    properties.push(this.mapProperty(item));
                } catch (e) {
                    console.error('Error mapping Turkish property:', e);
                }
            }

            return properties;
        } catch (e) {
            console.error('Turkish XML Parse Error:', e);
            return [];
        }
    }

    private findListings(result: any): any[] {
        // Common root elements in Turkish XML feeds
        const rootPaths = [
            'ilanlar.ilan',
            'emlaklar.emlak',
            'properties.property',
            'konutlar.konut',
            'listings.listing',
            'propertyList.property',
            'data.items',
            'data.ilan',
            'root.ilan',
            'root.property'
        ];

        for (const path of rootPaths) {
            const parts = path.split('.');
            let current = result;

            for (const part of parts) {
                if (current && current[part]) {
                    current = current[part];
                } else {
                    current = null;
                    break;
                }
            }

            if (current) {
                return Array.isArray(current) ? current : [current];
            }
        }

        // Fallback: try to find any array with property-like objects
        for (const key of Object.keys(result)) {
            const value = result[key];
            if (Array.isArray(value) && value.length > 0 && this.looksLikeProperty(value[0])) {
                return value;
            }
            if (typeof value === 'object' && value !== null) {
                for (const subKey of Object.keys(value)) {
                    const subValue = value[subKey];
                    if (Array.isArray(subValue) && subValue.length > 0 && this.looksLikeProperty(subValue[0])) {
                        return subValue;
                    }
                }
            }
        }

        return [];
    }

    private looksLikeProperty(obj: any): boolean {
        if (!obj || typeof obj !== 'object') return false;

        const propertyKeys = ['fiyat', 'price', 'sehir', 'city', 'oda', 'rooms', 'metrekare', 'area', 'baslik', 'title'];
        const objKeys = Object.keys(obj).map(k => k.toLowerCase());

        return propertyKeys.some(pk => objKeys.some(ok => ok.includes(pk)));
    }

    private mapProperty(item: any): NormalizedProperty {
        return {
            externalId: this.extractId(item),
            title: this.extractTitle(item),
            description: this.extractDescription(item),
            price: this.extractPrice(item),
            currency: this.extractCurrency(item),
            address: this.extractAddress(item),
            city: this.extractCity(item),
            district: this.extractDistrict(item),
            country: 'Turkey',
            countryCode: 'TR',
            propertyType: this.extractPropertyType(item),
            listingType: this.extractListingType(item),
            bedrooms: this.extractBedrooms(item),
            bathrooms: this.extractBathrooms(item),
            rooms: this.extractRooms(item),
            area: this.extractArea(item),
            floor: this.extractFloor(item),
            totalFloors: this.extractTotalFloors(item),
            buildingAge: this.extractBuildingAge(item),
            images: this.extractImages(item),
            features: this.extractFeatures(item),
            url: this.extractUrl(item),
            rawMetadata: item
        };
    }

    private extractId(item: any): string {
        return String(
            item.id || item.ilanNo || item.ilan_no || item.ilanId ||
            item.uniqueId || item['@_id'] || `tr-${Date.now()}-${Math.random()}`
        );
    }

    private extractTitle(item: any): string {
        return item.baslik || item.title || item.ilanBaslik || item.ilan_baslik ||
            item.headline || item.ad || 'İlan';
    }

    private extractDescription(item: any): string {
        return item.aciklama || item.description || item.detay || item.details ||
            item.ilanAciklama || item.ilan_aciklama || '';
    }

    private extractPrice(item: any): number {
        const priceStr = String(
            item.fiyat || item.price || item.tutar || item.bedel ||
            item.satisFiyati || item.kiraFiyati || item.fiyat?.['#text'] || 0
        );
        return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
    }

    private extractCurrency(item: any): string {
        const curr = item.paraBirimi || item.currency || item.doviz || 'TRY';
        const currMap: Record<string, string> = {
            'tl': 'TRY', 'try': 'TRY', 'türk lirası': 'TRY', '₺': 'TRY',
            'usd': 'USD', 'dolar': 'USD', '$': 'USD',
            'eur': 'EUR', 'euro': 'EUR', '€': 'EUR'
        };
        return currMap[curr.toLowerCase()] || 'TRY';
    }

    private extractAddress(item: any): string {
        return item.adres || item.address || item.konum || item.lokasyon || '';
    }

    private extractCity(item: any): string {
        return item.sehir || item.il || item.city || item.location?.city || '';
    }

    private extractDistrict(item: any): string {
        return item.ilce || item.semt || item.district || item.mahalle ||
            item.location?.district || '';
    }

    private extractPropertyType(item: any): string {
        const type = String(
            item.emlakTipi || item.konutTipi || item.propertyType || item.tip || item.category || ''
        ).toLowerCase();

        if (type.includes('daire') || type.includes('apartment')) return 'apartment';
        if (type.includes('villa')) return 'villa';
        if (type.includes('müstakil') || type.includes('ev') || type.includes('house')) return 'house';
        if (type.includes('arsa') || type.includes('land')) return 'land';
        if (type.includes('ticari') || type.includes('dükkan') || type.includes('ofis')) return 'commercial';
        if (type.includes('rezidans')) return 'apartment';
        return 'other';
    }

    private extractListingType(item: any): string {
        const type = String(
            item.ilanTipi || item.listingType || item.islemTipi || item.kategori || ''
        ).toLowerCase();

        if (type.includes('kiralık') || type.includes('rent') || type.includes('kira')) return 'rent';
        return 'sale';
    }

    private extractBedrooms(item: any): number | undefined {
        const rooms = this.extractRooms(item);
        if (rooms) {
            // Parse Turkish room format "3+1" -> 3 bedrooms
            const match = rooms.match(/^(\d+)/);
            if (match) return parseInt(match[1]);
        }
        const bedrooms = parseInt(item.odaSayisi || item.yatak || item.bedrooms || 0);
        return bedrooms || undefined;
    }

    private extractBathrooms(item: any): number | undefined {
        const baths = parseInt(item.banyoSayisi || item.banyo || item.bathrooms || 0);
        return baths || undefined;
    }

    private extractRooms(item: any): string | undefined {
        // Turkish format: "3+1" means 3 rooms + 1 living room
        return item.odaSayisi || item.oda || item.rooms || undefined;
    }

    private extractArea(item: any): number | undefined {
        const areaStr = String(item.metrekare || item.m2 || item.alan || item.area || item.brutM2 || 0);
        const area = parseFloat(areaStr.replace(/[^0-9.]/g, ''));
        return area || undefined;
    }

    private extractFloor(item: any): number | undefined {
        const floor = parseInt(item.kat || item.bulunduguKat || item.floor || 0);
        return floor || undefined;
    }

    private extractTotalFloors(item: any): number | undefined {
        const floors = parseInt(item.katSayisi || item.toplamKat || item.binaKatSayisi || item.totalFloors || 0);
        return floors || undefined;
    }

    private extractBuildingAge(item: any): number | undefined {
        const age = parseInt(item.binaYasi || item.yas || item.buildingAge || 0);
        return age || undefined;
    }

    private extractImages(item: any): string[] {
        const images: string[] = [];

        // Try various image field patterns
        const imageFields = [
            item.fotograflar, item.resimler, item.images, item.photos,
            item.gorsel, item.foto, item.image
        ];

        for (const field of imageFields) {
            if (!field) continue;

            if (Array.isArray(field)) {
                for (const img of field) {
                    const url = typeof img === 'string' ? img : (img.url || img.src || img['@_url'] || img['#text']);
                    if (url) images.push(url);
                }
            } else if (typeof field === 'string') {
                images.push(field);
            }
        }

        return images;
    }

    private extractFeatures(item: any): string[] {
        const features: string[] = [];

        // Try various feature field patterns
        const featureFields = [
            item.ozellikler, item.features, item.detaylar, item.nitelikler
        ];

        for (const field of featureFields) {
            if (!field) continue;

            if (Array.isArray(field)) {
                features.push(...field.map((f: any) => typeof f === 'string' ? f : (f.ad || f.name || f['#text'])).filter(Boolean));
            } else if (typeof field === 'string') {
                features.push(...field.split(',').map(f => f.trim()).filter(Boolean));
            }
        }

        // Check boolean features
        if (item.otopark || item.garaj) features.push('Otopark');
        if (item.havuz) features.push('Havuz');
        if (item.bahce) features.push('Bahçe');
        if (item.asansor) features.push('Asansör');
        if (item.guvenlik) features.push('Güvenlik');
        if (item.klima) features.push('Klima');
        if (item.esyali) features.push('Eşyalı');

        return features;
    }

    private extractUrl(item: any): string | undefined {
        return item.url || item.link || item.ilanUrl || item.detayUrl || undefined;
    }
}
