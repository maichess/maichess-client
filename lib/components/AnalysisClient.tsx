'use client'

import { useCallback, useMemo, useState } from 'react'
import type { AnalysisConfig, AnalysisGameDetail } from '@/lib/models/analysis'
import { useAnalysisSession } from '@/lib/hooks/useAnalysisSession'
import { useAnalysisBoardInput } from '@/lib/hooks/useAnalysisBoardInput'
import { buildAnalysisArrows } from '@/lib/utils/analysisArrows'
import { ChessBoard } from './ChessBoard'
import { AnalysisPanel } from './analysis/AnalysisPanel'
import { AnalysisMoveList } from './analysis/AnalysisMoveList'
import { AdvancedSettings } from './analysis/AdvancedSettings'
import { Button } from './ui/Button'

interface AnalysisClientProps {
  game: AnalysisGameDetail
  config: AnalysisConfig
}

export function AnalysisClient({ game, config }: AnalysisClientProps) {
  const { state, navigate, playWhatif, undoWhatif, resetWhatif, exportWhatifPgn, changeSettings } =
    useAnalysisSession(game, config)

  const [pgnModal, setPgnModal] = useState<string | null>(null)

  const onMove = useCallback(
    (uci: string) => { playWhatif(uci) },
    [playWhatif]
  )

  const { selectedSquare, legalMoves, handleSquareClick, handlePieceDrop } =
    useAnalysisBoardInput(state.currentFen, onMove)

  const inWhatif = state.whatifMoves.length > 0
  const hasSession = state.activeSessionId !== null

  // When viewing the actual game (not in whatif mode), the move played from
  // this position is the one at game.moves[currentIndex]. Outside that range
  // (start, end, or whatif) there is no "actual" move to show.
  const actualMoveUci = useMemo(() => {
    if (inWhatif) return null
    const idx = state.currentIndex
    if (idx < 0 || idx >= game.moves.length) return null
    return game.moves[idx]
  }, [inWhatif, state.currentIndex, game.moves])

  const boardArrows = useMemo(
    () => buildAnalysisArrows(state.currentLines, actualMoveUci),
    [state.currentLines, actualMoveUci]
  )

  async function handleExportPgn() {
    const pgn = await exportWhatifPgn()
    if (pgn) setPgnModal(pgn)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl mx-auto px-4 py-6">
      {/* Board column */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {/* Whatif badge */}
        {inWhatif && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold px-2.5 py-0.5 border border-amber-500/30">
              Whatif mode
            </span>
          </div>
        )}

        {/* Board with whatif ring */}
        <div className={inWhatif ? 'ring-2 ring-amber-400/70 rounded-xl' : ''}>
          <ChessBoard
            fen={state.currentFen}
            orientation="white"
            legalMoves={legalMoves}
            selectedSquare={selectedSquare}
            onSquareClick={handleSquareClick}
            onPieceDrop={handlePieceDrop}
            disabled={!hasSession}
            arrows={boardArrows}
          />
        </div>

        {/* Navigation controls */}
        <div className="flex gap-1 justify-center">
          <Button variant="secondary" size="sm" onClick={() => navigate(0)} disabled={!hasSession}>
            Start
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(Math.max(0, state.currentIndex - 1))}
            disabled={!hasSession || state.currentIndex <= 0}
          >
            ← Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(Math.min(game.moves.length, state.currentIndex + 1))}
            disabled={!hasSession || state.currentIndex >= game.moves.length}
          >
            Next →
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(game.moves.length)}
            disabled={!hasSession}
          >
            End
          </Button>
        </div>

        {/* Whatif controls */}
        {inWhatif && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={undoWhatif} disabled={!hasSession}>
              Undo whatif
            </Button>
            <Button variant="secondary" size="sm" onClick={resetWhatif} disabled={!hasSession}>
              Reset whatif
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExportPgn} disabled={!hasSession}>
              Export PGN
            </Button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-3 w-full lg:w-72 xl:w-80">
        {/* Move list */}
        <div className="rounded-xl border border-border bg-bg-secondary overflow-hidden min-h-40 max-h-60">
          <AnalysisMoveList
            moves={game.moves}
            startingFen={game.starting_fen}
            currentIndex={state.currentIndex}
            onNavigate={navigate}
          />
        </div>

        {/* Analysis panel */}
        <AnalysisPanel
          lines={state.currentLines}
          depth={state.currentDepth}
          running={state.analysisRunning}
          complete={state.analysisComplete}
          error={state.analysisError}
          currentFen={state.currentFen}
        />

        {/* Advanced settings */}
        <AdvancedSettings
          bots={config.bots}
          botId={state.botId}
          lineCount={state.lineCount}
          onApply={changeSettings}
        />
      </div>

      {/* Whatif PGN modal */}
      {pgnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-bg-secondary shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-primary">Whatif PGN</h2>
              <button
                onClick={() => setPgnModal(null)}
                className="text-text-muted hover:text-text-primary transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <textarea
                readOnly
                value={pgnModal}
                rows={8}
                className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono text-text-primary resize-none focus:outline-none"
              />
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(pgnModal).catch(() => {})
                }}
              >
                Copy to clipboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
