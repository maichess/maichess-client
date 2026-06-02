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

export async function DELETE(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const { searchParams } = new URL(request.url)
  const botId = searchParams.get('bot_id')
  const params = botId ? `?bot_id=${encodeURIComponent(botId)}` : ''
  return bridgeFetch(`/tournaments/${id}/register${params}`, { method: 'DELETE' })
}
