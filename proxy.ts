import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/profile', '/play', '/match']
const AUTH_PAGES = ['/login', '/register']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasToken = request.cookies.has('access_token')

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (AUTH_PAGES.some((p) => pathname.startsWith(p)) && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
