export async function GET() {
  const res = await fetch(`${process.env.MATCH_MAKER_URL}/bots`)
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
