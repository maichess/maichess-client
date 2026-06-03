'use client'

import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import type { TournamentPairing } from '@/lib/models/tournament'

interface Props {
  pairing: TournamentPairing
}

function resultBadge(winner: string | null): string {
  if (winner === null) return 'ongoing'
  if (winner === 'draw') return '½-½'
  return winner === 'white' ? '1-0' : '0-1'
}

export function TournamentGameCard({ pairing }: Props) {
  const matchId = pairing.match_db_id
  const href = matchId ? ROUTES.watchMatch(matchId) : undefined
  const badge = resultBadge(pairing.winner)

  const content = (
    <div className="flex items-center justify-between rounded-xl border border-border bg-bg-secondary px-4 py-3 transition-all hover:border-accent/50">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-text-primary">
          {pairing.white.name}
          <span className="mx-2 text-text-muted">vs</span>
          {pairing.black.name}
        </div>
      </div>
      <div className="ml-3 flex items-center gap-2 shrink-0">
        <span className={[
          'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
          badge === 'ongoing'
            ? 'bg-accent/10 text-accent'
            : 'bg-bg-elevated text-text-muted',
        ].join(' ')}>
          {badge}
        </span>
        {matchId && <span className="text-xs text-accent">Watch →</span>}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
