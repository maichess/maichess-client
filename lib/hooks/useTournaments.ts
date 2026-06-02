'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TournamentListResponse } from '@/lib/models/tournament'

export function useTournaments(serverUrl?: string) {
  const [data, setData] = useState<TournamentListResponse>({ created: [], started: [], finished: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
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
  }, [serverUrl])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}
