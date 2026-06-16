import { bridgeFetch } from '@/lib/utils/proxyFetch'

type Ctx = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  return bridgeFetch(`/registry/${id}`, { method: 'DELETE' })
}
