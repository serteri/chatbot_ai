import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { PricingCards } from '@/components/billing/PricingCards'

export default async function PricingPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: true }
    })

    const currentPlan = user?.subscription?.planType || 'free'

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Planlar ve Fiyatlandırma</h1>
                <p className="text-xl text-gray-600">
                    İşletmeniz için doğru planı seçin
                </p>
            </div>

            <PricingCards currentPlan={currentPlan} />

            {/* Plan Karşılaştırma */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold text-center mb-8">Plan Karşılaştırma</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="border-b">
                            <th className="text-left p-4">Özellik</th>
                            <th className="text-center p-4">Free</th>
                            <th className="text-center p-4">Pro</th>
                            <th className="text-center p-4">Enterprise</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr className="border-b">
                            <td className="p-4">Chatbot Sayısı</td>
                            <td className="text-center p-4">1</td>
                            <td className="text-center p-4">5</td>
                            <td className="text-center p-4">Sınırsız</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-4">Doküman Sayısı</td>
                            <td className="text-center p-4">3</td>
                            <td className="text-center p-4">50</td>
                            <td className="text-center p-4">Sınırsız</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-4">Aylık Konuşma</td>
                            <td className="text-center p-4">50</td>
                            <td className="text-center p-4">1,000</td>
                            <td className="text-center p-4">Sınırsız</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-4">Analytics</td>
                            <td className="text-center p-4">❌</td>
                            <td className="text-center p-4">✅</td>
                            <td className="text-center p-4">✅</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-4">Özel Branding</td>
                            <td className="text-center p-4">❌</td>
                            <td className="text-center p-4">✅</td>
                            <td className="text-center p-4">✅</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-4">API Erişimi</td>
                            <td className="text-center p-4">❌</td>
                            <td className="text-center p-4">❌</td>
                            <td className="text-center p-4">✅</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-4">Destek</td>
                            <td className="text-center p-4">Email</td>
                            <td className="text-center p-4">Öncelikli</td>
                            <td className="text-center p-4">7/24</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FAQ */}
            <div className="mt-16 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8">Sık Sorulan Sorular</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Planımı istediğim zaman değiştirebilir miyim?</h3>
                        <p className="text-gray-600">
                            Evet, istediğiniz zaman plan yükseltme yapabilirsiniz. Yükseltme anında geçerli olur.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Aboneliği iptal edersem ne olur?</h3>
                        <p className="text-gray-600">
                            Aboneliği iptal ederseniz, dönem sonuna kadar planınız aktif kalır. Sonrasında Free plana geçersiniz.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Fatura nasıl alırım?</h3>
                        <p className="text-gray-600">
                            Her ödeme sonrası otomatik olarak email adresinize fatura gönderilir. Ayrıca "Aboneliği Yönet" butonundan geçmiş faturalara erişebilirsiniz.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Hangi ödeme yöntemlerini kabul ediyorsunuz?</h3>
                        <p className="text-gray-600">
                            Tüm büyük kredi kartlarını (Visa, Mastercard, American Express) kabul ediyoruz.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}