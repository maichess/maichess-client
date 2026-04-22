export async function POST(req: Request) {
  const body = await req.json()

  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  const response = Response.json(data, { status: res.status })

  res.headers.getSetCookie().forEach((cookie) => {
    response.headers.append('Set-Cookie', cookie)
  })

  return response
}
