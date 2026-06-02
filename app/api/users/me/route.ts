import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()

  const res = await fetch(`${process.env.USER_SERVICE_URL}/users/me`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies()
  const body = await req.json()

  const res = await fetch(`${process.env.USER_SERVICE_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieStore.toString(),
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  try {
    const data = JSON.parse(text)
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: text || 'Unknown error' }, { status: res.status })
  }
}
