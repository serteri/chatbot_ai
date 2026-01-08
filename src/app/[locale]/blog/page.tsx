import PlaceholderPage from "@/components/PlaceholderPage"

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function BlogPage({ params }: PageProps) {
    const { locale } = await params
    return <PlaceholderPage locale={locale} titleKey="Blog" />
}
