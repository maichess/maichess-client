'use client'

import { useState, useEffect } from 'react'
import type { TournamentAnalyticsExport } from '@/lib/models/tournament'

interface State {
  data: TournamentAnalyticsExport | null
  loading: boolean
  error: string | null
}

// Loads the tournament analytics export (only meaningful once finished). The
// caller gates fetching with `enabled` so it does not fire for unfinished
// tournaments (the endpoint returns 409 until the tournament is finished).
export function useTournamentAnalytics(id: string, enabled: boolean) {
  const [state, setState] = useState<State>({ data: null, loading: enabled, error: null })

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    fetch(`/api/tournaments/${id}/analytics`)
      .then(async (res) => {
        if (res.status === 409) throw new Error('Analytics are available once the tournament is finished.')
        if (!res.ok) throw new Error(`Failed to load analytics (${res.status})`)
        return res.json() as Promise<TournamentAnalyticsExport>
      })
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error: err.message })
      })

    return () => {
      cancelled = true
    }
  }, [id, enabled])

  return state
}
