import LegalPageLayout from "@/components/legal/LegalPageLayout"

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function TermsPage({ params }: PageProps) {
    const { locale } = await params

    return (
        <LegalPageLayout locale={locale} titleKey="Terms of Service">
            <h3>1. Agreement to Terms</h3>
            <p>
                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and PylonChat ("we", "us", or "our"), concerning your access to and use of our website and services.
            </p>

            <h3>2. User Representations</h3>
            <p>
                By using the Site, you represent and warrant that:
            </p>
            <ul>
                <li>All registration information you submit will be true, accurate, current, and complete.</li>
                <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                <li>You are not a minor in the jurisdiction in which you reside.</li>
            </ul>

            <h3>3. Prohibited Activities</h3>
            <p>
                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
            </p>

            <h3>4. Termination</h3>
            <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <h3>5. Contact Us</h3>
            <p>
                If you have any questions about these Terms, please contact us at terms@pylonchat.com.
            </p>
        </LegalPageLayout>
    )
}
