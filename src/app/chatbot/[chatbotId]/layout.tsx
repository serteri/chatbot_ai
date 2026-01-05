import '@/app/globals.css'; // Tailwind stillerini dahil ediyoruz
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Chatbot Widget',
  robots: 'noindex, nofollow', // Google'ın bu küçük pencereyi indekslemesini engelliyoruz
};

export default function ChatbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* bg-transparent: Arka planı şeffaf yapıyoruz ki iframe köşeleri yuvarlatılabilsin */}
      <body className={`${inter.className} bg-transparent`}>
        {/* Burada Navbar veya Sidebar YOK. Sadece içerik var. */}
        {children}
      </body>
    </html>
  );
}