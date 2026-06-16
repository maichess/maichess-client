'use client'

import { useCallback, useEffect, useState } from 'react'

// Generic loader for a corpus sub-resource (summary / openings / endgames / positions /
// tricky). Each explorer tab calls this with its view name and its own query params; the
// hook refetches whenever the corpus, view, or serialized params change. A 404 surfaces a
// "not materialized yet" hint rather than a hard error so partial analyses degrade nicely.
export function useCorpusResource<T>(
  corpusId: string,
  view: string,
  params: Record<string, string> = {},
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value)
  }
  const queryString = query.toString()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setMissing(false)
    try {
      const url = `/api/insights/corpora/${encodeURIComponent(corpusId)}/${view}${
        queryString ? `?${queryString}` : ''
      }`
      const res = await fetch(url, { cache: 'no-store' })
      if (res.status === 404) {
        setMissing(true)
        setData(null)
        return
      }
      if (!res.ok) {
        setError('Failed to load.')
        return
      }
      setData((await res.json()) as T)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [corpusId, view, queryString])

  useEffect(() => {
    void load()
  }, [load])

  return { data, loading, error, missing, reload: load }
}
