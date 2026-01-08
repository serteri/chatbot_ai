import LegalPageLayout from "@/components/legal/LegalPageLayout"

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function PrivacyPage({ params }: PageProps) {
    const { locale } = await params

    return (
        <LegalPageLayout locale={locale} titleKey="Privacy Policy">
            <h3>1. Introduction</h3>
            <p>
                Welcome to PylonChat ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy.
                If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
            </p>

            <h3>2. Information We Collect</h3>
            <p>
                We collect personal information that you voluntarily provide to us when registering at the Services expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services or otherwise contacting us.
            </p>

            <h3>3. How We Use Your Information</h3>
            <p>
                We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
            <ul>
                <li>To facilitate account creation and logon process.</li>
                <li>To send you marketing and promotional communications.</li>
                <li>To send administrative information to you.</li>
            </ul>

            <h3>4. Sharing Your Information</h3>
            <p>
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
            </p>

            <h3>5. Contact Us</h3>
            <p>
                If you have questions or comments about this policy, you may email us at privacy@pylonchat.com or by post to:
            </p>
            <address className="not-italic mt-4 p-4 bg-gray-50 rounded-lg">
                <strong>PylonChat Inc.</strong><br />
                123 Technology Drive<br />
                Brisbane, QLD 4000<br />
                Australia
            </address>
        </LegalPageLayout>
    )
}
