import { getBearerToken } from '@/lib/utils/proxy'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(
    `${process.env.MATCH_MANAGER_URL}/matches/${id}/resign`,
    {
      method: 'POST',
      headers: { Authorization: auth },
    }
  )

  // Resign returns 202 Accepted with no body; the match end arrives over the socket.
  const text = await res.text()
  return new Response(text || null, {
    status: res.status,
    headers: text ? { 'Content-Type': res.headers.get('content-type') ?? 'application/json' } : undefined,
  })
}
