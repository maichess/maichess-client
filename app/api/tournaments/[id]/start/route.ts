import { cookies } from 'next/headers'

const BRIDGE = process.env.TOURNAMENT_BRIDGE_URL!

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const cookieStore = await cookies()
  const res = await fetch(`${BRIDGE}/tournaments/${id}/start`, {
    method: 'POST',
    headers: { Cookie: cookieStore.toString() },
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
