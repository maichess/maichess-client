'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Corpus, CorporaResponse } from '@/lib/models/insights'

// Loads the analyzed-corpus catalog (newest first) from the insights query API.
// The landing page lists these as the entry points into the explorer.
export function useCorpora() {
  const [corpora, setCorpora] = useState<Corpus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/insights/corpora?limit=100', { cache: 'no-store' })
      if (!res.ok) {
        setError('Failed to load corpora.')
        return
      }
      const data = (await res.json()) as CorporaResponse
      setCorpora(data.corpora ?? [])
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { corpora, loading, error, refresh: load }
}
