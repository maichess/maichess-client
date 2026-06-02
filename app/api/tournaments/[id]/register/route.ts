import { cookies } from 'next/headers'

const BRIDGE = process.env.TOURNAMENT_BRIDGE_URL!

type Ctx = { params: Promise<{ id: string }> }

export async function POST(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const cookieStore = await cookies()
  const body = await request.json()
  const res = await fetch(`${BRIDGE}/tournaments/${id}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieStore.toString(),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const cookieStore = await cookies()
  const res = await fetch(`${BRIDGE}/tournaments/${id}/register`, {
    method: 'DELETE',
    headers: { Cookie: cookieStore.toString() },
  })
  if (res.status === 204) return new Response(null, { status: 204 })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
