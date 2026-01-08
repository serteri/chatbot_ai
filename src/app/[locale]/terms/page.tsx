import { getTranslations } from 'next-intl/server'
import LegalPageLayout from '@/components/legal/LegalPageLayout'

interface PageProps {
    params: Promise<{
        locale: string
    }>
}

export default async function TermsPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'legal.terms' })
    const tCommon = await getTranslations({ locale, namespace: 'legal' })

    return (
        <LegalPageLayout locale={locale} titleKey={t('title')} updatedAt={`${tCommon('lastUpdated')}: January 1, 2024`}>
            <h2>{t('agreementTitle')}</h2>
            <p>{t('agreementText')}</p>

            <h2>{t('userTitle')}</h2>
            <p>{t('userText')}</p>

            <h2>{t('prohibitedTitle')}</h2>
            <p>{t('prohibitedText')}</p>
        </LegalPageLayout>
    )
}
