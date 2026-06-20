import { bridgeFetch } from '@/lib/utils/proxyFetch'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams()
  const server = searchParams.get('server')
  if (server) params.set('server', server)

  return bridgeFetch(`/openings?${params}`)
}

// Register a custom named starting position (by FEN) usable across tournaments.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams()
  const server = searchParams.get('server')
  if (server) params.set('server', server)

  const body = await request.text()
  return bridgeFetch(`/openings?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
}
