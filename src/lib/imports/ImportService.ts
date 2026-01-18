import { ImportStrategy, NormalizedProperty, SupportedCountry, ImportResult } from './types';
import { StrategyFactory } from './StrategyFactory';

export class ImportService {
    /**
     * Auto-detect strategy and parse content
     */
    async detectAndParse(input: string, country?: SupportedCountry): Promise<{
        strategy: string;
        properties: NormalizedProperty[];
    }> {
        const strategy = StrategyFactory.detectStrategy(input, country);

        if (!strategy) {
            throw new Error('No suitable import strategy found. Please check the file format or URL.');
        }

        console.log(`Using import strategy: ${strategy.name}`);
        const properties = await strategy.parse(input, country);

        if (properties.length === 0) {
            throw new Error('No properties could be extracted. Please check the file format.');
        }

        return {
            strategy: strategy.name,
            properties
        };
    }

    /**
     * Parse with a specific strategy format
     */
    async parseWithFormat(
        input: string,
        format: string,
        country: SupportedCountry
    ): Promise<{
        strategy: string;
        properties: NormalizedProperty[];
    }> {
        const strategy = StrategyFactory.getStrategyByFormat(format as any);

        if (!strategy) {
            // Fall back to auto-detection
            return this.detectAndParse(input, country);
        }

        console.log(`Using specified strategy: ${strategy.name}`);
        const properties = await strategy.parse(input, country);

        return {
            strategy: strategy.name,
            properties
        };
    }

    /**
     * Import properties to database
     */
    async importToDatabase(
        properties: NormalizedProperty[],
        chatbotId: string,
        prisma: any
    ): Promise<ImportResult> {
        const result: ImportResult = {
            success: true,
            strategy: 'database',
            country: properties[0]?.countryCode || 'AU',
            properties,
            imported: 0,
            updated: 0,
            skipped: 0,
            errors: []
        };

        for (const prop of properties) {
            try {
                // Check if property already exists by externalId
                const existing = await prisma.property.findFirst({
                    where: {
                        chatbotId,
                        externalId: prop.externalId
                    }
                });

                if (existing) {
                    // Update existing property
                    await prisma.property.update({
                        where: { id: existing.id },
                        data: {
                            title: prop.title,
                            description: prop.description,
                            price: prop.price,
                            currency: prop.currency,
                            address: prop.address,
                            city: prop.city,
                            district: prop.district,
                            country: prop.country,
                            propertyType: prop.propertyType,
                            listingType: prop.listingType,
                            bedrooms: prop.bedrooms,
                            bathrooms: prop.bathrooms,
                            rooms: prop.rooms,
                            area: prop.area,
                            floorNumber: prop.floor,
                            totalFloors: prop.totalFloors,
                            buildingAge: prop.buildingAge,
                            images: prop.images,
                            features: prop.features || [],
                            externalUrl: prop.url,
                            rawMetadata: prop.rawMetadata,
                            updatedAt: new Date()
                        }
                    });
                    result.updated++;
                } else {
                    // Create new property
                    await prisma.property.create({
                        data: {
                            chatbotId,
                            externalId: prop.externalId,
                            title: prop.title,
                            description: prop.description,
                            price: prop.price,
                            currency: prop.currency,
                            address: prop.address,
                            city: prop.city,
                            district: prop.district,
                            country: prop.country,
                            propertyType: prop.propertyType,
                            listingType: prop.listingType,
                            bedrooms: prop.bedrooms,
                            bathrooms: prop.bathrooms,
                            rooms: prop.rooms,
                            area: prop.area,
                            floorNumber: prop.floor,
                            totalFloors: prop.totalFloors,
                            buildingAge: prop.buildingAge,
                            images: prop.images,
                            features: prop.features || [],
                            externalUrl: prop.url,
                            rawMetadata: prop.rawMetadata,
                            source: 'import',
                            status: 'active'
                        }
                    });
                    result.imported++;
                }
            } catch (error: any) {
                result.errors.push(`Failed to import "${prop.title}": ${error.message}`);
                result.skipped++;
            }
        }

        result.success = result.errors.length === 0;
        return result;
    }
}
