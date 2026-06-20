'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Opening } from '@/lib/models/tournament'

export function useTournamentOpenings() {
  const [openings, setOpenings] = useState<Opening[]>([])
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetch('/api/tournaments/openings')
      .then((res) => (res.ok ? res.json() : { openings: [] }))
      .then((data: { openings?: Opening[] }) => {
        if (!cancelled) setOpenings(data.openings ?? [])
      })
      .catch(() => {
        if (!cancelled) setOpenings([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  // Register a reusable custom opening, then refresh the catalog so it appears in
  // the selectors. Returns the created opening; throws on failure (caller shows it).
  const register = useCallback(async (name: string, fen: string): Promise<Opening> => {
    const res = await fetch('/api/tournaments/openings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, fen }),
    })
    if (!res.ok) {
      const detail = res.status === 409 ? 'An opening with that name already exists' : `Failed to register opening (${res.status})`
      throw new Error(detail)
    }
    const opening = (await res.json()) as Opening
    setReloadKey((k) => k + 1)
    return opening
  }, [])

  return { openings, loading, register }
}
