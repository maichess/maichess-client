import { cookies } from 'next/headers'

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
