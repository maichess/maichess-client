import { getBearerToken } from '@/lib/utils/proxy'

export async function GET(req: Request) {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const target = new URL(`${process.env.ANALYSIS_SERVICE_URL}/matches`)
  for (const [key, value] of url.searchParams) {
    target.searchParams.set(key, value)
  }

  const res = await fetch(target.toString(), {
    headers: { Authorization: auth },
    cache: 'no-store',
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
