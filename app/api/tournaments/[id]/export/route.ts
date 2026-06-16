import { bridgeFetchRaw } from '@/lib/utils/proxyFetch'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams()
  const server = searchParams.get('server')
  if (server) params.set('server', server)

  const res = await bridgeFetchRaw(`/tournaments/${id}/export?${params}`)
  if (!res.ok) {
    return Response.json({ error: `Export failed (${res.status})` }, { status: res.status })
  }

  const pgn = await res.text()
  return new Response(pgn, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-chess-pgn',
      'Content-Disposition': `attachment; filename="tournament-${id}.pgn"`,
    },
  })
}
