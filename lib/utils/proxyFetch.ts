import { cookies } from 'next/headers'

const BRIDGE = process.env.TOURNAMENT_BRIDGE_URL!

export async function bridgeFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieStore = await cookies()
  const res = await fetch(`${BRIDGE}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Cookie: cookieStore.toString(),
    },
    cache: 'no-store',
  })
  return proxyResponse(res)
}

async function proxyResponse(res: Response): Promise<Response> {
  const text = await res.text()
  if (!text) {
    return new Response(JSON.stringify({ error: res.statusText || 'Unknown error' }), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  try {
    const json = JSON.parse(text)
    return Response.json(json, { status: res.status })
  } catch {
    return new Response(JSON.stringify({ error: text }), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
