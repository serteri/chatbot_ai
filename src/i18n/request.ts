import { getRequestConfig } from 'next-intl/server'
// Force recompile 1

export default getRequestConfig(async ({ locale }) => {
    const finalLocale = locale || 'en'

    return {
        locale: finalLocale,
        messages: (await import(`../locales/${finalLocale}.json`)).default
    }
})