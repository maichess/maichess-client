import { getBearerToken } from '@/lib/utils/proxy'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`${process.env.MATCH_MAKER_URL}/queue/${token}`, {
    method: 'DELETE',
    headers: { Authorization: auth },
  })

  return new Response(null, { status: res.status })
}
