import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getTranslations } from 'next-intl/server'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function FaqPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'contact.faq' })
    const tPage = await getTranslations({ locale, namespace: 'footer.links' })

    const faqs = [
        { id: 'item-1', q: 'q1', a: 'a1' },
        { id: 'item-2', q: 'q2', a: 'a2' },
        { id: 'item-3', q: 'q3', a: 'a3' },
        { id: 'item-4', q: 'q4', a: 'a4' },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />

            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{tPage('faq')}</h1>
                        <p className="text-xl text-gray-600">Frequently asked questions about PylonChat</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq) => (
                                <AccordionItem key={faq.id} value={faq.id}>
                                    <AccordionTrigger className="text-left font-medium text-gray-900 hover:text-blue-600">
                                        {t(faq.q)}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-gray-600">
                                        {t(faq.a)}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </main>

            <Footer locale={locale} />
        </div>
    )
}
