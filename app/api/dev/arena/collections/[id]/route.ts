import { getBearerToken } from '@/lib/utils/proxy'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const res = await fetch(`${process.env.BOT_ARENA_URL}/collections/${id}`, {
    headers: { Authorization: auth },
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
