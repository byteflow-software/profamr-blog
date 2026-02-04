import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Public admin routes
  const publicRoutes = ['/admin/login']
  if (publicRoutes.includes(pathname)) {
    // If already logged in, redirect to dashboard
    if (req.auth) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return NextResponse.next()
  }

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    if (!req.auth) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check role-based access for specific routes
    const adminOnlyRoutes = ['/admin/usuarios']
    if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
      if (req.auth.user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}
