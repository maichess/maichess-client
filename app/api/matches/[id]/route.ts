import { getBearerToken } from '@/lib/utils/proxy'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`${process.env.MATCH_MANAGER_URL}/matches/${id}`, {
    headers: { Authorization: auth },
    cache: 'no-store',
  })

  // A not-yet-materialised match (404) has an empty body; don't try to parse it.
  // Propagate the status faithfully so the client can tell "still being created"
  // (404, keep polling) apart from a real failure.
  if (!res.ok) return new Response(null, { status: res.status })

  const data = await res.json()
  return Response.json(data, { status: 200 })
}
