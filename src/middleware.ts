import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // HATA ÇÖZÜMÜ: Buraya 'de', 'fr' ve 'es' dillerini eklemeyi unutmuştuk.
  // Bu liste olmazsa, Next.js bu dillerle başlayan sayfaları 404 olarak işaretler.
  locales: ['en', 'tr', 'de', 'fr', 'es'],

  // Varsayılan dil (İngilizce)
  defaultLocale: 'en',

  // Varsayılan dilin URL'de görünmemesini sağlar (/en yerine /)
  localePrefix: 'as-needed'
});

export const config = {
  // Chatbot (iframe) ve API yollarını hariç tutmaya devam ediyoruz
  matcher: ['/((?!api|_next|_static|.*\\..*|chatbot|embed).*)']
};