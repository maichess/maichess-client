import { getBearerToken } from '@/lib/utils/proxy'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`${process.env.ANTICHEAT_SERVICE_URL}/anticheat/cases/${id}`, {
    headers: { Authorization: auth },
  })
  const data = await res.json().catch(() => ({}))
  return Response.json(data, { status: res.status })
}
