import { cookies } from 'next/headers'

const BRIDGE = process.env.TOURNAMENT_BRIDGE_URL!

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams()
  const server = searchParams.get('server')
  if (server) params.set('server', server)

  const cookieStore = await cookies()
  const res = await fetch(`${BRIDGE}/tournaments?${params}`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const body = await request.json()
  const res = await fetch(`${BRIDGE}/tournaments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieStore.toString(),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
