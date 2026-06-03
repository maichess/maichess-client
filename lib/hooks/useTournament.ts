'use client'

import { useState, useCallback } from 'react'
import type { TournamentDetail } from '@/lib/models/tournament'

export function useTournament(id: string, serverUrl?: string) {
  const [data, setData] = useState<TournamentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)
  const [lastFetchKey, setLastFetchKey] = useState(-1)

  const refresh = useCallback(() => {
    setFetchKey((k) => k + 1)
  }, [])

  const stableKey = `${id}-${serverUrl ?? ''}-${fetchKey}`
  const derivedKey = `${id}-${serverUrl ?? ''}-${lastFetchKey}`

  if (stableKey !== derivedKey) {
    setLastFetchKey(fetchKey)
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    if (serverUrl) params.set('server', serverUrl)

    fetch(`/api/tournaments/${id}?${params}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load tournament (${res.status})`)
        return res.json() as Promise<TournamentDetail>
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  const startTournament = useCallback(async () => {
    const res = await fetch(`/api/tournaments/${id}/start`, { method: 'POST' })
    if (!res.ok) throw new Error(`Failed to start tournament (${res.status})`)
    setFetchKey((k) => k + 1)
  }, [id])

  const registerBot = useCallback(async (botId: string) => {
    const res = await fetch(`/api/tournaments/${id}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot_id: botId }),
    })
    if (!res.ok) throw new Error(`Failed to register bot (${res.status})`)
    setFetchKey((k) => k + 1)
  }, [id])

  const withdrawBot = useCallback(async (botId: string) => {
    const res = await fetch(`/api/tournaments/${id}/register?bot_id=${encodeURIComponent(botId)}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Failed to withdraw (${res.status})`)
    setFetchKey((k) => k + 1)
  }, [id])

  const deleteTournament = useCallback(async () => {
    const res = await fetch(`/api/tournaments/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Failed to delete tournament (${res.status})`)
  }, [id])

  return { data, loading, error, refresh, startTournament, registerBot, withdrawBot, deleteTournament }
}
