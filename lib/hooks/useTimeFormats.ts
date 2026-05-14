'use client'

import { useEffect, useState } from 'react'
import type { TimeFormat } from '@/lib/models/match'
import type { TimeFormatsResponse } from '@/lib/models/queue'

let cache: TimeFormat[] | null = null
let inflight: Promise<TimeFormat[]> | null = null

async function fetchFormats(): Promise<TimeFormat[]> {
  if (cache) return cache
  if (inflight) return inflight

  inflight = fetch('/api/time-formats')
    .then((res) => res.json() as Promise<TimeFormatsResponse>)
    .then((data) => {
      cache = data.formats
      return cache
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function useTimeFormats() {
  const [formats, setFormats] = useState<TimeFormat[]>(cache ?? [])
  const [loading, setLoading] = useState(cache === null)

  useEffect(() => {
    if (cache) return
    let cancelled = false
    fetchFormats().then((f) => {
      if (!cancelled) {
        setFormats(f)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { formats, loading }
}
