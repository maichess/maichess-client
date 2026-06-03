'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMatchHistory } from '@/lib/hooks/useMatchHistory'
import { playerDisplayName, type MatchStatus, type MatchSummary } from '@/lib/models/match'
import { formatTimeFormatLabel } from '@/lib/utils/time'
import { ROUTES } from '@/lib/constants/routes'
import { Button } from '@/lib/components/ui/Button'
import { Spinner } from '@/lib/components/ui/Spinner'

export function MatchHistory() {
  const { data, loading, error, totalPages, nextPage, prevPage } = useMatchHistory()
  const router = useRouter()
  const [importing, setImporting] = useState<string | null>(null)
  const [analyseError, setAnalyseError] = useState<string | null>(null)

  async function handleAnalyse(matchId: string) {
    setImporting(matchId)
    setAnalyseError(null)
    try {
      const res = await fetch(`/api/games/from-match/${matchId}`, { method: 'POST' })
      if (!res.ok) {
        setAnalyseError(
          res.status === 403
            ? "You can only analyse games you played in or started."
            : "Couldn't open this game for analysis. Please try again.",
        )
        return
      }
      const game: { id: string } = await res.json()
      router.push(ROUTES.analysisGame(game.id))
    } catch {
      setAnalyseError('Network error. Please try again.')
    } finally {
      setImporting(null)
    }
  }

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

  if (data.matches.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-bg-secondary p-12 text-center">
        <p className="text-text-muted">No past matches yet. Play a game to fill this list.</p>
      </div>
    )
  }

  return (
    <>
      {analyseError && (
        <div className="mb-3 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {analyseError}
        </div>
      )}
      <div className="space-y-2">
        {data.matches.map((m) => (
          <MatchHistoryRow
            key={m.id}
            match={m}
            onAnalyse={() => handleAnalyse(m.id)}
            importing={importing === m.id}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" onClick={prevPage} disabled={data.page <= 1}>
            ← Prev
          </Button>
          <span className="text-sm text-text-muted">
            {data.page} / {totalPages}
          </span>
          <Button variant="secondary" size="sm" onClick={nextPage} disabled={data.page >= totalPages}>
            Next →
          </Button>
        </div>
      )}
    </>
  )
}

function MatchHistoryRow({
  match,
  onAnalyse,
  importing,
}: {
  match: MatchSummary
  onAnalyse: () => void
  importing: boolean
}) {
  const date =
    match.finished_at_ms && match.finished_at_ms > 0
      ? new Date(match.finished_at_ms).toLocaleDateString()
      : ''

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-bg-secondary px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-text-primary truncate">
            {playerDisplayName(match.white)} vs {playerDisplayName(match.black)}
          </span>
          <span className="text-xs text-text-muted shrink-0">{resultLabel(match.status)}</span>
          {match.source === 'external' && (
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted shrink-0">
              {match.external_provider || 'external'}
            </span>
          )}
        </div>
        <div className="mt-0.5 text-xs text-text-muted">
          {[date, `${match.move_count} moves`, formatTimeFormatLabel(match.time_format)]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>
      <Button size="sm" variant="secondary" onClick={onAnalyse} loading={importing}>
        Analyse
      </Button>
    </div>
  )
}

function resultLabel(status: MatchStatus): string {
  if (status === 'white_won') return '1-0'
  if (status === 'black_won') return '0-1'
  if (status === 'draw') return '½-½'
  return '*'
}
