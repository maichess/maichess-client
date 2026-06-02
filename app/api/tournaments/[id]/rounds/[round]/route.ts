import { cookies } from 'next/headers'

const BRIDGE = process.env.TOURNAMENT_BRIDGE_URL!

type Ctx = { params: Promise<{ id: string; round: string }> }

export async function GET(request: Request, ctx: Ctx) {
  const { id, round } = await ctx.params
  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams()
  const server = searchParams.get('server')
  if (server) params.set('server', server)

  const cookieStore = await cookies()
  const res = await fetch(`${BRIDGE}/tournaments/${id}/rounds/${round}?${params}`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
