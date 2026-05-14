'use client'

import { useCallback, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import { useTheme } from '@/lib/hooks/useTheme'
// These types mirror the react-chessboard callback shapes (not re-exported from the package index)
type SquareHandlerArgs = { piece: unknown; square: string }
type PieceDropHandlerArgs = { piece: unknown; sourceSquare: string; targetSquare: string | null }
type PieceHandlerArgs = { isSparePiece: boolean; piece: unknown; square: string | null }

interface ChessBoardProps {
  fen: string
  orientation: 'white' | 'black'
  legalMoves: string[]
  selectedSquare: string | null
  onSquareClick: (square: string) => void
  onPieceDrop: (sourceSquare: string, targetSquare: string, promotion?: string) => boolean
  disabled: boolean
  premoveFrom?: string | null
  premoveTo?: string | null
  premoveSource?: string | null
  canDragPiece?: (square: string) => boolean
  onSquareRightClick?: (square: string) => void
}

function getCssVar(name: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function ChessBoard({
  fen,
  orientation,
  legalMoves,
  selectedSquare,
  onSquareClick,
  onPieceDrop,
  disabled,
  premoveFrom = null,
  premoveTo = null,
  premoveSource = null,
  canDragPiece,
  onSquareRightClick,
}: ChessBoardProps) {
  const { theme } = useTheme()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lightSquare = useMemo(() => getCssVar('--sq-light') || '#f0d9b5', [theme])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const darkSquare = useMemo(() => getCssVar('--sq-dark') || '#b58863', [theme])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const highlightColor = useMemo(() => getCssVar('--sq-highlight') || 'rgba(246,246,105,0.5)', [theme])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const legalColor = useMemo(() => getCssVar('--sq-legal') || 'rgba(0,0,0,0.14)', [theme])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const premoveColor = useMemo(() => getCssVar('--sq-premove') || 'rgba(220,80,50,0.55)', [theme])

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {}

    if (selectedSquare) {
      styles[selectedSquare] = { background: highlightColor }
    }

    for (const move of legalMoves) {
      const tgt = move.slice(2, 4)
      styles[tgt] = {
        background: `radial-gradient(circle, ${legalColor} 25%, transparent 25%)`,
      }
    }

    if (premoveSource) {
      styles[premoveSource] = { background: premoveColor }
    }
    if (premoveFrom) {
      styles[premoveFrom] = { background: premoveColor }
    }
    if (premoveTo) {
      styles[premoveTo] = { background: premoveColor }
    }

    return styles
  }, [selectedSquare, legalMoves, highlightColor, legalColor, premoveColor, premoveSource, premoveFrom, premoveTo])

  const handleSquareClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      if (disabled) return
      onSquareClick(square)
    },
    [disabled, onSquareClick]
  )

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (disabled || !targetSquare) return false
      return onPieceDrop(sourceSquare, targetSquare, 'q')
    },
    [disabled, onPieceDrop]
  )

  const handleCanDragPiece = useCallback(
    ({ square }: PieceHandlerArgs): boolean => {
      if (disabled) return false
      if (!square) return false
      if (!canDragPiece) return true
      return canDragPiece(square)
    },
    [disabled, canDragPiece]
  )

  const handleSquareRightClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      if (disabled) return
      onSquareRightClick?.(square)
    },
    [disabled, onSquareRightClick]
  )

  return (
    <div className="w-full max-w-[min(100%,_560px)] mx-auto">
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          onSquareClick: handleSquareClick,
          onPieceDrop: handlePieceDrop,
          onSquareRightClick: handleSquareRightClick,
          canDragPiece: handleCanDragPiece,
          squareStyles,
          allowDragging: !disabled,
          boardStyle: {
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          },
          lightSquareStyle: { backgroundColor: lightSquare },
          darkSquareStyle: { backgroundColor: darkSquare },
          animationDurationInMs: 150,
        }}
      />
    </div>
  )
}
