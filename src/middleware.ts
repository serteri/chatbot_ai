import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Desteklenen diller
  locales: ['en', 'tr', 'de', 'fr', 'es'],

  // Varsayılan dil (İngilizce)
  defaultLocale: 'en',

  // Tarayıcı dil algılamasını KAPAT - her zaman İngilizce başlasın
  localeDetection: false,

  // Varsayılan dilin URL'de görünmemesini sağlar (/en yerine /)
  localePrefix: 'as-needed'
});

export const config = {
  // Chatbot (iframe) ve API yollarını hariç tutmaya devam ediyoruz
  matcher: ['/((?!api|_next|_static|.*\\..*|chatbot|embed).*)']
};