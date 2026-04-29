import { getBearerToken } from '@/lib/utils/proxy'

export async function GET(req: Request) {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = searchParams.toString()
  const url = `${process.env.ANALYSIS_SERVICE_URL}/games${query ? `?${query}` : ''}`

  const res = await fetch(url, {
    headers: { Authorization: auth },
    cache: 'no-store',
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}

export async function POST(req: Request) {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const res = await fetch(`${process.env.ANALYSIS_SERVICE_URL}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}
