import { bridgeFetch } from '@/lib/utils/proxyFetch'

export async function POST(request: Request) {
  const body = await request.json()
  return bridgeFetch('/external/lichess/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
