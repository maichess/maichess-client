'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AnalysisGame } from '@/lib/models/analysis'
import { playerInfoName } from '@/lib/models/analysis'
import { ROUTES } from '@/lib/constants/routes'
import { Button } from '@/lib/components/ui/Button'
import { Spinner } from '@/lib/components/ui/Spinner'
import { ImportModal } from './ImportModal'
import { useGameLibrary } from '@/lib/hooks/useGameLibrary'

interface GameLibraryProps {
  initialGames: AnalysisGame[]
  initialTotal: number
  pageSize: number
  /** When embedded the parent renders the page header & import button. */
  embedded?: boolean
  /** Controlled import modal flag (used when embedded). */
  showImport?: boolean
  /** Called when the embedded modal closes. */
  onImportClose?: () => void
}

export function GameLibrary({
  initialGames,
  initialTotal,
  pageSize,
  embedded = false,
  showImport: showImportProp,
  onImportClose,
}: GameLibraryProps) {
  const [internalShowImport, setInternalShowImport] = useState(false)
  const showImport = embedded ? !!showImportProp : internalShowImport
  const setShowImport = (v: boolean) => {
    if (embedded) {
      if (!v) onImportClose?.()
    } else {
      setInternalShowImport(v)
    }
  }

  const { data, loading, error, nextPage, prevPage, totalPages, refresh } = useGameLibrary({
    games: initialGames,
    total: initialTotal,
    page: 1,
    page_size: pageSize,
  })

  useEffect(() => {
    if (embedded && !showImport) {
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showImport, embedded])

  function handleImportClose() {
    setShowImport(false)
    if (!embedded) refresh()
  }

  const body = (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : data.games.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-secondary p-12 text-center">
          <p className="text-text-muted">No games yet. Import a game to start analysing.</p>
          {!embedded && (
            <Button className="mt-4" onClick={() => setShowImport(true)}>
              Import game
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.games.map((game) => (
              <GameRow key={game.id} game={game} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={prevPage}
                disabled={data.page <= 1}
              >
                ← Prev
              </Button>
              <span className="text-sm text-text-muted">
                {data.page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={nextPage}
                disabled={data.page >= totalPages}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}

      {showImport && <ImportModal onClose={handleImportClose} />}
    </>
  )

  if (embedded) return body

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analysis</h1>
          <p className="mt-0.5 text-sm text-text-muted">Import and analyse chess games</p>
        </div>
        <Button onClick={() => setShowImport(true)}>
          Import game
        </Button>
      </div>
      {body}
    </div>
  )
}

function GameRow({ game }: { game: AnalysisGame }) {
  const white = playerInfoName(game.white)
  const black = playerInfoName(game.black)
  const date = game.tags['Date'] ?? new Date(game.created_at).toLocaleDateString()

  return (
    <Link
      href={ROUTES.analysisGame(game.id)}
      className="flex items-center gap-4 rounded-xl border border-border bg-bg-secondary px-4 py-3 hover:border-accent/50 hover:bg-bg-elevated transition-all group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
            {white} vs {black}
          </span>
          <span className="text-xs text-text-muted shrink-0">{game.result}</span>
        </div>
        <div className="mt-0.5 text-xs text-text-muted">
          {date} · {game.move_count} moves · {sourceLabel(game.source)}
        </div>
      </div>
      <span className="text-text-muted group-hover:text-accent transition-colors shrink-0">→</span>
    </Link>
  )
}

function sourceLabel(source: AnalysisGame['source']): string {
  if (source === 'pgn') return 'PGN import'
  if (source === 'match') return 'From match'
  return 'FEN position'
}
