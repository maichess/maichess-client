import { getBearerToken } from '@/lib/utils/proxy'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(
    `${process.env.MATCH_MANAGER_URL}/matches/${id}/draw-offer/accept`,
    {
      method: 'POST',
      headers: { Authorization: auth },
    }
  )

  const text = await res.text()
  if (!text) return new Response(null, { status: res.status })
  return new Response(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
  })
}
