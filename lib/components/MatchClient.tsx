'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Match } from '@/lib/models/match'
import { isUserPlayer } from '@/lib/models/match'
import { getActiveColor } from '@/lib/utils/fen'
import { useMatch } from '@/lib/hooks/useMatch'
import { useMatchEvents } from '@/lib/hooks/useMatchEvents'
import { useLegalMoves } from '@/lib/hooks/useLegalMoves'
import { computeCaptured } from '@/lib/utils/captured'
import { Chess } from 'chess.js'
import { ChessBoard } from './ChessBoard'
import { PlayerCard } from './PlayerCard'
import { MoveList } from './MoveList'
import { GameStatus } from './GameStatus'
import { Button } from './ui/Button'

interface MatchClientProps {
  initialMatch: Match
  viewerUserId: string | null
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export function MatchClient({ initialMatch, viewerUserId }: MatchClientProps) {
  const { match, displayFen: liveDisplayFen, makeMove, resign, applyMoveEvent, applyMatchEnded, submitting } =
    useMatch(initialMatch)

  // Browse-only review: null = live, otherwise the move index being viewed
  // (0 = starting position, N = position after the N-th move).
  const [reviewIndex, setReviewIndex] = useState<number | null>(null)

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const prevMovesCountRef = useRef(initialMatch.moves.length)
  useEffect(() => {
    const prev = prevMovesCountRef.current
    prevMovesCountRef.current = match.moves.length
    if (match.moves.length <= prev) return
    // Keep both player labels and the whole board in view on mobile.
    // `block: 'nearest'` only scrolls when the container is out of view and
    // stops once it's fully visible — so the bottom player card remains visible.
    if (window.innerWidth < 1024) {
      gameAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [match.moves.length])

  const { legalMoves, selectedSquare, fetchLegalMoves, clearSelection } =
    useLegalMoves(match.id)

  const orientation: 'white' | 'black' = useMemo(() => {
    if (!viewerUserId) return 'white'
    if (isUserPlayer(match.white) && match.white.user_id === viewerUserId) return 'white'
    if (isUserPlayer(match.black) && match.black.user_id === viewerUserId) return 'black'
    return 'white'
  }, [viewerUserId, match.white, match.black])

  // Compute the historical FEN locally when reviewing past positions.
  const reviewFen = useMemo(() => {
    if (reviewIndex === null) return null
    return computeFenAtIndex(match.moves, reviewIndex)
  }, [match.moves, reviewIndex])

  const displayFen = reviewFen ?? liveDisplayFen
  const isReviewing = reviewIndex !== null

  const activeColor = getActiveColor(displayFen)
  const myColor = orientation
  const isMyTurn = match.status === 'ongoing' && activeColor === myColor[0] && !isReviewing
  const boardDisabled = !isMyTurn || submitting

  const onMove = useCallback(applyMoveEvent, [applyMoveEvent])
  const onEnd = useCallback(applyMatchEnded, [applyMatchEnded])
  useMatchEvents(match.id, onMove, onEnd)

  // Captured material for both sides (recomputed when the move list changes
  // or the review index changes so the badge tracks the currently shown board).
  const captured = useMemo(() => {
    const visibleMoves = reviewIndex === null ? match.moves : match.moves.slice(0, reviewIndex)
    return computeCaptured(INITIAL_FEN, visibleMoves)
  }, [match.moves, reviewIndex])

  async function handleSquareClick(square: string) {
    if (!isMyTurn) return

    if (selectedSquare && legalMoves.some((m) => m.startsWith(selectedSquare) && m.slice(2, 4) === square)) {
      const uci = selectedSquare + square
      const promotion = inferPromotion(match.current_fen, selectedSquare, square)
      clearSelection()
      await makeMove(uci + (promotion ? promotion : ''))
      return
    }

    fetchLegalMoves(square)
  }

  function handlePieceDrop(src: string, tgt: string, promotion = 'q'): boolean {
    if (boardDisabled) return false
    const uci = src + tgt + (isPawnPromotion(match.current_fen, src, tgt) ? promotion : '')
    clearSelection()
    makeMove(uci)
    return true
  }

  const isGameOver = match.status !== 'ongoing'

  const topPlayer = orientation === 'white' ? match.black : match.white
  const bottomPlayer = orientation === 'white' ? match.white : match.black
  const topTimeMs = orientation === 'white' ? match.black_time_ms : match.white_time_ms
  const bottomTimeMs = orientation === 'white' ? match.white_time_ms : match.black_time_ms
  const topActive = orientation === 'white' ? activeColor === 'b' : activeColor === 'w'
  const bottomActive = !topActive
  const topSide: 'white' | 'black' = orientation === 'white' ? 'black' : 'white'
  const bottomSide: 'white' | 'black' = orientation

  // Captured pieces a player has *taken* equals captured-by-their-color.
  const whiteCaptured = captured.byWhite
  const blackCaptured = captured.byBlack
  const whiteAdvantage = Math.max(0, captured.diff)
  const blackAdvantage = Math.max(0, -captured.diff)
  const topCaptured = topSide === 'white' ? whiteCaptured : blackCaptured
  const bottomCaptured = bottomSide === 'white' ? whiteCaptured : blackCaptured
  const topAdvantage = topSide === 'white' ? whiteAdvantage : blackAdvantage
  const bottomAdvantage = bottomSide === 'white' ? whiteAdvantage : blackAdvantage

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

  function returnToLive() {
    setReviewIndex(null)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl mx-auto px-4 py-4 lg:py-6">
      <div ref={gameAreaRef} className="flex flex-col gap-3 flex-1 min-w-0">
        <PlayerCard
          player={topPlayer}
          timeMs={topTimeMs}
          lastMoveAtMs={match.last_move_at_ms}
          isActive={topActive && !isGameOver && !isReviewing}
          side={topSide}
          captured={topCaptured}
          materialAdvantage={topAdvantage}
        />

        <ChessBoard
          fen={displayFen}
          orientation={orientation}
          legalMoves={isReviewing ? [] : legalMoves}
          selectedSquare={isReviewing ? null : selectedSquare}
          onSquareClick={handleSquareClick}
          onPieceDrop={handlePieceDrop}
          disabled={boardDisabled}
        />

        <PlayerCard
          player={bottomPlayer}
          timeMs={bottomTimeMs}
          lastMoveAtMs={match.last_move_at_ms}
          isActive={bottomActive && !isGameOver && !isReviewing}
          side={bottomSide}
          captured={bottomCaptured}
          materialAdvantage={bottomAdvantage}
        />

        {/* Review controls — visible whenever there's a move history */}
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
              <Button size="sm" variant="primary" onClick={returnToLive}>
                Return to live
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full lg:w-64 xl:w-72">
        {isGameOver ? (
          <GameStatus
            status={match.status}
            myColor={viewerUserId ? myColor : null}
          />
        ) : viewerUserId && (
          <Button
            variant="danger"
            size="sm"
            onClick={resign}
            className="w-full"
          >
            Resign
          </Button>
        )}

        <div className="rounded-xl border border-border bg-bg-secondary overflow-hidden h-48 lg:h-auto lg:flex-1">
          <MoveList moves={match.moves} />
        </div>
      </div>
    </div>
  )
}

// --- helpers ---

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

function isPawnPromotion(fen: string, src: string, tgt: string): boolean {
  const piece = pieceAt(fen, src)
  if (piece !== 'P' && piece !== 'p') return false
  const rank = tgt[1]
  return (piece === 'P' && rank === '8') || (piece === 'p' && rank === '1')
}

function pieceAt(fen: string, square: string): string | null {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0)
  const rank = 8 - parseInt(square[1])
  const rows = fen.split(' ')[0].split('/')
  let col = 0
  for (const ch of rows[rank]) {
    if (ch >= '1' && ch <= '8') {
      col += parseInt(ch)
    } else {
      if (col === file) return ch
      col++
    }
  }
  return null
}

function inferPromotion(fen: string, src: string, tgt: string): string | null {
  if (isPawnPromotion(fen, src, tgt)) return 'q'
  return null
}
