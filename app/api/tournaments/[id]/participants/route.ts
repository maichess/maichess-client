import { bridgeFetch } from '@/lib/utils/proxyFetch'

type Ctx = { params: Promise<{ id: string }> }

// Add an already permanently-registered bot (from the registry) to a tournament
// by its registry id. Director-only; the bridge mints the bot's token and drives it.
export async function POST(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams()
  const server = searchParams.get('server')
  if (server) params.set('server', server)

  const body = await request.text()
  return bridgeFetch(`/tournaments/${id}/participants?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
}
