'use client'

import { useState } from 'react'
import type { Match, MoveEvent, MatchEndedEvent } from '@/lib/models/match'

export function useMatch(initialMatch: Match) {
  const [match, setMatch] = useState<Match>(initialMatch)
  const [submitting, setSubmitting] = useState(false)
  const [moveError, setMoveError] = useState<string | null>(null)

  function applyMoveEvent(event: MoveEvent) {
    setMatch((prev) => ({
      ...prev,
      current_fen: event.resulting_fen,
      moves: [...prev.moves, event.move],
      white_time_ms: event.white_time_ms,
      black_time_ms: event.black_time_ms,
    }))
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
      setMatch(updated)
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
