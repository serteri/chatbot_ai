import PlaceholderPage from "@/components/PlaceholderPage"

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function HelpPage({ params }: PageProps) {
    const { locale } = await params
    return <PlaceholderPage locale={locale} titleKey="Help Center" />
}
