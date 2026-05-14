import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import type { MatchListResponse, MatchSummary, TimeFormatCategory } from '@/lib/models/match'
import { isUserPlayer, playerDisplayName } from '@/lib/models/match'
import { formatTimeFormatLabel } from '@/lib/utils/time'

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
  if (!cookieStore.has('access_token')) redirect(ROUTES.login)

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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Watch</h1>
        <div className="text-sm text-text-muted">
          {total} ongoing game{total === 1 ? '' : 's'}
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        <CategoryFilter active={validCategory === undefined} href={ROUTES.watch} label="All" />
        {(['bullet', 'blitz', 'rapid', 'classical'] as TimeFormatCategory[]).map((c) => (
          <CategoryFilter
            key={c}
            active={validCategory === c}
            href={`${ROUTES.watch}?category=${c}`}
            label={c[0].toUpperCase() + c.slice(1)}
          />
        ))}
      </div>

      {matches.length === 0 ? (
        <p className="rounded-xl border border-border bg-bg-secondary p-6 text-center text-text-muted">
          No ongoing games right now. Check back in a moment.
        </p>
      ) : (
        <ul className="space-y-2">
          {matches.map((m) => (
            <li key={m.id}>
              <Link
                href={ROUTES.watchMatch(m.id)}
                className="flex items-center justify-between rounded-xl border border-border bg-bg-secondary px-4 py-3 transition-all hover:border-accent/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-text-primary">
                    {playerDisplayName(m.white)}
                    {!isUserPlayer(m.white) && <span className="ml-1 text-xs text-text-muted">(BOT)</span>}
                    <span className="mx-2 text-text-muted">vs</span>
                    {playerDisplayName(m.black)}
                    {!isUserPlayer(m.black) && <span className="ml-1 text-xs text-text-muted">(BOT)</span>}
                  </div>
                  <div className="mt-0.5 text-xs text-text-muted">
                    {formatTimeFormatLabel(m.time_format)} · {m.move_count} move{m.move_count === 1 ? '' : 's'}
                  </div>
                </div>
                <span className="ml-3 text-xs text-accent">Watch →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex justify-between">
        {page > 1 ? (
          <Link
            href={`${ROUTES.watch}?${pageQuery(page - 1, validCategory)}`}
            className="text-sm text-accent hover:underline"
          >
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        {hasMore && (
          <Link
            href={`${ROUTES.watch}?${pageQuery(page + 1, validCategory)}`}
            className="text-sm text-accent hover:underline"
          >
            Next →
          </Link>
        )}
      </div>
    </div>
  )
}

function pageQuery(page: number, category: TimeFormatCategory | undefined): string {
  const params = new URLSearchParams({ page: String(page) })
  if (category) params.set('category', category)
  return params.toString()
}

function CategoryFilter({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <Link
      href={href}
      className={[
        'rounded-full border px-3 py-1 text-xs font-medium transition-all',
        active
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border bg-bg-secondary text-text-muted hover:border-accent/40',
      ].join(' ')}
    >
      {label}
    </Link>
  )
}
