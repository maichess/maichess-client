'use client'

import { useState, useEffect, useCallback } from 'react'
import type { RegisteredBot } from '@/lib/models/tournament'

export function useRegisteredBots() {
  const [bots, setBots] = useState<RegisteredBot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    fetch('/api/tournaments/registry')
      .then((res) => (res.ok ? res.json() : { bots: [] }))
      .then((data: { bots?: RegisteredBot[] }) => setBots(data.bots ?? []))
      .catch(() => setError('Failed to load registered bots'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const register = useCallback(async (botId: string) => {
    const res = await fetch('/api/tournaments/registry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot_id: botId }),
    })
    if (!res.ok) throw new Error(`Failed to register bot (${res.status})`)
    refresh()
  }, [refresh])

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`/api/tournaments/registry/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Failed to remove bot (${res.status})`)
    refresh()
  }, [refresh])

  return { bots, loading, error, register, remove, refresh }
}
