'use client'

import { useState } from 'react'
import type { Match, MoveEvent, MatchEndedEvent } from '@/lib/models/match'
import { applyMove } from '@/lib/utils/fen'

export function useMatch(initialMatch: Match) {
  const [match, setMatch] = useState<Match>(initialMatch)
  const [submitting, setSubmitting] = useState(false)
  const [moveError, setMoveError] = useState<string | null>(null)
  const [optimisticFen, setOptimisticFen] = useState<string | null>(null)

  const displayFen = optimisticFen ?? match.current_fen

  function applyMoveEvent(event: MoveEvent) {
    // Server confirmed (or superseded) our optimistic state — clear it so the
    // authoritative FEN takes over.
    setOptimisticFen(null)
    const arrivedAt = Date.now()
    setMatch((prev) => {
      // event.index is 1-based (Moves.Count after appending on the server).
      // Skip if we already have this move or a later one to avoid out-of-order
      // socket events (e.g. the human's move_made arriving after the bot's).
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
  }

  function applyMatchEnded(event: MatchEndedEvent) {
    setMatch((prev) => {
      const update: Partial<Match> = { status: event.status }
      if (event.reason === 'timeout') {
        if (event.status === 'white_won') update.black_time_ms = 0
        else if (event.status === 'black_won') update.white_time_ms = 0
      }
      return { ...prev, ...update }
    })
  }

  async function makeMove(uci: string): Promise<boolean> {
    setSubmitting(true)
    setMoveError(null)

    // Show the move on the board immediately — the server will confirm or revert it.
    const optimistic = applyMove(match.current_fen, uci)
    if (optimistic) setOptimisticFen(optimistic)

    try {
      const res = await fetch(`/api/matches/${match.id}/moves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move: uci }),
      })
      if (res.status === 400) {
        const data = await res.json()
        setMoveError(data.error ?? 'Illegal move.')
        setOptimisticFen(null) // revert to confirmed server position
        return false
      }
      if (!res.ok) {
        setOptimisticFen(null)
        return false
      }
      const updated: Match = await res.json()
      // Clear optimistic state — the confirmed server FEN takes over. Only apply
      // the HTTP response if we haven't already advanced past it via a socket event
      // (e.g. bot's move_made arriving before this response).
      setOptimisticFen(null)
      setMatch((prev) => updated.moves.length > prev.moves.length ? updated : prev)
      return true
    } finally {
      setSubmitting(false)
    }
  }

  async function resign() {
    const res = await fetch(`/api/matches/${match.id}/resign`, {
      method: 'POST',
    })
    if (res.ok) {
      const updated: Match = await res.json()
      setMatch(updated)
    }
  }

  return { match, displayFen, makeMove, resign, applyMoveEvent, applyMatchEnded, submitting, moveError }
}
