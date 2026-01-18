import { ImportStrategy, ImportFormat, SupportedCountry, COUNTRY_CONFIGS } from './types';
import { ReaxmlStrategy } from './strategies/ReaxmlStrategy';
import { SchemaOrgStrategy } from './strategies/SchemaOrgStrategy';
import { WordPressStrategy } from './strategies/WordPressStrategy';
import { CsvJsonStrategy } from './strategies/CsvJsonStrategy';
import { TurkishPortalStrategy } from './strategies/TurkishPortalStrategy';

/**
 * Factory for creating import strategies based on country and format
 */
export class StrategyFactory {
    private static strategies: ImportStrategy[] = [
        new ReaxmlStrategy(),
        new TurkishPortalStrategy(),
        new CsvJsonStrategy(),
        new SchemaOrgStrategy(),
        new WordPressStrategy(),
    ];

    /**
     * Get available formats for a given country
     */
    static getFormatsForCountry(country: SupportedCountry): ImportFormat[] {
        return COUNTRY_CONFIGS[country]?.defaultFormats || ['WEBSITE_SCRAPE'];
    }

    /**
     * Get a strategy by format type
     */
    static getStrategyByFormat(format: ImportFormat): ImportStrategy | undefined {
        return this.strategies.find(s => s.format === format);
    }

    /**
     * Get all strategies that support a given country
     */
    static getStrategiesForCountry(country: SupportedCountry): ImportStrategy[] {
        return this.strategies.filter(s => s.supportedCountries.includes(country));
    }

    /**
     * Auto-detect the best strategy for given content and country
     */
    static detectStrategy(content: string, country?: SupportedCountry): ImportStrategy | undefined {
        // If country specified, try country-specific strategies first
        if (country) {
            const countryStrategies = this.getStrategiesForCountry(country);
            for (const strategy of countryStrategies) {
                if (strategy.canHandle(content, country)) {
                    return strategy;
                }
            }
        }

        // Fallback to any strategy that can handle the content
        for (const strategy of this.strategies) {
            if (strategy.canHandle(content, country)) {
                return strategy;
            }
        }

        return undefined;
    }

    /**
     * Register a new strategy
     */
    static registerStrategy(strategy: ImportStrategy): void {
        this.strategies.push(strategy);
    }

    /**
     * Get all registered strategies
     */
    static getAllStrategies(): ImportStrategy[] {
        return [...this.strategies];
    }

    /**
     * Get human-readable format name
     */
    static getFormatDisplayName(format: ImportFormat): string {
        const names: Record<ImportFormat, string> = {
            'REAXML': 'REAXML Feed (Australia)',
            'OPENIMMO': 'OpenImmo (Germany)',
            'BLM': 'BLM Format (UK)',
            'RTDF': 'Rightmove RTDF (UK)',
            'KYERO': 'Kyero Feed (Spain)',
            'SAHIBINDEN': 'Sahibinden XML (Turkey)',
            'HEPSIEMLAK': 'Hepsiemlak XML (Turkey)',
            'EMLAKJET': 'EmlakJet XML (Turkey)',
            'GENERIC_XML': 'Generic XML',
            'GENERIC_JSON': 'CSV/JSON Upload',
            'WEBSITE_SCRAPE': 'Website Import'
        };
        return names[format] || format;
    }
}
