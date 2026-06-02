import { cookies } from 'next/headers'

const BRIDGE = process.env.TOURNAMENT_BRIDGE_URL!

export async function GET() {
  const cookieStore = await cookies()
  const res = await fetch(`${BRIDGE}/config`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  const body = await request.json()
  const res = await fetch(`${BRIDGE}/config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieStore.toString(),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
