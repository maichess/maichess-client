'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Match, DrawOfferedEvent } from '@/lib/models/match'
import { isUserPlayer } from '@/lib/models/match'
import { applyMove, getActiveColor, getPieceAt } from '@/lib/utils/fen'
import { useMatch } from '@/lib/hooks/useMatch'
import { useMatchEvents } from '@/lib/hooks/useMatchEvents'
import { useLegalMoves } from '@/lib/hooks/useLegalMoves'
import { usePremove } from '@/lib/hooks/usePremove'
import { usePromotion } from '@/lib/hooks/usePromotion'
import { computeCaptured } from '@/lib/utils/captured'
import { Chess } from 'chess.js'
import { ChessBoard } from './ChessBoard'
import { PlayerCard } from './PlayerCard'
import { MoveList } from './MoveList'
import { GameStatus } from './GameStatus'
import { PromotionPicker } from './PromotionPicker'
import { Button } from './ui/Button'

interface MatchClientProps {
  initialMatch: Match
  viewerUserId: string | null
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export function MatchClient({ initialMatch, viewerUserId }: MatchClientProps) {
  const {
    match,
    displayFen: liveDisplayFen,
    makeMove,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    applyMoveEvent,
    applyMatchEnded,
    applyDrawOffered,
    applyDrawDeclined,
    pendingDraw,
    submitting,
  } = useMatch(initialMatch)

  const [reviewIndex, setReviewIndex] = useState<number | null>(null)

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const prevMovesCountRef = useRef(initialMatch.moves.length)
  useEffect(() => {
    const prev = prevMovesCountRef.current
    prevMovesCountRef.current = match.moves.length
    if (match.moves.length <= prev) return
    if (window.innerWidth < 1024) {
      gameAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [match.moves.length])

  const { legalMoves, selectedSquare, fetchLegalMoves, clearSelection } =
    useLegalMoves(match.id)
  const { premove, premoveSource, queuePremove, selectPremoveSource, clearPremove } =
    usePremove()
  const { pendingPromotion, requestPromotion, clearPromotion } = usePromotion()

  const orientation: 'white' | 'black' = useMemo(() => {
    if (!viewerUserId) return 'white'
    if (isUserPlayer(match.white) && match.white.user_id === viewerUserId) return 'white'
    if (isUserPlayer(match.black) && match.black.user_id === viewerUserId) return 'black'
    return 'white'
  }, [viewerUserId, match.white, match.black])

  const isViewerPlaying = useMemo(() => {
    if (!viewerUserId) return false
    const w = isUserPlayer(match.white) && match.white.user_id === viewerUserId
    const b = isUserPlayer(match.black) && match.black.user_id === viewerUserId
    return w || b
  }, [viewerUserId, match.white, match.black])

  // Draw offers only make sense in human-vs-human matches.
  const isHumanVsHuman = useMemo(
    () => isUserPlayer(match.white) && isUserPlayer(match.black),
    [match.white, match.black]
  )

  const reviewFen = useMemo(() => {
    if (reviewIndex === null) return null
    return computeFenAtIndex(match.moves, reviewIndex)
  }, [match.moves, reviewIndex])

  const displayFen = reviewFen ?? liveDisplayFen
  const isReviewing = reviewIndex !== null

  const activeColor = getActiveColor(displayFen)
  const myColor = orientation
  const isOngoing = match.status === 'ongoing'
  const isGameOver = !isOngoing
  const isMyTurn = isOngoing && activeColor === myColor[0] && !isReviewing
  const boardDisabled = isReviewing || isGameOver
  const canPremove = isViewerPlaying && !isMyTurn && !isReviewing && isOngoing

  const onMove = useCallback((event: Parameters<typeof applyMoveEvent>[0]) => applyMoveEvent(event), [applyMoveEvent])
  const onEnd = useCallback((event: Parameters<typeof applyMatchEnded>[0]) => applyMatchEnded(event), [applyMatchEnded])
  const onDrawOffered = useCallback(
    (event: DrawOfferedEvent) => applyDrawOffered(event, viewerUserId),
    [applyDrawOffered, viewerUserId]
  )
  const onDrawDeclined = useCallback(() => applyDrawDeclined(), [applyDrawDeclined])
  useMatchEvents(match.id, {
    onMove,
    onEnd,
    onDrawOffered,
    onDrawDeclined,
  })

  useEffect(() => {
    if (!premove || !isMyTurn || submitting) return
    const uci = premove.from + premove.to + (premove.promotion ?? '')
    const next = applyMove(match.current_fen, uci)
    clearPremove()
    if (next) {
      void makeMove(uci)
    }
  }, [isMyTurn, premove, submitting, match.current_fen, makeMove, clearPremove])

  useEffect(() => {
    if (isGameOver) {
      clearPremove()
      clearPromotion()
    }
  }, [isGameOver, clearPremove, clearPromotion])

  const captured = useMemo(() => {
    const visibleMoves = reviewIndex === null ? match.moves : match.moves.slice(0, reviewIndex)
    return computeCaptured(INITIAL_FEN, visibleMoves)
  }, [match.moves, reviewIndex])

  const isOwnPieceAt = useCallback(
    (square: string) => {
      const piece = getPieceAt(match.current_fen, square)
      return piece?.color === myColor[0]
    },
    [match.current_fen, myColor]
  )

  const canDragPiece = useCallback(
    (square: string) => {
      if (isMyTurn) return isOwnPieceAt(square)
      if (canPremove) return isOwnPieceAt(square)
      return false
    },
    [isMyTurn, canPremove, isOwnPieceAt]
  )

  async function handleSquareClick(square: string) {
    if (pendingPromotion) return

    if (isMyTurn) {
      if (
        selectedSquare &&
        legalMoves.some((m) => m.startsWith(selectedSquare) && m.slice(2, 4) === square)
      ) {
        if (isPawnPromotion(match.current_fen, selectedSquare, square)) {
          requestPromotion(selectedSquare, square, myColor[0] as 'w' | 'b')
          clearSelection()
          return
        }
        const uci = selectedSquare + square
        clearSelection()
        await makeMove(uci)
        return
      }
      fetchLegalMoves(square)
      return
    }

    if (!canPremove) return

    if (premoveSource) {
      if (square === premoveSource) {
        clearPremove()
        return
      }
      const promotion = isPawnPromotion(match.current_fen, premoveSource, square) ? 'q' : undefined
      queuePremove(premoveSource, square, promotion)
      return
    }

    if (isOwnPieceAt(square)) {
      selectPremoveSource(square)
      return
    }

    clearPremove()
  }

  function handlePieceDrop(src: string, tgt: string, promotion = 'q'): boolean {
    if (boardDisabled || pendingPromotion) return false

    if (isMyTurn) {
      if (isPawnPromotion(match.current_fen, src, tgt)) {
        requestPromotion(src, tgt, myColor[0] as 'w' | 'b')
        clearSelection()
        // Returning false snaps the piece back to source while the picker is up.
        return false
      }
      const uci = src + tgt
      clearSelection()
      makeMove(uci)
      return true
    }

    if (canPremove && isOwnPieceAt(src)) {
      const promo = isPawnPromotion(match.current_fen, src, tgt) ? promotion : undefined
      queuePremove(src, tgt, promo)
      return true
    }

    return false
  }

  function handleSquareRightClick() {
    if (premove || premoveSource) clearPremove()
  }

  async function handlePromotionSelect(piece: 'q' | 'r' | 'b' | 'n') {
    if (!pendingPromotion) return
    const { from, to } = pendingPromotion
    clearPromotion()
    await makeMove(from + to + piece)
  }

  const topPlayer = orientation === 'white' ? match.black : match.white
  const bottomPlayer = orientation === 'white' ? match.white : match.black
  const topTimeMs = orientation === 'white' ? match.black_time_ms : match.white_time_ms
  const bottomTimeMs = orientation === 'white' ? match.white_time_ms : match.black_time_ms
  const topActive = orientation === 'white' ? activeColor === 'b' : activeColor === 'w'
  const bottomActive = !topActive
  const topSide: 'white' | 'black' = orientation === 'white' ? 'black' : 'white'
  const bottomSide: 'white' | 'black' = orientation

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

  const canOfferDraw =
    isViewerPlaying && isHumanVsHuman && isOngoing && !pendingDraw && !pendingPromotion

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

        <div className="relative">
          <ChessBoard
            fen={displayFen}
            orientation={orientation}
            legalMoves={isReviewing ? [] : legalMoves}
            selectedSquare={isReviewing ? null : selectedSquare}
            onSquareClick={handleSquareClick}
            onPieceDrop={handlePieceDrop}
            onSquareRightClick={handleSquareRightClick}
            disabled={boardDisabled || pendingPromotion !== null}
            premoveFrom={isReviewing ? null : premove?.from ?? null}
            premoveTo={isReviewing ? null : premove?.to ?? null}
            premoveSource={isReviewing ? null : premoveSource}
            canDragPiece={canDragPiece}
          />

          {pendingPromotion && (
            <PromotionPicker
              color={pendingPromotion.color}
              targetSquare={pendingPromotion.to}
              orientation={orientation}
              onSelect={handlePromotionSelect}
              onCancel={clearPromotion}
            />
          )}
        </div>

        <PlayerCard
          player={bottomPlayer}
          timeMs={bottomTimeMs}
          lastMoveAtMs={match.last_move_at_ms}
          isActive={bottomActive && !isGameOver && !isReviewing}
          side={bottomSide}
          captured={bottomCaptured}
          materialAdvantage={bottomAdvantage}
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
          <div className="flex flex-col gap-2">
            {pendingDraw?.from === 'opponent' && (
              <div className="rounded-xl border border-accent/40 bg-bg-elevated p-3 flex flex-col gap-2">
                <span className="text-sm text-text-primary">
                  Your opponent offers a draw.
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={acceptDraw} className="flex-1">
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost" onClick={declineDraw} className="flex-1">
                    Decline
                  </Button>
                </div>
              </div>
            )}

            {pendingDraw?.from === 'me' && (
              <div className="rounded-xl border border-border bg-bg-secondary p-3 flex items-center justify-between gap-2">
                <span className="text-xs text-text-muted">Draw offered.</span>
                <Button size="sm" variant="ghost" onClick={declineDraw}>
                  Retract
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              {isHumanVsHuman && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={offerDraw}
                  disabled={!canOfferDraw}
                  className="flex-1"
                >
                  Offer draw
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={resign}
                className="flex-1"
              >
                Resign
              </Button>
            </div>
          </div>
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
