import { bridgeFetch } from '@/lib/utils/proxyFetch'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const body = await request.json()
  return bridgeFetch(`/tournaments/${id}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  return bridgeFetch(`/tournaments/${id}/register`, { method: 'DELETE' })
}
