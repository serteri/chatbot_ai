import { getTranslations } from 'next-intl/server'
import LegalPageLayout from '@/components/legal/LegalPageLayout'

interface PageProps {
    params: Promise<{
        locale: string
    }>
}

export default async function CookiesPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'legal.cookies' })
    const tCommon = await getTranslations({ locale, namespace: 'legal' })

    return (
        <LegalPageLayout locale={locale} titleKey={t('title')} updatedAt={`${tCommon('lastUpdated')}: January 1, 2024`}>
            <h2>{t('whatTitle')}</h2>
            <p>{t('whatText')}</p>

            <h2>{t('howTitle')}</h2>
            <p>{t('howText')}</p>
        </LegalPageLayout>
    )
}
