import { getTranslations } from 'next-intl/server'
import LegalPageLayout from '@/components/legal/LegalPageLayout'

interface PageProps {
    params: Promise<{
        locale: string
    }>
}

export default async function GdprPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'legal.gdpr' })
    const tCommon = await getTranslations({ locale, namespace: 'legal' })

    return (
        <LegalPageLayout locale={locale} titleKey={t('title')} updatedAt={`${tCommon('lastUpdated')}: January 1, 2024`}>
            <h2>{t('rightsTitle')}</h2>
            <p>{t('rightsText')}</p>

            <h2>{t('processingTitle')}</h2>
            <p>{t('processingText')}</p>

            <h2>Data Storage and Sovereignty</h2>
            <p>To comply with data sovereignty laws and the 13 Australian Privacy Principles (APP), all your NDIS participant data is securely stored in Sydney Azure Storage. This ensures that your sensitive information remains within Australia and meets the highest standards of data protection.</p>
        </LegalPageLayout>
    )
}
