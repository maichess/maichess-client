import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MatchBootstrap } from '@/lib/components/MatchBootstrap'
import type { Match } from '@/lib/models/match'
import { ROUTES } from '@/lib/constants/routes'
import { getViewerUserId } from '@/lib/utils/viewer'

// A single SSR read: if the match is already materialised the board renders
// immediately. Match creation is asynchronous, so a brand-new match may not exist
// yet — rather than redirecting the player away, we hand off to MatchBootstrap,
// which polls until it appears (optimistic UI + socket/poll confirmation).
async function getMatch(id: string, token: string): Promise<Match | null> {
  const res = await fetch(`${process.env.MATCH_MANAGER_URL}/matches/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
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
  const viewerUserId = getViewerUserId(token)

  return <MatchBootstrap id={id} initialMatch={match} viewerUserId={viewerUserId} />
}
