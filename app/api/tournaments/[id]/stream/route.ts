import { cookies } from 'next/headers'

const BRIDGE = process.env.TOURNAMENT_BRIDGE_URL!

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams()
  const server = searchParams.get('server')
  if (server) params.set('server', server)

  const cookieStore = await cookies()
  const upstream = await fetch(`${BRIDGE}/tournaments/${id}/stream?${params}`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  })

  if (!upstream.ok || !upstream.body) {
    return new Response(upstream.statusText, { status: upstream.status })
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
