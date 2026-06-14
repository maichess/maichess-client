'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserMatches, type UserMatchSummary } from '@/lib/hooks/useUserMatches'
import { formatTimeFormatLabel } from '@/lib/utils/time'
import { ROUTES } from '@/lib/constants/routes'
import { Button } from '@/lib/components/ui/Button'
import { Spinner } from '@/lib/components/ui/Spinner'

export function UserMatchList() {
  const router = useRouter()
  const { data, loading, error, totalPages, nextPage, prevPage } = useUserMatches()
  const [importing, setImporting] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  async function handleImport(matchId: string) {
    setImporting(matchId)
    setImportError(null)
    try {
      const res = await fetch(`/api/games/from-match/${matchId}`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Import failed.' }))
        setImportError(body.error ?? 'Import failed.')
        return
      }
      const game: { id: string } = await res.json()
      router.push(ROUTES.analysisGame(game.id))
    } catch {
      setImportError('Network error.')
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
        <p className="text-text-muted">No matches yet. Play a game to fill this list.</p>
      </div>
    )
  }

  return (
    <>
      {importError && (
        <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {importError}
        </div>
      )}

      <div className="space-y-2">
        {data.matches.map((m) => (
          <MatchRow
            key={m.match_id}
            match={m}
            onImport={() => handleImport(m.match_id)}
            importing={importing === m.match_id}
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

function MatchRow({
  match,
  onImport,
  importing,
}: {
  match: UserMatchSummary
  onImport: () => void
  importing: boolean
}) {
  const whiteName = playerLabel(match.white)
  const blackName = playerLabel(match.black)
  const ongoing = match.status === 'ongoing'
  const date = match.finished_at_ms > 0
    ? new Date(match.finished_at_ms).toLocaleDateString()
    : ''
  const meta = [date, `${match.move_count} moves`, formatTimeFormatLabel(match.time_format)]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-bg-secondary px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-text-primary truncate">
            {whiteName} vs {blackName}
          </span>
          {ongoing ? (
            <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
              In progress
            </span>
          ) : (
            <span className="text-xs text-text-muted shrink-0">{resultLabel(match.status)}</span>
          )}
        </div>
        <div className="mt-0.5 text-xs text-text-muted">{meta}</div>
      </div>
      <Button size="sm" onClick={onImport} loading={importing}>
        Analyse
      </Button>
    </div>
  )
}

function playerLabel(p: Record<string, string>): string {
  if (p.user_id && p.username) return p.username
  if (p.bot_id) return p.bot_id
  if (p.user_id) return p.user_id
  return '?'
}

function resultLabel(status: string): string {
  if (status === 'white_won') return '1-0'
  if (status === 'black_won') return '0-1'
  if (status === 'draw') return '½-½'
  return '*'
}
