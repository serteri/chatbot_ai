import { getTranslations } from 'next-intl/server'
import LegalPageLayout from '@/components/legal/LegalPageLayout'

interface PageProps {
    params: Promise<{
        locale: string
    }>
}

export default async function PrivacyPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'legal.privacy' })
    const tCommon = await getTranslations({ locale, namespace: 'legal' })

    return (
        <LegalPageLayout locale={locale} titleKey={t('title')} updatedAt={`${tCommon('lastUpdated')}: January 1, 2024`}>
            <p className="lead">{t('intro')}</p>

            <h2>{t('collectTitle')}</h2>
            <p>{t('collectText')}</p>

            <h2>{t('useTitle')}</h2>
            <p>{t('useText')}</p>

            <h2>{t('shareTitle')}</h2>
            <p>{t('shareText')}</p>
        </LegalPageLayout>
    )
}
