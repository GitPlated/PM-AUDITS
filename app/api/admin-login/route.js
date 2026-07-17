import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, COOKIE_VALUE } from '../../../lib/auth'

export async function POST(request) {
  const formData = await request.formData()
  const password = formData.get('password')
  const next = formData.get('next') || '/admin'

  const url = new URL(request.url)

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    url.pathname = '/admin-login'
    url.search = `?error=1&next=${encodeURIComponent(next)}`
    return NextResponse.redirect(url)
  }

  url.pathname = next
  url.search = ''
  const response = NextResponse.redirect(url)
  response.cookies.set(ADMIN_COOKIE, COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // no maxAge: session cookie, cleared when the browser fully closes
  })
  return response
}
