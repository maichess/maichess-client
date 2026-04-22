import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MatchClient } from '@/lib/components/MatchClient'
import type { Match } from '@/lib/models/match'
import { ROUTES } from '@/lib/constants/routes'

async function getMatch(id: string, token: string): Promise<Match | null> {
  const res = await fetch(`${process.env.MATCH_MANAGER_URL}/matches/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

function getViewerUserId(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub ?? payload.user_id ?? null
  } catch {
    return null
  }
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) redirect(ROUTES.login)

  const match = await getMatch(id, token)
  if (!match) redirect(ROUTES.dashboard)

  const viewerUserId = getViewerUserId(token)

  return <MatchClient initialMatch={match} viewerUserId={viewerUserId} />
}
