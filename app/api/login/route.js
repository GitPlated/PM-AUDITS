import { NextResponse } from 'next/server'
import { COOKIE_VALUE, SITE_COOKIE } from '../../../lib/auth'

export async function POST(request) {
  const formData = await request.formData()
  const password = formData.get('password')
  const next = formData.get('next') || '/'

  const url = new URL(request.url)

  if (!process.env.SITE_PASSWORD || password !== process.env.SITE_PASSWORD) {
    url.pathname = '/login'
    url.search = `?error=1&next=${encodeURIComponent(next)}`
    return NextResponse.redirect(url)
  }

  url.pathname = next
  url.search = ''
  const response = NextResponse.redirect(url)
  response.cookies.set(SITE_COOKIE, COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // no maxAge: session cookie, cleared when the browser fully closes
  })
  return response
}
