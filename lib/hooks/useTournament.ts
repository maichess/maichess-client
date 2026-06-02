'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TournamentDetail } from '@/lib/models/tournament'

export function useTournament(id: string, serverUrl?: string) {
  const [data, setData] = useState<TournamentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
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
  }, [id, serverUrl])

  useEffect(() => { refresh() }, [refresh])

  const startTournament = useCallback(async () => {
    const res = await fetch(`/api/tournaments/${id}/start`, { method: 'POST' })
    if (!res.ok) throw new Error(`Failed to start tournament (${res.status})`)
    refresh()
  }, [id, refresh])

  const registerBot = useCallback(async (botId: string) => {
    const res = await fetch(`/api/tournaments/${id}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot_id: botId }),
    })
    if (!res.ok) throw new Error(`Failed to register bot (${res.status})`)
    refresh()
  }, [id, refresh])

  const withdrawBot = useCallback(async (botId: string) => {
    const res = await fetch(`/api/tournaments/${id}/register?bot_id=${encodeURIComponent(botId)}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Failed to withdraw (${res.status})`)
    refresh()
  }, [id, refresh])

  const deleteTournament = useCallback(async () => {
    const res = await fetch(`/api/tournaments/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Failed to delete tournament (${res.status})`)
  }, [id])

  return { data, loading, error, refresh, startTournament, registerBot, withdrawBot, deleteTournament }
}
