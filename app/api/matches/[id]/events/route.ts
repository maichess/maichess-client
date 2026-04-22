import { getBearerToken } from '@/lib/utils/proxy'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await getBearerToken()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const upstream = await fetch(
    `${process.env.MATCH_MANAGER_URL}/matches/${id}/events`,
    {
      headers: {
        Authorization: auth,
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    }
  )

  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: 'Stream unavailable' }, { status: upstream.status })
  }

  // Pipe the upstream ReadableStream directly to the browser.
  // The raw SSE text format passes through unchanged.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disables nginx buffering in Docker
    },
  })
}
