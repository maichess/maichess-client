import { getBearerToken } from '@/lib/utils/proxy'

export async function GET() {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`${process.env.ANALYSIS_SERVICE_URL}/analysis/config`, {
    headers: { Authorization: auth },
    cache: 'no-store',
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}
