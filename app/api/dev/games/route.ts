import { getBearerToken } from '@/lib/utils/proxy'

// Dev "All games" browser proxy → match-manager GET /matches/search. Forwards the
// filter query params (player_id, initiator_id, status, source, since_ms, until_ms,
// ascending, page, page_size) with bearer auth. The Dev UI is dev_mode-gated by the
// page guard; this proxy is the server-side gate for the cross-user browse.
export async function GET(req: Request) {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const target = new URL(`${process.env.MATCH_MANAGER_URL}/matches/search`)
  for (const [key, value] of searchParams) target.searchParams.set(key, value)

  const res = await fetch(target.toString(), {
    headers: { Authorization: auth },
    cache: 'no-store',
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
