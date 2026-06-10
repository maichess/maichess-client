import { getBearerToken } from '@/lib/utils/proxy'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const res = await fetch(`${process.env.MATCH_MANAGER_URL}/matches/${id}/moves`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth,
    },
    body: JSON.stringify(body),
  })

  // The move command returns 202 Accepted with no body; the authoritative result
  // arrives over the socket. Forward the status and any (error) body without
  // assuming JSON is present.
  const text = await res.text()
  return new Response(text || null, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  })
}
