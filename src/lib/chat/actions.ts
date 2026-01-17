import { prisma } from '@/lib/db/prisma';

export interface PropertySearchCriteria {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    listingType?: 'sale' | 'rent';
    propertyType?: string;
}

export async function searchProperties(criteria: PropertySearchCriteria, chatbotId: string) {
    try {
        const where: any = {
            chatbotId,
            status: 'active'
        };

        if (criteria.city) {
            where.city = { contains: criteria.city, mode: 'insensitive' };
        }

        if (criteria.listingType) {
            where.listingType = criteria.listingType;
        }

        if (criteria.minPrice || criteria.maxPrice) {
            where.price = {};
            if (criteria.minPrice) where.price.gte = criteria.minPrice;
            if (criteria.maxPrice) where.price.lte = criteria.maxPrice;
        }

        // Handle bedroom count (approximating "at least" or "exact" depending on UX, usually people imply "at least" or "around")
        // For strict searching, we use exact or gte. Let's use gte for bedrooms to be helpful.
        if (criteria.bedrooms) {
            where.bedrooms = { gte: criteria.bedrooms };
        }

        // Add property type filter if provided
        if (criteria.propertyType) {
            // Simple mapping for common terms
            const type = criteria.propertyType.toLowerCase();
            if (type.includes('apartment') || type.includes('flat')) where.propertyType = 'apartment';
            else if (type.includes('house') || type.includes('villa')) where.propertyType = 'house';
            else if (type.includes('land')) where.propertyType = 'land';
            else if (type.includes('commercial')) where.propertyType = 'commercial';
        }

        const properties = await prisma.property.findMany({
            where,
            take: 5, // Limit to 5 results for chat context
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                price: true,
                currency: true,
                city: true,
                district: true,
                bedrooms: true,
                images: true,
                listingType: true,
                propertyType: true,
                description: true
            }
        });

        return properties;
    } catch (error) {
        console.error('Property search error:', error);
        return [];
    }
}
