import { cookies } from 'next/headers'

const BRIDGE = process.env.TOURNAMENT_BRIDGE_URL!

export async function GET() {
  const cookieStore = await cookies()
  const res = await fetch(`${BRIDGE}/bots`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
