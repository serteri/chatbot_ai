import tr from '@/locales/tr.json'
import en from '@/locales/en.json'
import de from '@/locales/de.json'
import fr from '@/locales/fr.json'
import es from '@/locales/es.json'

const translations = {
    tr,
    en,
    de,
    fr,
    es
}

export type Locale = 'tr' | 'en' | 'de' | 'fr' | 'es'

export function getTranslations(locale: Locale) {
    return translations[locale] || translations.tr
}

export function t(locale: Locale, key: string): string {
    const keys = key.split('.')
    let value: any = getTranslations(locale)

    for (const k of keys) {
        value = value?.[k]
    }

    return value || key
}