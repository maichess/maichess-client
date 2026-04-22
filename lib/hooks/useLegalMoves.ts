'use client'

import { useCallback, useState } from 'react'

export function useLegalMoves(matchId: string) {
  const [legalMoves, setLegalMoves] = useState<string[]>([])
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)

  const fetchLegalMoves = useCallback(
    async (square: string) => {
      if (selectedSquare === square) {
        // Clicking the same square deselects it
        setSelectedSquare(null)
        setLegalMoves([])
        return
      }
      setSelectedSquare(square)
      try {
        const res = await fetch(
          `/api/matches/${matchId}/legal-moves?from=${square}`
        )
        if (!res.ok) {
          setLegalMoves([])
          return
        }
        const data = await res.json()
        setLegalMoves(data.moves ?? [])
      } catch {
        setLegalMoves([])
      }
    },
    [matchId, selectedSquare]
  )

  function clearSelection() {
    setSelectedSquare(null)
    setLegalMoves([])
  }

  return { legalMoves, selectedSquare, fetchLegalMoves, clearSelection }
}
