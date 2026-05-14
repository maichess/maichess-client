import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import type { Match } from '@/lib/models/match'
import { WatchClient } from '@/lib/components/WatchClient'

type Props = { params: Promise<{ id: string }> }

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
  if (!match) notFound()

  return <WatchClient initialMatch={match} />
}
