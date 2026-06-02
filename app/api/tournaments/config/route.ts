import { bridgeFetch } from '@/lib/utils/proxyFetch'

export async function GET() {
  return bridgeFetch('/config')
}

export async function PUT(request: Request) {
  const body = await request.json()
  return bridgeFetch('/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
