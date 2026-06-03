'use client'

import { useState, useCallback } from 'react'
import type { TournamentListResponse } from '@/lib/models/tournament'

export function useTournaments(serverUrl?: string) {
  const [data, setData] = useState<TournamentListResponse>({ created: [], started: [], finished: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)
  const [lastFetchKey, setLastFetchKey] = useState(-1)

  const refresh = useCallback(() => {
    setFetchKey((k) => k + 1)
  }, [])

  const stableKey = `${serverUrl ?? ''}-${fetchKey}`
  const derivedKey = `${serverUrl ?? ''}-${lastFetchKey}`

  if (stableKey !== derivedKey) {
    setLastFetchKey(fetchKey)
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    if (serverUrl) params.set('server', serverUrl)

    fetch(`/api/tournaments?${params}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load tournaments (${res.status})`)
        return res.json() as Promise<TournamentListResponse>
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  return { data, loading, error, refresh }
}
