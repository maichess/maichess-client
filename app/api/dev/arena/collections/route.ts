import { getBearerToken } from '@/lib/utils/proxy'

export async function POST(req: Request) {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const res = await fetch(`${process.env.BOT_ARENA_URL}/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}

export async function GET(req: Request) {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const target = new URL(`${process.env.BOT_ARENA_URL}/collections`)
  for (const [key, value] of searchParams) target.searchParams.set(key, value)

  const res = await fetch(target.toString(), {
    headers: { Authorization: auth },
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
