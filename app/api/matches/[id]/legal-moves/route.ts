import { getBearerToken } from '@/lib/utils/proxy'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const query = from ? `?from=${from}` : ''

  const res = await fetch(
    `${process.env.MATCH_MANAGER_URL}/matches/${id}/legal-moves${query}`,
    { headers: { Authorization: auth }, cache: 'no-store' }
  )

  const data = await res.json()
  return Response.json(data, { status: res.status })
}
