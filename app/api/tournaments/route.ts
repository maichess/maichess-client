import { bridgeFetch } from '@/lib/utils/proxyFetch'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams()
  const server = searchParams.get('server')
  if (server) params.set('server', server)

  return bridgeFetch(`/tournaments?${params}`)
}

export async function POST(request: Request) {
  const body = await request.json()
  return bridgeFetch('/tournaments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
