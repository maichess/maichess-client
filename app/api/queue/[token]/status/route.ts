import { getBearerToken } from '@/lib/utils/proxy'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(
    `${process.env.MATCH_MAKER_URL}/queue/${token}/status`,
    { headers: { Authorization: auth }, cache: 'no-store' }
  )

  const data = await res.json()
  return Response.json(data, { status: res.status })
}
