import { getRequestConfig } from 'next-intl/server'

const locales = ['tr', 'en', 'de', 'fr', 'es']

export default getRequestConfig(async ({ locale }) => {
    // Fallback: eğer locale undefined ise tr kullan
    if (!locale || !locales.includes(locale)) {
        locale = 'tr'
    }

    return {
        locale,
        messages: (await import(`../locales/${locale}.json`)).default
    }
})