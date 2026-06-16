import { getBearerToken } from '@/lib/utils/proxy'

// Shared proxy helpers for the Insights route handlers. Every handler forwards the
// caller's bearer token to maichess-insights-service (INSIGHTS_SERVICE_URL) and
// passes the upstream status straight through. Kept thin: no business logic lives here.

const base = () => process.env.INSIGHTS_SERVICE_URL

// GET, forwarding the inbound query string to the upstream path.
export async function insightsGet(req: Request, path: string): Promise<Response> {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const target = new URL(`${base()}${path}`)
  for (const [key, value] of searchParams) target.searchParams.set(key, value)

  const res = await fetch(target.toString(), {
    headers: { Authorization: auth },
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  return Response.json(data, { status: res.status })
}

// POST a JSON body verbatim (ingestions / analyses).
export async function insightsPostJson(req: Request, path: string): Promise<Response> {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.text()
  const res = await fetch(`${base()}${path}`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body,
  })
  const data = await res.json().catch(() => ({}))
  return Response.json(data, { status: res.status })
}

// POST a multipart form verbatim (PGN upload). Re-sending the parsed FormData lets
// fetch set a fresh boundary; the file part is preserved.
export async function insightsPostForm(req: Request, path: string): Promise<Response> {
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const res = await fetch(`${base()}${path}`, {
    method: 'POST',
    headers: { Authorization: auth },
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  return Response.json(data, { status: res.status })
}
