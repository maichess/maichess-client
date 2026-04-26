import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const cookieStore = await cookies()

  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookieStore.toString() },
  })

  const response = new Response(null, { status: res.status })

  res.headers.getSetCookie().forEach((cookie) => {
    response.headers.append('Set-Cookie', cookie)
  })

  return response
}

// GET: called by server-side redirects when a stale token must be cleared before
// sending the user to /login. The /api path is excluded from the proxy matcher,
// so this breaks the dashboard → /login → /dashboard redirect loop.
export async function GET(req: Request) {
  const cookieStore = await cookies()

  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookieStore.toString() },
  })

  const response = NextResponse.redirect(new URL('/login', req.url))

  res.headers.getSetCookie().forEach((cookie) => {
    response.headers.append('Set-Cookie', cookie)
  })

  return response
}
