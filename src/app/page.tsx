import Link from 'next/link'
import { PublicNav } from '@/components/layout/PublicNav'
import { Button } from '@/components/ui/button'
import { ArrowRight, Bot, FileText, BarChart3, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            AI Destekli Müşteri Destek
            <span className="block text-blue-600">Chatbot'u</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Kendi dokümanlarınızdan öğrenen, 7/24 müşterilerinize yanıt veren
            akıllı chatbot oluşturun. Dakikalar içinde kurulum, kod bilgisi gerektirmez.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-lg">
                Ücretsiz Başla <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg">
                Demo İzle
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold">Neden ChatbotAI?</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-white p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Kolay Kurulum</h3>
                <p className="mt-2 text-gray-600">
                  Dokümanlarınızı yükleyin, chatbot'unuz dakikalar içinde hazır.
                </p>
              </div>

              <div className="rounded-lg border bg-white p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Akıllı Öğrenme</h3>
                <p className="mt-2 text-gray-600">
                  PDF, DOCX dokümanlarınızdan otomatik öğrenir ve doğru yanıtlar verir.
                </p>
              </div>

              <div className="rounded-lg border bg-white p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Detaylı Analytics</h3>
                <p className="mt-2 text-gray-600">
                  Konuşmaları izleyin, müşteri memnuniyetini ölçün.
                </p>
              </div>

              <div className="rounded-lg border bg-white p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold">Hızlı Entegrasyon</h3>
                <p className="mt-2 text-gray-600">
                  Tek satır kod ile web sitenize ekleyin.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold">Hemen Başlayın</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
              Ücretsiz plan ile başlayın, kredi kartı gerektirmez.
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button size="lg" className="text-lg">
                  Ücretsiz Hesap Oluştur
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © 2025 ChatbotAI. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  )
}