import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db/prisma';
import { PricingCards } from '@/components/billing/PricingCards';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, ExternalLink, Shield, AlertCircle, Download, Calendar } from "lucide-react";
import PortalButton from '@/components/billing/PortalButton';
import Stripe from 'stripe';
import { Badge } from '@/components/ui/badge';

export default async function BillingPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const tPricing = await getTranslations({ locale, namespace: 'pricing' });
    const tBilling = await getTranslations({ locale, namespace: 'billing' });

    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: true }
    });

    const currentPlan = user?.subscription?.planType || 'free';

    // Stripe ID'yi al
    const stripeCustomerId = user?.subscription?.stripeCustomerId || user?.stripeCustomerId;

    // Kart ve Fatura detayları için değişkenler
    let cardDetails = null;
    let hasPaymentMethod = false;
    let invoices: any[] = [];

    // --- STRIPE BAĞLANTISI ---
    if (stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
        try {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2024-06-20',
            });

            // 1. Kart Bilgilerini Çek
            const customer = await stripe.customers.retrieve(stripeCustomerId, {
                expand: ['invoice_settings.default_payment_method']
            });

            if (!customer.deleted) {
                const defaultPM = customer.invoice_settings.default_payment_method;

                if (defaultPM && typeof defaultPM !== 'string' && defaultPM.card) {
                    hasPaymentMethod = true;
                    cardDetails = {
                        brand: defaultPM.card.brand.toUpperCase(),
                        last4: defaultPM.card.last4,
                        expMonth: defaultPM.card.exp_month,
                        expYear: defaultPM.card.exp_year
                    };
                } else {
                    const paymentMethods = await stripe.paymentMethods.list({
                        customer: stripeCustomerId,
                        type: 'card',
                        limit: 1,
                    });

                    if (paymentMethods.data.length > 0) {
                        const card = paymentMethods.data[0].card;
                        if (card) {
                            hasPaymentMethod = true;
                            cardDetails = {
                                brand: card.brand.toUpperCase(),
                                last4: card.last4,
                                expMonth: card.exp_month,
                                expYear: card.exp_year
                            };
                        }
                    }
                }
            }

            // 2. Son Faturaları Çek
            const invoiceList = await stripe.invoices.list({
                customer: stripeCustomerId,
                limit: 5,
                status: 'paid'
            });

            invoices = invoiceList.data.map(inv => ({
                id: inv.id,
                number: inv.number,
                date: new Date(inv.created * 1000).toLocaleDateString(locale),
                amount: new Intl.NumberFormat(locale, { style: 'currency', currency: inv.currency.toUpperCase() }).format(inv.amount_paid / 100),
                status: inv.status,
                pdfUrl: inv.invoice_pdf
            }));

        } catch (error) {
            console.error("Stripe Veri Çekme Hatası:", error);
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-7xl px-4 animate-in fade-in-50">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    {tPricing('title')}
                </h1>
                <p className="text-lg text-slate-500 mt-2">
                    {tPricing('subtitle')}
                </p>
            </div>

            {/* Fiyatlandırma Kartları */}
            <PricingCards currentPlan={currentPlan} />

            <div className="grid gap-8 lg:grid-cols-3 mt-16">

                {/* Ödeme Yöntemi Kartı */}
                <Card className="lg:col-span-1 border-slate-200 shadow-sm flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CreditCard className="h-5 w-5 text-slate-600" />
                            {tBilling('paymentMethod')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[160px]">

                            {hasPaymentMethod && cardDetails ? (
                                /* DURUM 1: KART BULUNDU */
                                <>
                                    <div className="w-16 h-10 bg-white border border-slate-200 rounded-md flex items-center justify-center shadow-sm relative overflow-hidden">
                                        <span className="text-xs font-black text-slate-700 tracking-wider">
                                            {cardDetails.brand}
                                        </span>
                                        <div className="absolute top-0 right-0 w-4 h-full bg-slate-100 -skew-x-12 opacity-50"></div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-900 font-medium tracking-wide text-lg">
                                            •••• •••• •••• {cardDetails.last4}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {tBilling('expires') || "SKT"}: {cardDetails.expMonth}/{cardDetails.expYear}
                                        </p>
                                    </div>
                                </>
                            ) : stripeCustomerId ? (
                                /* DURUM 2: STRIPE ID VAR AMA KART YOK */
                                <>
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-1 border border-blue-100">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-900 font-medium">{tBilling('securePayment')}</p>
                                        <p className="text-xs text-slate-500 px-4">
                                            Kart bilgisi görüntülenemiyor. Lütfen portaldan kontrol edin.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                /* DURUM 3: HİÇBİR KAYIT YOK */
                                <>
                                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-1">
                                        <CreditCard className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">
                                        {tBilling('noPaymentMethod')}
                                    </p>
                                </>
                            )}

                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-between border-t border-slate-100 p-4 bg-slate-50/50">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-green-600" /> SSL 256-bit
                        </span>

                        {/* PORTAL BUTONU */}
                        <PortalButton variant="ghost" size="sm" className="text-blue-600 h-8 hover:text-blue-700 hover:bg-blue-50 font-medium">
                            {hasPaymentMethod ? tBilling('updateCard') : tBilling('addCard')}
                        </PortalButton>
                    </CardFooter>
                </Card>

                {/* Fatura Geçmişi */}
                <Card className="lg:col-span-2 border-slate-200 shadow-sm flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5 text-slate-600" />
                            {tBilling('invoiceHistory')}
                        </CardTitle>
                        <CardDescription>{tBilling('invoiceDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {invoices.length > 0 ? (
                            <div className="rounded-md border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="p-3 pl-4">{tBilling('date')}</th>
                                        <th className="p-3">{tBilling('amount')}</th>
                                        <th className="p-3">{tBilling('status')}</th>
                                        <th className="p-3 text-right pr-4">PDF</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-3 pl-4 flex items-center gap-2 text-slate-700">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {inv.date}
                                            </td>
                                            <td className="p-3 font-medium text-slate-900">{inv.amount}</td>
                                            <td className="p-3">
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                                    {tBilling('paid')}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-right pr-4">
                                                {inv.pdfUrl && (
                                                    <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 transition-colors">
                                                        <Download className="w-4 h-4 text-slate-500" />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center h-full">
                                <div className="p-3 bg-white rounded-full shadow-sm mb-4 border border-slate-100">
                                    <FileText className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-2">{tBilling('viewInPortal')}</h3>
                                <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
                                    {tBilling('portalDesc')}
                                </p>

                                <PortalButton variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300 px-6">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    {tBilling('goToPortal')}
                                </PortalButton>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}