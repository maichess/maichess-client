import { getBearerToken } from '@/lib/utils/proxy'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`${process.env.ANALYSIS_SERVICE_URL}/sessions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: auth },
  })

  return new Response(null, { status: res.status })
}
