'use client'

import { useEffect, useState } from 'react'
import type { MatchListResponse } from '@/lib/models/match'

/**
 * Loads the authenticated user's Past Matches (ended games they played or
 * started) from match-manager via the /api/users/me/matches proxy. Independent
 * of useUserMatches, which sources the Analysis import list from analysis-service.
 */
export function useMatchHistory(initial?: MatchListResponse) {
  const [data, setData] = useState<MatchListResponse>(
    initial ?? { matches: [], total: 0, page: 1, page_size: 20 },
  )
  const [loading, setLoading] = useState(initial === undefined)
  const [error, setError] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(data.total / data.page_size))

  async function load(page: number) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/users/me/matches?status=ended&page=${page}&page_size=${data.page_size}`,
        { cache: 'no-store' },
      )
      if (!res.ok) {
        setError('Failed to load matches.')
        return
      }
      const next = (await res.json()) as MatchListResponse
      setData(next)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initial === undefined) load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    data,
    loading,
    error,
    totalPages,
    nextPage: () => load(Math.min(data.page + 1, totalPages)),
    prevPage: () => load(Math.max(data.page - 1, 1)),
    refresh: () => load(data.page),
  }
}
