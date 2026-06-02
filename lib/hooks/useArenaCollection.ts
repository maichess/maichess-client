'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Collection } from '@/lib/models/arena'

const POLL_INTERVAL_MS = 3000

export function useArenaCollection(id: string) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/dev/arena/collections/${id}`)
      if (!res.ok) {
        setError('Failed to load collection.')
        return
      }
      const data = (await res.json()) as Collection
      setCollection(data)
      setError(null)

      if (data.status === 'finished' && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, POLL_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [load])

  return { collection, loading, error, refresh: load }
}
