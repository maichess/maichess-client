import { bridgeFetch } from '@/lib/utils/proxyFetch'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams()
  const server = searchParams.get('server')
  if (server) params.set('server', server)

  return bridgeFetch(`/tournaments/${id}?${params}`)
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  return bridgeFetch(`/tournaments/${id}`, { method: 'DELETE' })
}
