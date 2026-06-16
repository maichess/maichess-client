import { bridgeFetch } from '@/lib/utils/proxyFetch'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams()
  const server = searchParams.get('server')
  if (server) params.set('server', server)

  return bridgeFetch(`/openings?${params}`)
}
