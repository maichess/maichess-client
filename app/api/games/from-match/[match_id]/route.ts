import { getBearerToken } from '@/lib/utils/proxy'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ match_id: string }> }
) {
  const { match_id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`${process.env.ANALYSIS_SERVICE_URL}/games/from-match/${match_id}`, {
    method: 'POST',
    headers: { Authorization: auth },
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}
