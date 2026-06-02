import { bridgeFetch } from '@/lib/utils/proxyFetch'

type Ctx = { params: Promise<{ id: string; round: string }> }

export async function GET(request: Request, ctx: Ctx) {
  const { id, round } = await ctx.params
  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams()
  const server = searchParams.get('server')
  if (server) params.set('server', server)

  return bridgeFetch(`/tournaments/${id}/rounds/${round}?${params}`)
}
