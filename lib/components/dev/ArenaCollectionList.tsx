'use client'

import Link from 'next/link'
import { useArenaCollections } from '@/lib/hooks/useArenaCollections'
import type { CollectionSummary } from '@/lib/models/arena'
import { ROUTES } from '@/lib/constants/routes'
import { Spinner } from '@/lib/components/ui/Spinner'

export function ArenaCollectionList() {
  const { collections, loading, error } = useArenaCollections()

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

  if (collections.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-bg-secondary p-12 text-center">
        <p className="text-text-muted">No collections yet. Spawn a setup to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {collections.map((c) => (
        <CollectionRow key={c.id} collection={c} />
      ))}
    </div>
  )
}

function CollectionRow({ collection: c }: { collection: CollectionSummary }) {
  const date = c.created_at_ms > 0
    ? new Date(c.created_at_ms).toLocaleDateString()
    : ''

  return (
    <Link
      href={ROUTES.arenaCollection(c.id)}
      className="flex items-center gap-4 rounded-xl border border-border bg-bg-secondary px-4 py-3 hover:border-accent/50 hover:bg-bg-elevated transition-all group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
            {c.name}
          </span>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted shrink-0">
            {c.type}
          </span>
          <StatusBadge status={c.status} runningGames={c.progress.running_games} />
        </div>
        <div className="mt-0.5 text-xs text-text-muted">
          {date} · {c.progress.finished_games}/{c.progress.total_games} games
          {c.progress.running_games > 0 && ` · ${c.progress.running_games} in flight`}
        </div>
      </div>
      <span className="text-text-muted group-hover:text-accent transition-colors shrink-0">→</span>
    </Link>
  )
}

function StatusBadge({ status, runningGames }: { status: string; runningGames: number }) {
  if (status === 'finished') {
    return (
      <span className="rounded-full bg-green-500/15 text-green-500 text-[10px] font-semibold px-2 py-0.5 shrink-0">
        done
      </span>
    )
  }
  // "live" only when a game is actually in flight; a collection that is nominally
  // running but has nothing spawned yet (queued behind the concurrency limit) is
  // still pending from the user's perspective.
  if (status === 'running' && runningGames > 0) {
    return (
      <span className="rounded-full bg-green-500/15 text-green-500 text-[10px] font-semibold px-2 py-0.5 shrink-0">
        live
      </span>
    )
  }
  return (
    <span className="rounded-full bg-text-muted/15 text-text-muted text-[10px] font-semibold px-2 py-0.5 shrink-0">
      pending
    </span>
  )
}
