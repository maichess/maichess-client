'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLegalMovesFromSquare } from '@/lib/utils/fen'

export function useAnalysisBoardInput(
  currentFen: string,
  onMove: (uci: string) => void
) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)

  // Clear selection whenever the board position changes (navigation/whatif)
  useEffect(() => {
    setSelectedSquare(null)
  }, [currentFen])

  const legalMoves = useMemo(
    () => (selectedSquare ? getLegalMovesFromSquare(currentFen, selectedSquare) : []),
    [currentFen, selectedSquare]
  )

  const handleSquareClick = useCallback(
    (square: string) => {
      if (!selectedSquare) {
        setSelectedSquare(square)
        return
      }

      const move = legalMoves.find((m) => m.slice(2, 4) === square)
      if (move) {
        setSelectedSquare(null)
        onMove(move)
        return
      }

      // Re-select (clicked a different piece)
      setSelectedSquare(square)
    },
    [selectedSquare, legalMoves, onMove]
  )

  const handlePieceDrop = useCallback(
    (src: string, tgt: string): boolean => {
      const moves = getLegalMovesFromSquare(currentFen, src)
      const move = moves.find((m) => m.slice(2, 4) === tgt)
      if (!move) return false
      setSelectedSquare(null)
      onMove(move)
      return true
    },
    [currentFen, onMove]
  )

  const clearSelection = useCallback(() => setSelectedSquare(null), [])

  return { selectedSquare, legalMoves, handleSquareClick, handlePieceDrop, clearSelection }
}
