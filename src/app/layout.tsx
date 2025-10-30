import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/providers/ToastProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChatbotAI - AI Destekli Müşteri Destek Chatbot',
  description: 'Kendi dokümanlarınızdan öğrenen akıllı chatbot oluşturun',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}