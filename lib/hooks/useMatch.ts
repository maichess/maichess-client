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

  // `premove` flags a move committed before the opponent moved (near-zero think
  // time); it rides through to anti-cheat so the ply is exempt from timing analysis.
  async function makeMove(uci: string, premove = false): Promise<boolean> {
    setSubmitting(true)
    setMoveError(null)

    const optimistic = applyMove(match.current_fen, uci)
    if (optimistic) setOptimisticFen(optimistic)

    try {
      const res = await fetch(`/api/matches/${match.id}/moves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move: uci, premove }),
      })
      if (!res.ok) {
        // 4xx (not your turn / not a participant / match ended). The move is
        // validated asynchronously, so an illegal move returns 202 and is rejected
        // over the socket instead.
        setOptimisticFen(null)
        return false
      }
      // 202 Accepted: keep the optimistic board; the authoritative move_made socket
      // event (applyMoveEvent) clears the optimistic FEN and commits the move.
      return true
    } finally {
      setSubmitting(false)
    }
  }

  async function resign() {
    // 202 Accepted; the match_ended socket event (applyMatchEnded) commits the result.
    await fetch(`/api/matches/${match.id}/resign`, { method: 'POST' })
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
    // 202 Accepted; the match_ended socket event (applyMatchEnded, reason
    // draw_agreement) commits the drawn result.
    const res = await fetch(`/api/matches/${match.id}/draw-offer/accept`, { method: 'POST' })
    if (res.ok) {
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
