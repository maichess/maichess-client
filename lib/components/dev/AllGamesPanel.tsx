'use client'

import Link from 'next/link'
import { useAllGames, type GamesSource, type GamesStatus } from '@/lib/hooks/useAllGames'
import {
  isBotPlayer,
  playerDisplayName,
  type MatchStatus,
  type MatchSummary,
} from '@/lib/models/match'
import { ROUTES } from '@/lib/constants/routes'
import { Spinner } from '@/lib/components/ui/Spinner'
import { Button } from '@/lib/components/ui/Button'

const STATUS_TABS: { value: GamesStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'ended', label: 'Ended' },
]

const SOURCE_TABS: { value: GamesSource; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'native', label: 'Native' },
  { value: 'external', label: 'External' },
]

export function AllGamesPanel() {
  const {
    filters,
    setFilter,
    reset,
    data,
    loading,
    error,
    page,
    totalPages,
    nextPage,
    prevPage,
    refresh,
    autoRefresh,
    setAutoRefresh,
    canPoll,
  } = useAllGames()

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-bg-secondary p-5">
        <div className="flex flex-wrap items-end gap-4">
          <TextField
            label="Player"
            placeholder="user id (white or black)"
            value={filters.playerId}
            onChange={(v) => setFilter('playerId', v)}
          />
          <TextField
            label="Initiator"
            placeholder="user id (started the game)"
            value={filters.initiatorId}
            onChange={(v) => setFilter('initiatorId', v)}
          />
          <DateField label="From" value={filters.since} onChange={(v) => setFilter('since', v)} />
          <DateField label="To" value={filters.until} onChange={(v) => setFilter('until', v)} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Segmented
            legend="Status"
            options={STATUS_TABS}
            value={filters.status}
            onChange={(v) => setFilter('status', v)}
          />
          <Segmented
            legend="Source"
            options={SOURCE_TABS}
            value={filters.source}
            onChange={(v) => setFilter('source', v)}
          />
          <button
            type="button"
            onClick={() => setFilter('ascending', !filters.ascending)}
            className="rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            {filters.ascending ? 'Oldest first ↑' : 'Newest first ↓'}
          </button>

          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={autoRefresh}
              disabled={!canPoll}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-accent disabled:opacity-40"
            />
            <span className={canPoll ? '' : 'opacity-40'}>Live refresh</span>
          </label>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={refresh}>
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      <p className="text-xs text-text-muted">
        Global chronological feed across every game, with resolved names and initiator attribution.
        For full-text, opening, or position lookups use{' '}
        <Link href={ROUTES.searchDev} className="text-accent hover:underline">
          Search
        </Link>
        .
      </p>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : data.matches.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-secondary p-12 text-center text-text-muted">
          No games match these filters.
        </div>
      ) : (
        <>
          <p className="text-xs text-text-muted">
            {data.total} game{data.total === 1 ? '' : 's'}
          </p>
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-elevated text-left text-xs uppercase tracking-wide text-text-muted">
                  <Th>When</Th>
                  <Th>White</Th>
                  <Th>Black</Th>
                  <Th>Result</Th>
                  <Th>Source</Th>
                  <Th>Initiator</Th>
                </tr>
              </thead>
              <tbody>
                {data.matches.map((m) => (
                  <GameRow key={m.id} match={m} />
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={prevPage} disabled={page <= 1}>
                ← Prev
              </Button>
              <span className="text-sm text-text-muted">
                {page} / {totalPages}
              </span>
              <Button variant="secondary" size="sm" onClick={nextPage} disabled={page >= totalPages}>
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function GameRow({ match }: { match: MatchSummary }) {
  const href = match.status === 'ongoing' ? ROUTES.watchMatch(match.id) : ROUTES.match(match.id)
  const when =
    match.finished_at_ms && match.finished_at_ms > 0
      ? new Date(match.finished_at_ms).toLocaleString()
      : match.last_move_at_ms
        ? new Date(match.last_move_at_ms).toLocaleString()
        : '—'
  const botVsBot = isBotPlayer(match.white) && isBotPlayer(match.black)
  const initiator =
    botVsBot && match.created_by ? playerDisplayName(match.created_by) : ''

  return (
    <tr className="border-t border-border hover:bg-bg-elevated/50 transition-colors">
      <Td>
        <Link href={href} className="text-text-secondary hover:text-accent">
          {when}
        </Link>
      </Td>
      <Td className="font-medium text-text-primary">{playerDisplayName(match.white)}</Td>
      <Td className="font-medium text-text-primary">{playerDisplayName(match.black)}</Td>
      <Td>{resultLabel(match.status)}</Td>
      <Td>
        <SourceTag match={match} botVsBot={botVsBot} />
      </Td>
      <Td className="text-text-muted">{initiator || '—'}</Td>
    </tr>
  )
}

function SourceTag({ match, botVsBot }: { match: MatchSummary; botVsBot: boolean }) {
  if (match.source === 'external') {
    return <Chip className="border-accent/50 text-accent">{match.external_provider || 'external'}</Chip>
  }
  if (botVsBot) {
    return <Chip className="border-border text-text-secondary">arena bot-vs-bot</Chip>
  }
  return <Chip className="border-border text-text-muted">native</Chip>
}

function resultLabel(status: MatchStatus): string {
  if (status === 'white_won') return '1-0'
  if (status === 'black_won') return '0-1'
  if (status === 'draw') return '½-½'
  return 'ongoing'
}

function Segmented<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-text-muted">{legend}</span>
      <div className="flex gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              value === o.value
                ? 'bg-accent text-white'
                : 'bg-bg-elevated text-text-muted hover:text-text-primary'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-muted">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-60 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
      />
    </label>
  )
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-muted">
      {label}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
      />
    </label>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 font-medium">{children}</th>
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2.5 ${className}`}>{children}</td>
}

function Chip({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${className}`}
    >
      {children}
    </span>
  )
}
