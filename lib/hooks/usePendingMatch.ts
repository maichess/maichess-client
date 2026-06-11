'use client'

import { useEffect, useState } from 'react'
import type { Match } from '@/lib/models/match'

// Match creation is asynchronous (match-maker mints the id and publishes a
// CreateMatchCommand to Kafka; match-manager's consumer materialises the durable
// document a moment later). The client navigates to /match/{id} as soon as it has
// the id, so the first read can legitimately 404. This hook polls until the match
// exists, letting the page render an optimistic "starting" state in the meantime
// instead of redirecting the player away from a game that is about to exist.

const POLL_INTERVAL_MS = 400
const MAX_WAIT_MS = 20_000

export type PendingMatchState =
  | { status: 'loading' }
  | { status: 'ready'; match: Match }
  | { status: 'not-found' }

export function usePendingMatch(id: string, initialMatch: Match | null): PendingMatchState {
  const [state, setState] = useState<PendingMatchState>(
    initialMatch ? { status: 'ready', match: initialMatch } : { status: 'loading' },
  )

  useEffect(() => {
    // The match was already present at SSR time — nothing to wait for.
    if (initialMatch) return

    let cancelled = false
    const deadline = Date.now() + MAX_WAIT_MS

    async function poll() {
      while (!cancelled) {
        try {
          const res = await fetch(`/api/matches/${id}`, { cache: 'no-store' })
          if (res.ok) {
            const match = (await res.json()) as Match
            if (!cancelled) setState({ status: 'ready', match })
            return
          }
          // Anything other than "not yet materialised" is terminal.
          if (res.status !== 404) {
            if (!cancelled) setState({ status: 'not-found' })
            return
          }
        } catch {
          // Transient network error — keep trying within the budget.
        }

        if (Date.now() >= deadline) {
          if (!cancelled) setState({ status: 'not-found' })
          return
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
      }
    }

    void poll()
    return () => {
      cancelled = true
    }
  }, [id, initialMatch])

  return state
}
