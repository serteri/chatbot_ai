import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'tr', 'de', 'fr', 'es'],
  defaultLocale: 'en',
  localeDetection: false,
  localePrefix: 'as-needed'
});

export default async function middleware(req: NextRequest) {
  const host = req.headers.get('host');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Extract hostname from APP_URL for comparison
  const appHostname = new URL(appUrl).host;

  // Normalize hosts to handle www. prefix correctly
  const cleanHost = host?.replace(/^www\./, '');
  const cleanAppHostname = appHostname.replace(/^www\./, '');

  // Check if it's a custom domain
  // 1. Host exists
  // 2. Host is NOT the app's main hostname (ignoring www)
  // 3. Host is NOT localhost (unless appUrl is also localhost)
  // 4. Host is NOT a vercel preview URL
  const isCustomDomain =
    cleanHost &&
    cleanHost !== cleanAppHostname &&
    !host?.includes('vercel.app');

  if (isCustomDomain) {
    // Rewrite to the domain handler page
    // We pass the path as well so /domain.com/abc -> /domain/domain.com/abc
    const url = req.nextUrl.clone();
    url.pathname = `/domain/${host}${req.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Otherwise, use standard internationalization middleware
  return intlMiddleware(req);
}

export const config = {
  // Chatbot (iframe), API routes, and now the internal /domain route are excluded from intl middleware primarily
  // But wait, /domain is an internal rewrite destination, so it won't be matched by the incoming request matcher naturally?
  // Actually, rewrite happens internally. Valid requests hitting middleware are external.
  matcher: ['/((?!api|_next|_static|.*\\..*|chatbot|embed).*)']
};