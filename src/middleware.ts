import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthTokenFromRequest, verifyAuthToken } from './lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth and logout endpoints
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Only protect admin routes (except the login page itself)
  if (pathname.startsWith('/admin')) {
    // Allow access to the main admin page (login)
    if (pathname === '/admin') {
      return NextResponse.next()
    }

    const token = getAuthTokenFromRequest(request)

    if (!token || !verifyAuthToken(token)) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/posts')) {
    const token = getAuthTokenFromRequest(request)

    if (!token || !verifyAuthToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/posts/:path*']
}