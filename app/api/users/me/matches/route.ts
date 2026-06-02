import { cookies } from 'next/headers'
import { getBearerToken } from '@/lib/utils/proxy'

// Past Matches proxy. Match Manager scopes its history endpoint by user id in
// the path, so resolve the authenticated user first, then forward the paged
// query to match-manager's GET /users/{id}/matches.
export async function GET(req: Request) {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const cookieStore = await cookies()
  const meRes = await fetch(`${process.env.USER_SERVICE_URL}/users/me`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  })
  if (!meRes.ok) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const me = (await meRes.json()) as { id: string }

  const url = new URL(req.url)
  const target = new URL(`${process.env.MATCH_MANAGER_URL}/users/${me.id}/matches`)
  for (const [key, value] of url.searchParams) {
    target.searchParams.set(key, value)
  }

  const res = await fetch(target.toString(), {
    headers: { Authorization: auth },
    cache: 'no-store',
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
