'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { useTournaments } from '@/lib/hooks/useTournaments'
import { Spinner } from '@/lib/components/ui/Spinner'
import { Button } from '@/lib/components/ui/Button'
import { TournamentCreateForm } from './TournamentCreateForm'
import type { TournamentInfo } from '@/lib/models/tournament'

function formatClock(clock: { limit: number; increment: number }): string {
  const mins = Math.floor(clock.limit / 60)
  return clock.increment > 0 ? `${mins}+${clock.increment}` : `${mins} min`
}

function TournamentCard({ tournament }: { tournament: TournamentInfo }) {
  return (
    <Link
      href={ROUTES.tournament(tournament.id)}
      className="flex items-center justify-between rounded-xl border border-border bg-bg-secondary px-4 py-3 transition-all hover:border-accent/50"
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-text-primary">
          {tournament.fullName}
        </div>
        <div className="mt-0.5 text-xs text-text-muted">
          {formatClock(tournament.clock)} · {tournament.format} · {tournament.nbRounds} rounds · {tournament.nbPlayers} player{tournament.nbPlayers === 1 ? '' : 's'}
        </div>
      </div>
      <span className="ml-3 text-xs text-accent shrink-0">View →</span>
    </Link>
  )
}

function TournamentSection({ title, tournaments, badge }: { title: string; tournaments: TournamentInfo[]; badge?: string }) {
  if (tournaments.length === 0) return null
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">{title}</h2>
        {badge && (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
            {badge}
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {tournaments.map((t) => (
          <li key={t.id}><TournamentCard tournament={t} /></li>
        ))}
      </ul>
    </div>
  )
}

export function TournamentList() {
  const { data, loading, error, refresh } = useTournaments()
  const [showCreate, setShowCreate] = useState(false)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
        {error}
      </div>
    )
  }

  const totalCount = data.created.length + data.started.length + data.finished.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">
          {totalCount} tournament{totalCount === 1 ? '' : 's'}
        </span>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : 'Create Tournament'}
        </Button>
      </div>

      {showCreate && (
        <TournamentCreateForm
          onCreated={() => {
            setShowCreate(false)
            refresh()
          }}
        />
      )}

      <TournamentSection title="In Progress" tournaments={data.started} badge={data.started.length > 0 ? 'LIVE' : undefined} />
      <TournamentSection title="Waiting to Start" tournaments={data.created} />
      <TournamentSection title="Finished" tournaments={data.finished} />

      {totalCount === 0 && (
        <p className="rounded-xl border border-border bg-bg-secondary p-6 text-center text-text-muted">
          No tournaments yet. Create one to get started.
        </p>
      )}
    </div>
  )
}
