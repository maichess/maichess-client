'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ConcurrencyLimit } from '@/lib/models/arena'

export function useArenaConfig() {
  const [limit, setLimit] = useState<number>(4)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dev/arena/concurrency-limit')
      if (!res.ok) {
        setError('Failed to load concurrency limit.')
        return
      }
      const data = (await res.json()) as ConcurrencyLimit
      setLimit(data.limit)
      setError(null)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateLimit = useCallback(async (newLimit: number) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/dev/arena/concurrency-limit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: newLimit }),
      })
      if (!res.ok) {
        setError('Failed to update concurrency limit.')
        return
      }
      const data = (await res.json()) as ConcurrencyLimit
      setLimit(data.limit)
    } catch {
      setError('Network error.')
    } finally {
      setSaving(false)
    }
  }, [])

  return { limit, loading, saving, error, updateLimit }
}
