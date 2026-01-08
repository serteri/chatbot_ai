import PlaceholderPage from "@/components/PlaceholderPage"

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function CookiesPage({ params }: PageProps) {
    const { locale } = await params
    return <PlaceholderPage locale={locale} titleKey="Cookie Policy" />
}
