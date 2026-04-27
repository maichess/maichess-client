'use client'

import { useState } from 'react'
import type { Match, MoveEvent, MatchEndedEvent } from '@/lib/models/match'

export function useMatch(initialMatch: Match) {
  const [match, setMatch] = useState<Match>(initialMatch)
  const [submitting, setSubmitting] = useState(false)
  const [moveError, setMoveError] = useState<string | null>(null)

  function applyMoveEvent(event: MoveEvent) {
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
      }
    })
  }

  function applyMatchEnded(event: MatchEndedEvent) {
    setMatch((prev) => ({ ...prev, status: event.status }))
  }

  async function makeMove(uci: string): Promise<boolean> {
    setSubmitting(true)
    setMoveError(null)
    try {
      const res = await fetch(`/api/matches/${match.id}/moves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move: uci }),
      })
      if (res.status === 400) {
        const data = await res.json()
        setMoveError(data.error ?? 'Illegal move.')
        return false
      }
      if (!res.ok) return false
      const updated: Match = await res.json()
      // Only apply the HTTP response if we haven't already advanced past it via
      // a socket event (e.g. bot's move_made arriving before this response).
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

  return { match, makeMove, resign, applyMoveEvent, applyMatchEnded, submitting, moveError }
}
