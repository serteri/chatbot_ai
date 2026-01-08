import LegalPageLayout from "@/components/legal/LegalPageLayout"

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function CookiesPage({ params }: PageProps) {
    const { locale } = await params

    return (
        <LegalPageLayout locale={locale} titleKey="Cookie Policy">
            <h3>1. What Are Cookies</h3>
            <p>
                As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies.
            </p>

            <h3>2. How We Use Cookies</h3>
            <p>
                We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.
            </p>
            <ul>
                <li><strong>Account related cookies:</strong> If you create an account with us then we will use cookies for the management of the signup process and general administration.</li>
                <li><strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact.</li>
                <li><strong>Forms related cookies:</strong> When you submit data to through a form such as those found on contact pages or comment forms cookies may be set to remember your user details for future correspondence.</li>
            </ul>

            <h3>3. Disabling Cookies</h3>
            <p>
                You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit.
            </p>
        </LegalPageLayout>
    )
}
