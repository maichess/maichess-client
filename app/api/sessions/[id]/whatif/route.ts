import { getBearerToken } from '@/lib/utils/proxy'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const res = await fetch(`${process.env.ANALYSIS_SERVICE_URL}/sessions/${id}/whatif`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`${process.env.ANALYSIS_SERVICE_URL}/sessions/${id}/whatif`, {
    method: 'DELETE',
    headers: { Authorization: auth },
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}
