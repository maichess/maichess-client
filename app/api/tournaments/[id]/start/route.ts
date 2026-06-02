import { bridgeFetch } from '@/lib/utils/proxyFetch'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  return bridgeFetch(`/tournaments/${id}/start`, { method: 'POST' })
}
