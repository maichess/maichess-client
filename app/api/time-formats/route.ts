export async function GET() {
  const res = await fetch(`${process.env.MATCH_MAKER_URL}/time-formats`, {
    cache: 'force-cache',
    next: { revalidate: 3600 },
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
