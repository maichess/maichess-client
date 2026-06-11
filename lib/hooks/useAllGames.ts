'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MatchListResponse } from '@/lib/models/match'

export type GamesStatus = 'all' | 'ongoing' | 'ended'
export type GamesSource = 'all' | 'native' | 'external'

export interface AllGamesFilters {
  playerId: string
  initiatorId: string
  status: GamesStatus
  source: GamesSource
  ascending: boolean
  since: string // yyyy-mm-dd, empty = unbounded
  until: string // yyyy-mm-dd, empty = unbounded
}

const DEFAULT_FILTERS: AllGamesFilters = {
  playerId: '',
  initiatorId: '',
  status: 'all',
  source: 'all',
  ascending: false,
  since: '',
  until: '',
}

const EMPTY: MatchListResponse = { matches: [], total: 0, page: 1, page_size: 20 }
const TEXT_DEBOUNCE_MS = 350
const POLL_INTERVAL_MS = 5000

// Converts a yyyy-mm-dd date input into the inclusive Unix-ms bound the
// match-manager search expects (start-of-day for `since`, end-of-day for `until`),
// keying on finished_at_ms. Returns 0 (unbounded) for an empty/invalid date.
function dayBoundMs(date: string, edge: 'start' | 'end'): number {
  if (!date) return 0
  const base = Date.parse(`${date}T00:00:00.000Z`)
  if (Number.isNaN(base)) return 0
  return edge === 'start' ? base : base + 86_399_999
}

/**
 * Drives the Dev "All games" browser: holds the filter + pagination state, debounces
 * the free-text player/initiator filters, and fetches the global chronological match
 * list from match-manager via the /api/dev/games proxy. When `autoRefresh` is on and
 * the status filter includes live games it polls lightly so ongoing rows stay current.
 */
export function useAllGames() {
  const [filters, setFilters] = useState<AllGamesFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<MatchListResponse>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Debounce the free-text filters so typing does not fire a request per keystroke.
  const [debouncedText, setDebouncedText] = useState({ playerId: '', initiatorId: '' })
  useEffect(() => {
    const handle = setTimeout(
      () => setDebouncedText({ playerId: filters.playerId, initiatorId: filters.initiatorId }),
      TEXT_DEBOUNCE_MS,
    )
    return () => clearTimeout(handle)
  }, [filters.playerId, filters.initiatorId])

  const totalPages = Math.max(1, Math.ceil(data.total / data.page_size))

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (debouncedText.playerId) params.set('player_id', debouncedText.playerId)
    if (debouncedText.initiatorId) params.set('initiator_id', debouncedText.initiatorId)
    if (filters.status !== 'all') params.set('status', filters.status)
    if (filters.source !== 'all') params.set('source', filters.source)
    if (filters.ascending) params.set('ascending', 'true')
    const sinceMs = dayBoundMs(filters.since, 'start')
    const untilMs = dayBoundMs(filters.until, 'end')
    if (sinceMs > 0) params.set('since_ms', String(sinceMs))
    if (untilMs > 0) params.set('until_ms', String(untilMs))
    params.set('page', String(page))
    return params.toString()
  }, [
    debouncedText,
    filters.status,
    filters.source,
    filters.ascending,
    filters.since,
    filters.until,
    page,
  ])

  // Re-fetch on any filter change without flashing the loading state on a poll tick.
  const load = useCallback(
    async (spinner: boolean) => {
      if (spinner) setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/dev/games?${query}`, { cache: 'no-store' })
        if (!res.ok) {
          setError('Failed to load games.')
          return
        }
        setData((await res.json()) as MatchListResponse)
      } catch {
        setError('Network error.')
      } finally {
        if (spinner) setLoading(false)
      }
    },
    [query],
  )

  useEffect(() => {
    void load(true)
  }, [load])

  // Reset to the first page whenever the filter set (not the page) changes.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setPage(1)
  }, [
    debouncedText,
    filters.status,
    filters.source,
    filters.ascending,
    filters.since,
    filters.until,
  ])

  const live = filters.status !== 'ended'
  useEffect(() => {
    if (!autoRefresh || !live) return
    const handle = setInterval(() => void load(false), POLL_INTERVAL_MS)
    return () => clearInterval(handle)
  }, [autoRefresh, live, load])

  const setFilter = useCallback(<K extends keyof AllGamesFilters>(key: K, value: AllGamesFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  return {
    filters,
    setFilter,
    reset,
    data,
    loading,
    error,
    page: data.page,
    totalPages,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
    refresh: () => load(true),
    autoRefresh,
    setAutoRefresh,
    canPoll: live,
  }
}
