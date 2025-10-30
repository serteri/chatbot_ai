import { auth } from '@/lib/auth/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Public routes (giriş yapmadan erişilebilir)
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/pricing',
    '/about',
    '/contact',
  ]

  // API routes (auth kontrolü yok)
  const isApiRoute = nextUrl.pathname.startsWith('/api')
  
  // Static files
  const isStaticFile = nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js)$/)

  if (isApiRoute || isStaticFile) {
    return NextResponse.next()
  }

  // Public route kontrolü
  const isPublicRoute = publicRoutes.some(route => 
    nextUrl.pathname === route || nextUrl.pathname.startsWith(route)
  )

  // Giriş yapmamış kullanıcı protected sayfaya erişmeye çalışıyor
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL('/login', nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Giriş yapmış kullanıcı login/register sayfasına erişmeye çalışıyor
  if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}