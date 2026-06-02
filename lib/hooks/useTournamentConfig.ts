'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TournamentConfig } from '@/lib/models/tournament'

export function useTournamentConfig() {
  const [config, setConfig] = useState<TournamentConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tournaments/config')
      .then((res) => res.json())
      .then((data: TournamentConfig) => setConfig(data))
      .finally(() => setLoading(false))
  }, [])

  const updateConfig = useCallback(async (newConfig: TournamentConfig) => {
    const res = await fetch('/api/tournaments/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    })
    if (!res.ok) throw new Error('Failed to update config')
    const data = await res.json() as TournamentConfig
    setConfig(data)
  }, [])

  return { config, loading, updateConfig }
}
