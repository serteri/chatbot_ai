import LegalPageLayout from "@/components/legal/LegalPageLayout"

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function GdprPage({ params }: PageProps) {
    const { locale } = await params

    return (
        <LegalPageLayout locale={locale} titleKey="GDPR Compliance">
            <h3>1. Your Data Protection Rights</h3>
            <p>
                PylonChat is committed to ensuring that your privacy is protected and that we are compliant with the General Data Protection Regulation (GDPR). Users based in the European Economic Area (EEA) have certain data protection rights, including:
            </p>
            <ul>
                <li>The right to access, update or to delete the information we have on you.</li>
                <li>The right of rectification.</li>
                <li>The right to object.</li>
                <li>The right of restriction.</li>
                <li>The right to data portability.</li>
                <li>The right to withdraw consent.</li>
            </ul>

            <h3>2. Data Processing</h3>
            <p>
                We process your data only as necessary to provide our services, improve our platform, and comply with legal obligations. We do not sell your personal data to third parties.
            </p>

            <h3>3. International Transfers</h3>
            <p>
                Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
            </p>

            <h3>4. Contact DPO</h3>
            <p>
                If you wish to be informed what Personal Data we hold about you and if you want it to be removed from our systems, please contact our Data Protection Officer at dpo@pylonchat.com.
            </p>
        </LegalPageLayout>
    )
}
