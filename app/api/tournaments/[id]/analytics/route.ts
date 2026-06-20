import { bridgeFetch } from '@/lib/utils/proxyFetch'

type Ctx = { params: Promise<{ id: string }> }

// Proxy the tournament server's analytics export (via the bridge). Returns the
// raw, versioned AnalyticsExport JSON document; the client computes its own views
// (summary, leaderboard, termination mix, …) from it. Only available once the
// tournament is finished — the bridge maps "not finished" to 409.
export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams()
  const server = searchParams.get('server')
  if (server) params.set('server', server)

  return bridgeFetch(`/tournaments/${id}/analytics?${params}`)
}
