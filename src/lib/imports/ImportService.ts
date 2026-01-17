import { ImportStrategy, NormalizedProperty } from './types';
import { SchemaOrgStrategy } from './strategies/SchemaOrgStrategy';
import { WordPressStrategy } from './strategies/WordPressStrategy';
import { ReaxmlStrategy } from './strategies/ReaxmlStrategy';

export class ImportService {
    private strategies: ImportStrategy[];

    constructor() {
        this.strategies = [
            new SchemaOrgStrategy(),
            new WordPressStrategy(),
            new ReaxmlStrategy()
        ];
    }

    async detectAndParse(input: string): Promise<{
        strategy: string;
        properties: NormalizedProperty[];
    }> {
        // Try each strategy
        for (const strategy of this.strategies) {
            if (strategy.canHandle(input)) {
                console.log(`Trying import strategy: ${strategy.name}`);
                const properties = await strategy.parse(input);

                if (properties.length > 0) {
                    return {
                        strategy: strategy.name,
                        properties
                    };
                }
            }
        }

        // Fallback: If URL, maybe try both Schema and WP since they both handle URLs
        if (input.startsWith('http')) {
            // If SchemaOrg failed, try WordPress explicitly if not already tried logic above
            // (The above loop is already trying them in order, so we are good)
        }

        throw new Error('No suitable import strategy found or no properties detected.');
    }
}
