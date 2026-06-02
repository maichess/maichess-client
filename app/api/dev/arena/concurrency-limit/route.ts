import { getBearerToken } from '@/lib/utils/proxy'

export async function GET() {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`${process.env.BOT_ARENA_URL}/concurrency-limit`, {
    headers: { Authorization: auth },
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}

export async function PUT(req: Request) {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const res = await fetch(`${process.env.BOT_ARENA_URL}/concurrency-limit`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
