'use client'

import { useCallback, useState } from 'react'
import type { SearchPage, SearchScope } from '@/lib/models/search'

// Runs a single search request against /api/search/{scope}. The caller owns the result
// state (the panel) so the same hook serves games, matches, and positions.
export function useSearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(
    async <T>(scope: SearchScope, params: Record<string, string>): Promise<SearchPage<T> | null> => {
      setLoading(true)
      setError(null)
      try {
        const query = new URLSearchParams()
        for (const [key, value] of Object.entries(params)) {
          if (value) query.set(key, value)
        }
        const res = await fetch(`/api/search/${scope}?${query.toString()}`)
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null
          setError(body?.error ?? 'Search failed.')
          return null
        }
        return (await res.json()) as SearchPage<T>
      } catch {
        setError('Network error.')
        return null
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { search, loading, error }
}
