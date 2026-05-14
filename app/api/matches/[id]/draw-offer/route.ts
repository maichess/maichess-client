import { getBearerToken } from '@/lib/utils/proxy'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(
    `${process.env.MATCH_MANAGER_URL}/matches/${id}/draw-offer`,
    {
      method: 'POST',
      headers: { Authorization: auth },
    }
  )

  if (res.status === 200) return new Response(null, { status: 200 })
  const text = await res.text()
  return new Response(text || null, {
    status: res.status,
    headers: text ? { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' } : undefined,
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(
    `${process.env.MATCH_MANAGER_URL}/matches/${id}/draw-offer`,
    {
      method: 'DELETE',
      headers: { Authorization: auth },
    }
  )

  if (res.status === 200) return new Response(null, { status: 200 })
  const text = await res.text()
  return new Response(text || null, {
    status: res.status,
    headers: text ? { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' } : undefined,
  })
}
