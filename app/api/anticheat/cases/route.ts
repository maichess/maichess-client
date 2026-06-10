import { getBearerToken } from '@/lib/utils/proxy'

export async function GET(req: Request) {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const target = new URL(`${process.env.ANTICHEAT_SERVICE_URL}/anticheat/cases`)
  for (const [key, value] of searchParams) target.searchParams.set(key, value)

  const res = await fetch(target.toString(), { headers: { Authorization: auth } })
  const data = await res.json().catch(() => ({}))
  return Response.json(data, { status: res.status })
}
