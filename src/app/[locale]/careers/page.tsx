import PlaceholderPage from "@/components/PlaceholderPage"

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function CareersPage({ params }: PageProps) {
    const { locale } = await params
    return <PlaceholderPage locale={locale} titleKey="Careers" />
}
