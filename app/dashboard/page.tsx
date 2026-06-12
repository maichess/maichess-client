import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Swords, Bot, Tv, BarChart2, Play } from 'lucide-react'
import type { User } from '@/lib/models/user'
import type { MatchListResponse, MatchSummary } from '@/lib/models/match'
import { playerDisplayName, isUserPlayer } from '@/lib/models/match'
import { formatTimeFormatLabel } from '@/lib/utils/time'
import { ROUTES } from '@/lib/constants/routes'

async function getUser(cookieHeader: string): Promise<User | null> {
  const res = await fetch(`${process.env.USER_SERVICE_URL}/users/me`, {
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

async function getOngoingMatches(userId: string, cookieHeader: string): Promise<MatchSummary[]> {
  const params = new URLSearchParams({ status: 'ongoing', page: '1', page_size: '10' })
  const res = await fetch(
    `${process.env.MATCH_MANAGER_URL}/users/${userId}/matches?${params.toString()}`,
    { headers: { Cookie: cookieHeader }, cache: 'no-store' },
  )
  if (!res.ok) return []
  const data = (await res.json()) as MatchListResponse
  // "Continue playing" should only surface games the user is actually playing,
  // not ones they merely initiated (e.g. spawned bot-vs-bot arena games where the
  // user is the creator but not a participant).
  return (data.matches ?? []).filter(
    (m) =>
      (isUserPlayer(m.white) && m.white.user_id === userId) ||
      (isUserPlayer(m.black) && m.black.user_id === userId),
  )
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  const hasToken = cookieStore.has('access_token')
  const user = await getUser(cookieHeader)

  if (!user) {
    // Stale token: cookie exists but the user service rejected it.
    // Redirect via the logout endpoint to clear the cookie first, otherwise
    // the proxy middleware will immediately redirect /login back to /dashboard.
    if (hasToken) redirect('/api/auth/logout')
    redirect(ROUTES.login)
  }

  const ongoingMatches = await getOngoingMatches(user.id, cookieHeader)

  const total = user.wins + user.losses + user.draws
  const winRate = total > 0 ? Math.round((user.wins / total) * 100) : 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Welcome back, <span className="text-accent">{user.username}</span>
        </h1>
        <p className="mt-1 text-text-muted">Ready to play?</p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="ELO" value={user.elo} highlight />
        <StatCard label="Wins" value={user.wins} />
        <StatCard label="Losses" value={user.losses} />
        <StatCard label="Win rate" value={`${winRate}%`} />
      </div>

      {/* Continue playing — resume games still in progress */}
      {ongoingMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-text-primary">Continue playing</h2>
          <ul className="space-y-2">
            {ongoingMatches.map((m) => (
              <li key={m.id}>
                <Link
                  href={ROUTES.match(m.id)}
                  className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 transition-all hover:border-accent/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text-primary">
                      {playerDisplayName(m.white)}
                      <span className="mx-2 text-text-muted">vs</span>
                      {playerDisplayName(m.black)}
                    </div>
                    <div className="mt-0.5 text-xs text-text-muted">
                      {formatTimeFormatLabel(m.time_format)} · {m.move_count} move{m.move_count === 1 ? '' : 's'}
                    </div>
                  </div>
                  <span className="ml-3 flex items-center gap-1 text-xs font-medium text-accent">
                    <Play size={13} /> Resume
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Play section */}
      <div className="rounded-2xl border border-border bg-bg-secondary p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Play a game</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <PlayOption
            href={ROUTES.play}
            title="Find opponent"
            description="Enter matchmaking queue and play against another human"
            icon={<Swords size={24} />}
          />
          <PlayOption
            href={`${ROUTES.play}?opponent=bot`}
            title="Play vs bot"
            description="Challenge a computer opponent of your choice"
            icon={<Bot size={24} />}
          />
          <PlayOption
            href={ROUTES.watch}
            title="Watch"
            description="Watch live matches as they happen"
            icon={<Tv size={24} />}
          />
          <PlayOption
            href={ROUTES.analysis}
            title="Analyse"
            description="Import and analyse games with engine assistance"
            icon={<BarChart2 size={24} />}
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-4">
      <div className={`text-2xl font-bold tabular-nums ${highlight ? 'text-accent' : 'text-text-primary'}`}>
        {value}
      </div>
      <div className="mt-0.5 text-xs text-text-muted uppercase tracking-wide">{label}</div>
    </div>
  )
}

function PlayOption({
  href,
  title,
  description,
  icon,
}: {
  href: string
  title: string
  description: string
  icon: ReactNode
}) {
  return (
    <Link
      href={href}
      className={[
        'flex items-start gap-3 rounded-xl border border-border bg-bg-elevated px-4 py-4',
        'hover:border-accent/50 hover:bg-bg-elevated/80 transition-all duration-150 group',
      ].join(' ')}
    >
      <span className="mt-0.5 text-text-muted group-hover:text-accent transition-colors">{icon}</span>
      <div>
        <div className="font-semibold text-text-primary group-hover:text-accent transition-colors">
          {title}
        </div>
        <div className="mt-0.5 text-sm text-text-muted">{description}</div>
      </div>
    </Link>
  )
}
