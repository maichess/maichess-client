import { getBearerToken } from '@/lib/utils/proxy'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))

  const res = await fetch(`${process.env.ANTICHEAT_SERVICE_URL}/anticheat/cases/${id}/unflag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify(body),
  })

  // 204 No Content on success; forward status and any error body without assuming JSON.
  const text = await res.text()
  return new Response(text || null, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  })
}
