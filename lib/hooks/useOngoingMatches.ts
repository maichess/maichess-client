'use client'

import { useState, useEffect } from 'react'
import type { MatchSummary, MatchListResponse } from '@/lib/models/match'

export function useOngoingMatches(initialMatches: MatchSummary[]): { matches: MatchSummary[] } {
  const [matches, setMatches] = useState<MatchSummary[]>(initialMatches)

  useEffect(() => {
    let cancelled = false

    async function fetchMatches() {
      try {
        const res = await fetch('/api/matches?status=ongoing&page=1&page_size=100')
        if (!res.ok || cancelled) return
        const data: MatchListResponse = await res.json()
        if (!cancelled) setMatches(data.matches ?? [])
      } catch {
        // silently ignore poll failures
      }
    }

    const id = setInterval(fetchMatches, 5000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return { matches }
}
