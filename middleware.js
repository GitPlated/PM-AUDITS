import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, COOKIE_VALUE, SITE_COOKIE } from './lib/auth'

// Two independent gates: a site-wide password for everything, and a second,
// separate password specifically for /admin. Neither is real per-user auth —
// it's a shared-password gate, matching the rest of the app's no-auth-yet
// stance (see supabase/schema.sql). Fails closed: if SITE_PASSWORD /
// ADMIN_PASSWORD aren't set as env vars, no password submission can match.
export function middleware(request) {
  const { pathname } = request.nextUrl

  const isSiteLogin = pathname === '/login'
  const isAdminLogin = pathname === '/admin-login'
  const isAuthApi = pathname.startsWith('/api/login') || pathname.startsWith('/api/admin-login')

  if (isSiteLogin || isAuthApi) return NextResponse.next()

  const siteOk = request.cookies.get(SITE_COOKIE)?.value === COOKIE_VALUE
  if (!siteOk) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = `?next=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/admin') && !isAdminLogin) {
    const adminOk = request.cookies.get(ADMIN_COOKIE)?.value === COOKIE_VALUE
    if (!adminOk) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin-login'
      url.search = `?next=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
