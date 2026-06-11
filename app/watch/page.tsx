import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import type { MatchListResponse, MatchSummary, TimeFormatCategory } from '@/lib/models/match'
import { WatchPageShell } from '@/lib/components/WatchPageShell'
import { getViewerUserId } from '@/lib/utils/viewer'

type Props = {
  searchParams: Promise<{ page?: string; category?: string }>
}

async function listOngoingMatches(
  cookieHeader: string,
  page: number,
  category: string | undefined,
): Promise<MatchListResponse | null> {
  const params = new URLSearchParams({
    status: 'ongoing',
    page: String(page),
    page_size: '20',
  })
  if (category) params.set('category', category)

  const res = await fetch(`${process.env.MATCH_MANAGER_URL}/matches?${params.toString()}`, {
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json() as Promise<MatchListResponse>
}

export default async function WatchPage({ searchParams }: Props) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect(ROUTES.login)
  const viewerUserId = getViewerUserId(token)

  const { page: pageParam, category } = await searchParams
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1)
  const validCategory = (['bullet', 'blitz', 'rapid', 'classical'] as TimeFormatCategory[]).includes(
    category as TimeFormatCategory,
  )
    ? (category as TimeFormatCategory)
    : undefined

  const data = await listOngoingMatches(cookieStore.toString(), page, validCategory)
  const matches: MatchSummary[] = data?.matches ?? []
  const total = data?.total ?? 0
  const pageSize = data?.page_size ?? 20
  const hasMore = page * pageSize < total

  return (
    <WatchPageShell
      matches={matches}
      total={total}
      page={page}
      hasMore={hasMore}
      validCategory={validCategory}
      viewerUserId={viewerUserId}
    />
  )
}
