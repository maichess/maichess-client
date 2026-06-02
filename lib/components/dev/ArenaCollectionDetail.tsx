'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useArenaCollection } from '@/lib/hooks/useArenaCollection'
import { useBots } from '@/lib/hooks/useBots'
import type {
  ArenaGameResult,
  BracketResult,
  Collection,
  MatrixResult,
  SingleSeriesResult,
} from '@/lib/models/arena'
import { ROUTES } from '@/lib/constants/routes'
import { Spinner } from '@/lib/components/ui/Spinner'

export function ArenaCollectionDetail({ id }: { id: string }) {
  const { collection, loading, error } = useArenaCollection(id)
  const { bots } = useBots()

  const botName = useMemo(() => {
    const map: Record<string, string> = {}
    for (const b of bots) map[b.id] = b.name
    return (id: string) => map[id] ?? id
  }, [bots])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
        {error ?? 'Collection not found.'}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={ROUTES.arenaList} className="text-xs text-text-muted hover:text-accent">
          ← Back to collections
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">{collection.name}</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-text-muted">
          <span className="uppercase text-xs font-medium">{collection.type}</span>
          <span>·</span>
          <CollectionStatusLabel status={collection.status} />
          <span>·</span>
          <span>
            {collection.progress.finished_games}/{collection.progress.total_games} games
          </span>
          {collection.progress.running_games > 0 && (
            <>
              <span>·</span>
              <span>{collection.progress.running_games} in flight</span>
            </>
          )}
        </div>
      </div>

      {collection.progress.running_games > 0 || collection.progress.pending_games > 0 ? (
        <ProgressBar collection={collection} />
      ) : null}

      {collection.result?.bracket && (
        <BracketView result={collection.result.bracket} botName={botName} />
      )}
      {collection.result?.matrix_table && (
        <MatrixView result={collection.result.matrix_table} botName={botName} />
      )}
      {collection.result?.single_series && (
        <SingleSeriesView result={collection.result.single_series} botName={botName} />
      )}

      {!collection.result && collection.status !== 'finished' && (
        <div className="rounded-2xl border border-border bg-bg-secondary p-8 text-center">
          <Spinner size="lg" className="mx-auto mb-3" />
          <p className="text-text-muted">Games are being scheduled and played…</p>
        </div>
      )}
    </div>
  )
}

function CollectionStatusLabel({ status }: { status: string }) {
  if (status === 'finished') return <span className="text-green-500 font-medium">Finished</span>
  if (status === 'running') return <span className="text-amber-400 font-medium">Running</span>
  return <span className="text-text-muted font-medium">Pending</span>
}

function ProgressBar({ collection }: { collection: Collection }) {
  const { finished_games, total_games } = collection.progress
  const pct = total_games > 0 ? (finished_games / total_games) * 100 : 0

  return (
    <div>
      <div className="flex justify-between text-xs text-text-muted mb-1">
        <span>{Math.round(pct)}% complete</span>
        <span>{finished_games}/{total_games}</span>
      </div>
      <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function BracketView({
  result,
  botName,
}: {
  result: BracketResult
  botName: (id: string) => string
}) {
  return (
    <div className="flex flex-col gap-6">
      {result.winner_bot_id && (
        <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent font-semibold">
          Winner: {botName(result.winner_bot_id)}
        </div>
      )}
      <div className="flex gap-8 overflow-x-auto pb-2">
        {result.rounds.map((round) => (
          <div key={round.round_number} className="flex flex-col gap-3 min-w-48">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Round {round.round_number}
            </h3>
            {round.pairings.map((p, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-bg-secondary p-3 text-sm"
              >
                {p.bye ? (
                  <div className="text-text-muted italic">
                    {botName(p.bot_a_id)} — bye
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span
                        className={
                          p.winner_bot_id === p.bot_a_id
                            ? 'font-semibold text-accent'
                            : 'text-text-primary'
                        }
                      >
                        {botName(p.bot_a_id)}
                      </span>
                      <span className="tabular-nums text-text-muted">{p.bot_a_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className={
                          p.winner_bot_id === p.bot_b_id
                            ? 'font-semibold text-accent'
                            : 'text-text-primary'
                        }
                      >
                        {botName(p.bot_b_id)}
                      </span>
                      <span className="tabular-nums text-text-muted">{p.bot_b_score}</span>
                    </div>
                    {p.games.length > 0 && (
                      <div className="mt-2 border-t border-border pt-2 space-y-1">
                        {p.games.map((g) => (
                          <GameLink key={g.match_id} game={g} botName={botName} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function MatrixView({
  result,
  botName,
}: {
  result: MatrixResult
  botName: (id: string) => string
}) {
  const cellMap = useMemo(() => {
    const m: Record<string, { a: number; b: number }> = {}
    for (const c of result.cells) {
      m[`${c.bot_a_id}:${c.bot_b_id}`] = { a: c.bot_a_score, b: c.bot_b_score }
    }
    return m
  }, [result.cells])

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted" />
            {result.bot_ids.map((id) => (
              <th key={id} className="px-3 py-2 text-center text-xs font-semibold text-text-secondary">
                {botName(id)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.bot_ids.map((rowId) => (
            <tr key={rowId}>
              <td className="px-3 py-2 text-sm font-medium text-text-primary whitespace-nowrap">
                {botName(rowId)}
              </td>
              {result.bot_ids.map((colId) => {
                if (rowId === colId) {
                  return (
                    <td key={colId} className="px-3 py-2 text-center text-text-muted">
                      —
                    </td>
                  )
                }
                const cell =
                  cellMap[`${rowId}:${colId}`] ??
                  (cellMap[`${colId}:${rowId}`]
                    ? { a: cellMap[`${colId}:${rowId}`].b, b: cellMap[`${colId}:${rowId}`].a }
                    : null)

                return (
                  <td key={colId} className="px-3 py-2 text-center tabular-nums">
                    {cell ? (
                      <span className={cell.a > cell.b ? 'text-accent font-semibold' : 'text-text-primary'}>
                        {cell.a} - {cell.b}
                      </span>
                    ) : (
                      <span className="text-text-muted">…</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {result.games.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            All games
          </h3>
          <div className="space-y-1">
            {result.games.map((g) => (
              <GameLink key={g.match_id} game={g} botName={botName} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SingleSeriesView({
  result,
  botName,
}: {
  result: SingleSeriesResult
  botName: (id: string) => string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-bg-secondary p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-text-primary">{botName(result.bot_a_id)}</span>
          <span className="text-lg font-bold tabular-nums text-text-primary">
            {result.bot_a_score} – {result.bot_b_score}
          </span>
          <span className="font-semibold text-text-primary">{botName(result.bot_b_id)}</span>
        </div>
      </div>

      <div className="space-y-1">
        {result.games.map((g) => (
          <GameLink key={g.match_id} game={g} botName={botName} />
        ))}
      </div>
    </div>
  )
}

function GameLink({
  game,
  botName,
}: {
  game: ArenaGameResult
  botName: (id: string) => string
}) {
  const isLive = game.result === 'ongoing'
  const resultStr =
    game.result === 'white_won'
      ? '1-0'
      : game.result === 'black_won'
        ? '0-1'
        : game.result === 'draw'
          ? '½-½'
          : '…'

  const label = game.fen_label || 'Standard'

  return (
    <Link
      href={isLive ? ROUTES.watchMatch(game.match_id) : ROUTES.watchMatch(game.match_id)}
      className="flex items-center gap-3 rounded-lg border border-border bg-bg-secondary px-3 py-2 text-xs hover:border-accent/50 hover:bg-bg-elevated transition-all group"
    >
      <span className="text-text-muted shrink-0 w-24 truncate" title={label}>
        {label}
      </span>
      <span className="text-text-primary truncate">
        {botName(game.white_bot_id)} vs {botName(game.black_bot_id)}
      </span>
      <span className="ml-auto shrink-0 tabular-nums text-text-muted">{resultStr}</span>
      {isLive && (
        <span className="rounded-full bg-green-500/15 text-green-500 text-[10px] font-semibold px-1.5 py-0.5 shrink-0">
          live
        </span>
      )}
    </Link>
  )
}
