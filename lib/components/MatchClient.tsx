'use client'

import { useCallback, useMemo } from 'react'
import type { Match } from '@/lib/models/match'
import { isUserPlayer } from '@/lib/models/match'
import { getActiveColor } from '@/lib/utils/fen'
import { useMatch } from '@/lib/hooks/useMatch'
import { useMatchEvents } from '@/lib/hooks/useMatchEvents'
import { useLegalMoves } from '@/lib/hooks/useLegalMoves'
import { ChessBoard } from './ChessBoard'
import { PlayerCard } from './PlayerCard'
import { MoveList } from './MoveList'
import { GameStatus } from './GameStatus'
import { Button } from './ui/Button'

interface MatchClientProps {
  initialMatch: Match
  viewerUserId: string | null
}

export function MatchClient({ initialMatch, viewerUserId }: MatchClientProps) {
  const { match, makeMove, resign, applyMoveEvent, applyMatchEnded, submitting } =
    useMatch(initialMatch)

  const { legalMoves, selectedSquare, fetchLegalMoves, clearSelection } =
    useLegalMoves(match.id)

  // Determine board orientation for the viewing player
  const orientation: 'white' | 'black' = useMemo(() => {
    if (!viewerUserId) return 'white'
    if (isUserPlayer(match.white) && match.white.user_id === viewerUserId) return 'white'
    if (isUserPlayer(match.black) && match.black.user_id === viewerUserId) return 'black'
    return 'white'
  }, [viewerUserId, match.white, match.black])

  // Determine if it's the viewer's turn
  const activeColor = getActiveColor(match.current_fen)
  const myColor = orientation
  const isMyTurn = match.status === 'ongoing' && activeColor === myColor[0]
  const boardDisabled = !isMyTurn || submitting

  const onMove = useCallback(applyMoveEvent, [applyMoveEvent])
  const onEnd = useCallback(applyMatchEnded, [applyMatchEnded])
  useMatchEvents(match.id, onMove, onEnd)

  async function handleSquareClick(square: string) {
    if (!isMyTurn) return

    // If a square is already selected and this is a valid target, make the move
    if (selectedSquare && legalMoves.some((m) => m.startsWith(selectedSquare) && m.slice(2, 4) === square)) {
      const uci = selectedSquare + square
      const promotion = inferPromotion(match.current_fen, selectedSquare, square)
      clearSelection()
      await makeMove(uci + (promotion ? promotion : ''))
      return
    }

    // Otherwise fetch legal moves for the clicked piece
    fetchLegalMoves(square)
  }

  function handlePieceDrop(src: string, tgt: string, promotion = 'q'): boolean {
    if (boardDisabled) return false
    const uci = src + tgt + (isPawnPromotion(match.current_fen, src, tgt) ? promotion : '')
    clearSelection()
    makeMove(uci)
    return true // optimistically accept; server will confirm/reject
  }

  const isGameOver = match.status !== 'ongoing'

  // top = opponent, bottom = viewer
  const topPlayer = orientation === 'white' ? match.black : match.white
  const bottomPlayer = orientation === 'white' ? match.white : match.black
  const topTimeMs = orientation === 'white' ? match.black_time_ms : match.white_time_ms
  const bottomTimeMs = orientation === 'white' ? match.white_time_ms : match.black_time_ms
  const topActive = orientation === 'white' ? activeColor === 'b' : activeColor === 'w'
  const bottomActive = !topActive
  const topSide: 'white' | 'black' = orientation === 'white' ? 'black' : 'white'
  const bottomSide: 'white' | 'black' = orientation

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl mx-auto px-4 py-6">
      {/* Board column */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        <PlayerCard
          player={topPlayer}
          timeMs={topTimeMs}
          isActive={topActive && !isGameOver}
          side={topSide}
        />

        <ChessBoard
          fen={match.current_fen}
          orientation={orientation}
          legalMoves={legalMoves}
          selectedSquare={selectedSquare}
          onSquareClick={handleSquareClick}
          onPieceDrop={handlePieceDrop}
          disabled={boardDisabled}
        />

        <PlayerCard
          player={bottomPlayer}
          timeMs={bottomTimeMs}
          isActive={bottomActive && !isGameOver}
          side={bottomSide}
        />
      </div>

      {/* Sidebar */}
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

        <div className="flex-1 rounded-xl border border-border bg-bg-secondary overflow-hidden min-h-48">
          <MoveList moves={match.moves} />
        </div>
      </div>
    </div>
  )
}

// --- helpers ---

function isPawnPromotion(fen: string, src: string, tgt: string): boolean {
  const rank = tgt[1]
  // White pawn reaching rank 8, black pawn reaching rank 1
  return (
    (rank === '8' && src[1] === '7') ||
    (rank === '1' && src[1] === '2')
  )
}

function inferPromotion(fen: string, src: string, tgt: string): string | null {
  if (isPawnPromotion(fen, src, tgt)) return 'q'
  return null
}
