'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CollectionListResponse, CollectionStatus, CollectionSummary } from '@/lib/models/arena'

const POLL_INTERVAL_MS = 5000

export function useArenaCollections(statusFilter?: CollectionStatus) {
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('limit', '100')
      const res = await fetch(`/api/dev/arena/collections?${params.toString()}`)
      if (!res.ok) {
        setError('Failed to load collections.')
        return
      }
      const data = (await res.json()) as CollectionListResponse
      setCollections(data.collections)
      setError(null)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    load()

    const hasRunning = () => collections.some((c) => c.status === 'running' || c.status === 'pending')
    if (!statusFilter || statusFilter === 'running' || statusFilter === 'pending') {
      intervalRef.current = setInterval(() => {
        if (hasRunning()) load()
      }, POLL_INTERVAL_MS)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [load, statusFilter, collections])

  return { collections, loading, error, refresh: load }
}
