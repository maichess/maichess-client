'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  AnalysisKind,
  CorpusFilter,
  InsightsJob,
  JobsResponse,
  UploadResponse,
} from '@/lib/models/insights'

const POLL_INTERVAL_MS = 4000

export interface IngestionRequest {
  lichess_month?: { year_month: string }
  upload?: { object_key: string; label?: string }
  filter?: CorpusFilter
}

export interface AnalysisRequest {
  corpus_id: string
  kinds?: AnalysisKind[]
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Request failed.')
  return data as T
}

/**
 * Drives the Insights job panel: lists `GET /insights/jobs` (newest first) and lightly
 * polls while any job is still `pending`/`running`, plus exposes the submission actions
 * (PGN upload → ingestion, Lichess-month ingestion, and analysis runs). The submit
 * helpers refresh the list and start polling so a freshly launched job appears live.
 */
export function useInsightsJobs() {
  const [jobs, setJobs] = useState<InsightsJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const load = useCallback(async (spinner: boolean) => {
    if (spinner) setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/insights/jobs?limit=50', { cache: 'no-store' })
      if (!res.ok) {
        setError('Failed to load jobs.')
        return
      }
      const data = (await res.json()) as JobsResponse
      setJobs(data.jobs ?? [])
    } catch {
      setError('Network error.')
    } finally {
      if (spinner) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(true)
  }, [load])

  // Poll only while there is in-flight work; stop once everything settles.
  const active = jobs.some((j) => j.status === 'pending' || j.status === 'running')
  const loadRef = useRef(load)
  loadRef.current = load
  useEffect(() => {
    if (!active) return
    const handle = setInterval(() => void loadRef.current(false), POLL_INTERVAL_MS)
    return () => clearInterval(handle)
  }, [active])

  const run = useCallback(
    async <T>(action: () => Promise<T>): Promise<T | null> => {
      setSubmitting(true)
      setSubmitError(null)
      try {
        const result = await action()
        await load(false)
        return result
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : 'Request failed.')
        return null
      } finally {
        setSubmitting(false)
      }
    },
    [load],
  )

  const submitIngestion = useCallback(
    (body: IngestionRequest) => run(() => postJson<InsightsJob>('/api/insights/ingestions', body)),
    [run],
  )

  const submitAnalysis = useCallback(
    (body: AnalysisRequest) => run(() => postJson<InsightsJob>('/api/insights/analyses', body)),
    [run],
  )

  // Stage a PGN, then immediately submit an ingestion pointed at the stored object.
  const uploadAndIngest = useCallback(
    (file: File, label: string, filter?: CorpusFilter) =>
      run(async () => {
        const form = new FormData()
        form.set('file', file)
        if (label) form.set('label', label)
        const res = await fetch('/api/insights/uploads', { method: 'POST', body: form })
        const data = (await res.json().catch(() => ({}))) as UploadResponse & { error?: string }
        if (!res.ok) throw new Error(data.error ?? 'Upload failed.')
        return postJson<InsightsJob>('/api/insights/ingestions', {
          upload: { object_key: data.object_key, label },
          filter,
        })
      }),
    [run],
  )

  return {
    jobs,
    loading,
    error,
    submitting,
    submitError,
    refresh: () => load(true),
    submitIngestion,
    submitAnalysis,
    uploadAndIngest,
  }
}
