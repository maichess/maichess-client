'use client'

import { useState } from 'react'
import type {
  Match,
  MoveEvent,
  MatchEndedEvent,
  DrawOfferedEvent,
} from '@/lib/models/match'
import { applyMove } from '@/lib/utils/fen'

export type PendingDrawOffer = { from: 'me' | 'opponent' }

export function useMatch(initialMatch: Match) {
  const [match, setMatch] = useState<Match>(initialMatch)
  const [submitting, setSubmitting] = useState(false)
  const [moveError, setMoveError] = useState<string | null>(null)
  const [optimisticFen, setOptimisticFen] = useState<string | null>(null)
  const [pendingDraw, setPendingDraw] = useState<PendingDrawOffer | null>(null)

  const displayFen = optimisticFen ?? match.current_fen

  function applyMoveEvent(event: MoveEvent) {
    setOptimisticFen(null)
    const arrivedAt = Date.now()
    setMatch((prev) => {
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
    // Any move automatically clears a pending draw offer (server-side rule).
    setPendingDraw(null)
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
    setPendingDraw(null)
  }

  function applyDrawOffered(event: DrawOfferedEvent, viewerUserId: string | null) {
    if (!viewerUserId) return
    const offererIsViewer = 'user_id' in event.player && event.player.user_id === viewerUserId
    setPendingDraw({ from: offererIsViewer ? 'me' : 'opponent' })
  }

  function applyDrawDeclined() {
    setPendingDraw(null)
  }

  async function makeMove(uci: string): Promise<boolean> {
    setSubmitting(true)
    setMoveError(null)

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
        setOptimisticFen(null)
        return false
      }
      if (!res.ok) {
        setOptimisticFen(null)
        return false
      }
      const updated: Match = await res.json()
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

  async function offerDraw(): Promise<boolean> {
    const res = await fetch(`/api/matches/${match.id}/draw-offer`, { method: 'POST' })
    if (res.ok) {
      setPendingDraw({ from: 'me' })
      return true
    }
    return false
  }

  async function acceptDraw(): Promise<boolean> {
    const res = await fetch(`/api/matches/${match.id}/draw-offer/accept`, { method: 'POST' })
    if (res.ok) {
      const updated: Match = await res.json()
      setMatch(updated)
      setPendingDraw(null)
      return true
    }
    return false
  }

  async function declineDraw(): Promise<boolean> {
    const res = await fetch(`/api/matches/${match.id}/draw-offer`, { method: 'DELETE' })
    if (res.ok) {
      setPendingDraw(null)
      return true
    }
    return false
  }

  return {
    match,
    displayFen,
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
    moveError,
  }
}
