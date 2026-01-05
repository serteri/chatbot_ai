import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
    const finalLocale = locale || 'tr'

    return {
        locale: finalLocale,
        messages: (await import(`../locales/${finalLocale}.json`)).default
    }
})