import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, SESSION_VALUE, safeNext } from '@/lib/auth/demo'

// Demo auth guard (see lib/auth/demo.ts). Logged-in routes need the session
// cookie; /login with a session goes straight to the app. API routes answer
// 401 instead of redirecting. The GitHub webhook is not behind the cookie:
// GitHub signs it, and the handler must check that signature.
const PUBLIC_API = new Set(['/api/github/webhook'])

export function middleware(request: NextRequest) {
  const loggedIn = request.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE
  const { pathname, search } = request.nextUrl

  if (pathname.startsWith('/api/')) {
    if (loggedIn || PUBLIC_API.has(pathname)) return NextResponse.next()
    return NextResponse.json({ error: 'Log in to use the API.' }, { status: 401 })
  }

  if (pathname === '/login') {
    if (!loggedIn) return NextResponse.next()
    const target = safeNext(request.nextUrl.searchParams.get('next'))
    return NextResponse.redirect(new URL(target, request.url))
  }

  if (!loggedIn) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname + search)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/workflows/:path*',
    '/runs/:path*',
    '/runners/:path*',
    '/settings/:path*',
    '/templates/:path*',
    '/api/:path*',
  ],
}
