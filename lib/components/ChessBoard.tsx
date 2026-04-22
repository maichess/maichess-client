'use client'

import { useCallback, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
// These types mirror the react-chessboard callback shapes (not re-exported from the package index)
type SquareHandlerArgs = { piece: unknown; square: string }
type PieceDropHandlerArgs = { piece: unknown; sourceSquare: string; targetSquare: string | null }

interface ChessBoardProps {
  fen: string
  orientation: 'white' | 'black'
  legalMoves: string[]
  selectedSquare: string | null
  onSquareClick: (square: string) => void
  onPieceDrop: (sourceSquare: string, targetSquare: string, promotion?: string) => boolean
  disabled: boolean
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
}: ChessBoardProps) {
  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {}

    if (selectedSquare) {
      styles[selectedSquare] = {
        background: getCssVar('--sq-highlight') || 'rgba(246,246,105,0.5)',
      }
    }

    for (const move of legalMoves) {
      const tgt = move.slice(2, 4)
      const legal = getCssVar('--sq-legal') || 'rgba(0,0,0,0.14)'
      styles[tgt] = {
        background: `radial-gradient(circle, ${legal} 25%, transparent 25%)`,
      }
    }

    return styles
  }, [selectedSquare, legalMoves])

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

  return (
    <div className="w-full max-w-[min(100%,_560px)] mx-auto">
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          onSquareClick: handleSquareClick,
          onPieceDrop: handlePieceDrop,
          squareStyles,
          allowDragging: !disabled,
          boardStyle: {
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          },
          lightSquareStyle: {
            backgroundColor: getCssVar('--sq-light') || '#f0d9b5',
          },
          darkSquareStyle: {
            backgroundColor: getCssVar('--sq-dark') || '#b58863',
          },
          animationDurationInMs: 150,
        }}
      />
    </div>
  )
}
