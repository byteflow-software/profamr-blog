import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public admin routes
  if (pathname === '/admin/login') {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return NextResponse.next()
  }

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based access
    const adminOnlyRoutes = ['/admin/usuarios']
    if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
      if (req.auth?.user?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}
