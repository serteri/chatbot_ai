import { getRequestConfig } from 'next-intl/server'

// next-intl v4 API: uses `requestLocale` instead of the deprecated `locale` parameter.
// This fixes Vercel edge runtime compatibility issues.
export default getRequestConfig(async ({ requestLocale }) => {
    const locale = (await requestLocale) || 'en'

    return {
        locale,
        messages: (await import(`../locales/${locale}.json`)).default
    }
})