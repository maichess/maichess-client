'use client'

import { useEffect, useState } from 'react'
import type { TimeFormat } from '@/lib/models/match'

export interface UserMatchSummary {
  match_id: string
  white: Record<string, string>
  black: Record<string, string>
  status: string
  time_format: TimeFormat
  move_count: number
  finished_at_ms: number
}

export interface UserMatchesResponse {
  matches: UserMatchSummary[]
  total: number
  page: number
  page_size: number
}

export function useUserMatches(initial?: UserMatchesResponse) {
  const [data, setData] = useState<UserMatchesResponse>(
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
        `/api/analysis/matches?status=all&page=${page}&page_size=${data.page_size}`,
        { cache: 'no-store' },
      )
      if (!res.ok) {
        setError('Failed to load matches.')
        return
      }
      const next = (await res.json()) as UserMatchesResponse
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
