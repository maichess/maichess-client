import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import type { Match } from '@/lib/models/match'
import { WatchBootstrap } from '@/lib/components/WatchBootstrap'

type Props = { params: Promise<{ id: string }> }

// A single SSR read: if the match is already materialised the board renders
// immediately. Match creation is asynchronous (a bot-vs-bot game emits MatchCreated
// to Kafka and the read model materialises a moment later), so a brand-new match
// may not exist yet — rather than 404-ing the spectator away, we hand off to
// WatchBootstrap, which polls until it appears.
async function fetchMatch(id: string, cookieHeader: string): Promise<Match | null> {
  const res = await fetch(`${process.env.MATCH_MANAGER_URL}/matches/${id}`, {
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json() as Promise<Match>
}

export default async function WatchMatchPage({ params }: Props) {
  const { id } = await params
  const cookieStore = await cookies()
  if (!cookieStore.has('access_token')) redirect(ROUTES.login)

  const match = await fetchMatch(id, cookieStore.toString())

  return <WatchBootstrap id={id} initialMatch={match} />
}
