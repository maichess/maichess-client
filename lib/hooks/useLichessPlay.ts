'use client'

import { useState } from 'react'

export type LichessMode = 'challenge' | 'existing'

export interface LichessChallengePayload {
  bot_id: string
  lichess_token: string
  opponent: string
  level: number
  clock_limit: number
  clock_increment: number
}

export interface LichessExistingPayload {
  bot_id: string
  lichess_token: string
  game_id: string
}

type Payload = LichessChallengePayload | LichessExistingPayload

const ENDPOINTS: Record<LichessMode, string> = {
  challenge: '/api/external/lichess/challenge',
  existing: '/api/external/lichess',
}

/**
 * Drives the "Play on Lichess" dev form: posts to the tournament-bridge external-game
 * endpoints and exposes the resulting maichess match id (which is immediately watchable).
 */
export function useLichessPlay() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [matchId, setMatchId] = useState<string | null>(null)

  async function submit(mode: LichessMode, payload: Payload): Promise<void> {
    setSubmitting(true)
    setError(null)
    setMatchId(null)

    try {
      const res = await fetch(ENDPOINTS[mode], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { match_id?: string; error?: string }
      if (!res.ok || !data.match_id) {
        throw new Error(data.error ?? `Request failed (${res.status})`)
      }
      setMatchId(data.match_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  return { submit, submitting, error, matchId }
}
