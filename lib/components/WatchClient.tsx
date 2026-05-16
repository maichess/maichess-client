'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { Match, MatchEndedEvent, MoveEvent } from '@/lib/models/match'
import { getActiveColor } from '@/lib/utils/fen'
import { useMatchEvents } from '@/lib/hooks/useMatchEvents'
import { computeCaptured } from '@/lib/utils/captured'
import { Chess } from 'chess.js'
import { ROUTES } from '@/lib/constants/routes'
import { ChessBoard } from './ChessBoard'
import { PlayerCard } from './PlayerCard'
import { MoveList } from './MoveList'
import { GameStatus } from './GameStatus'
import { ExportGamePanel } from './ExportGamePanel'
import { Button } from './ui/Button'
import { matchToPgn } from '@/lib/utils/pgn'
import { formatTimeFormatLabel } from '@/lib/utils/time'

interface WatchClientProps {
  initialMatch: Match
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export function WatchClient({ initialMatch }: WatchClientProps) {
  const [match, setMatch] = useState<Match>(initialMatch)
  const [reviewIndex, setReviewIndex] = useState<number | null>(null)

  const onMove = useCallback((event: MoveEvent) => {
    const arrivedAt = Date.now()
    setMatch((prev) => {
      if (event.index <= prev.moves.length) return prev
      return {
        ...prev,
        current_fen: event.resulting_fen,
        moves: [...prev.moves, event.move],
        white_time_ms: event.white_time_ms,
        black_time_ms: event.black_time_ms,
        last_move_at_ms: arrivedAt,
      }
    })
  }, [])

  const onEnd = useCallback((event: MatchEndedEvent) => {
    setMatch((prev) => {
      const update: Partial<Match> = { status: event.status }
      if (event.reason === 'timeout') {
        if (event.status === 'white_won') update.black_time_ms = 0
        else if (event.status === 'black_won') update.white_time_ms = 0
      }
      return { ...prev, ...update }
    })
  }, [])

  useMatchEvents(match.id, { onMove, onEnd })

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const prevMovesRef = useRef(initialMatch.moves.length)
  useEffect(() => {
    const prev = prevMovesRef.current
    prevMovesRef.current = match.moves.length
    if (match.moves.length <= prev) return
    if (window.innerWidth < 1024) {
      gameAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [match.moves.length])

  const reviewFen = useMemo(() => {
    if (reviewIndex === null) return null
    return computeFenAtIndex(match.moves, reviewIndex)
  }, [match.moves, reviewIndex])

  const displayFen = reviewFen ?? match.current_fen
  const isReviewing = reviewIndex !== null
  const activeColor = getActiveColor(match.current_fen)

  const captured = useMemo(() => {
    const visibleMoves = reviewIndex === null ? match.moves : match.moves.slice(0, reviewIndex)
    return computeCaptured(INITIAL_FEN, visibleMoves)
  }, [match.moves, reviewIndex])

  const isGameOver = match.status !== 'ongoing'
  const topActive = activeColor === 'b'
  const bottomActive = !topActive

  const canGoBack = reviewIndex === null ? match.moves.length > 0 : reviewIndex > 0
  const canGoForward = reviewIndex !== null && reviewIndex < match.moves.length

  function stepBack() {
    setReviewIndex((idx) => {
      if (idx === null) return Math.max(0, match.moves.length - 1)
      return Math.max(0, idx - 1)
    })
  }

  function stepForward() {
    setReviewIndex((idx) => {
      if (idx === null) return null
      const next = idx + 1
      return next >= match.moves.length ? null : next
    })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl mx-auto px-4 py-4 lg:py-6">
      <div ref={gameAreaRef} className="flex flex-col gap-3 flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <Link href={ROUTES.watch} className="hover:text-accent">
            ← Back to Watch
          </Link>
          <span>{formatTimeFormatLabel(match.time_format)} · spectator</span>
        </div>

        <PlayerCard
          player={match.black}
          timeMs={match.black_time_ms}
          lastMoveAtMs={match.last_move_at_ms}
          isActive={topActive && !isGameOver && !isReviewing}
          side="black"
          captured={captured.byBlack}
          materialAdvantage={Math.max(0, -captured.diff)}
        />

        <ChessBoard
          fen={displayFen}
          orientation="white"
          legalMoves={[]}
          selectedSquare={null}
          onSquareClick={() => {}}
          onPieceDrop={() => false}
          disabled
        />

        <PlayerCard
          player={match.white}
          timeMs={match.white_time_ms}
          lastMoveAtMs={match.last_move_at_ms}
          isActive={bottomActive && !isGameOver && !isReviewing}
          side="white"
          captured={captured.byWhite}
          materialAdvantage={Math.max(0, captured.diff)}
        />

        {match.moves.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-bg-secondary px-3 py-2">
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={stepBack} disabled={!canGoBack}>
                ← Prev
              </Button>
              <Button size="sm" variant="ghost" onClick={stepForward} disabled={!canGoForward}>
                Next →
              </Button>
            </div>
            {isReviewing && (
              <Button size="sm" variant="primary" onClick={() => setReviewIndex(null)}>
                Return to live
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full lg:w-64 xl:w-72">
        {isGameOver && <GameStatus status={match.status} myColor={null} />}

        <ExportGamePanel pgn={matchToPgn(match)} fen={match.current_fen} />

        <div className="rounded-xl border border-border bg-bg-secondary overflow-hidden h-48 lg:h-auto lg:flex-1">
          <MoveList moves={match.moves} />
        </div>
      </div>
    </div>
  )
}

function computeFenAtIndex(moves: readonly string[], index: number): string | null {
  if (index < 0) return null
  const game = new Chess(INITIAL_FEN)
  for (let i = 0; i < index && i < moves.length; i++) {
    const uci = moves[i]
    const from = uci.slice(0, 2)
    const to = uci.slice(2, 4)
    const promotion = uci.length > 4 ? uci[4] : undefined
    try {
      game.move({ from, to, promotion })
    } catch {
      return null
    }
  }
  return game.fen()
}
