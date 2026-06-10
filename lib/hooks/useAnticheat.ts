'use client'

import { useCallback, useState } from 'react'
import type { CaseDetail, CaseListResponse, CaseStatus, CaseSummary } from '@/lib/models/anticheat'

// Data access for the Dev anti-cheat overview: list cases (optionally by status),
// load a case's full evidence, and clear a flag. All calls go through the
// /api/anticheat proxy routes (which inject the dev's bearer token).
export function useAnticheat() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listCases = useCallback(async (status: CaseStatus | 'all'): Promise<CaseSummary[]> => {
    setLoading(true)
    setError(null)
    try {
      const query = status === 'all' ? '' : `?status=${status}`
      const res = await fetch(`/api/anticheat/cases${query}`)
      if (!res.ok) {
        setError('Failed to load cases.')
        return []
      }
      const data: CaseListResponse = await res.json()
      return data.cases
    } catch {
      setError('Network error.')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getCase = useCallback(async (caseId: string): Promise<CaseDetail | null> => {
    setError(null)
    try {
      const res = await fetch(`/api/anticheat/cases/${caseId}`)
      if (!res.ok) {
        setError('Failed to load case.')
        return null
      }
      return await res.json()
    } catch {
      setError('Network error.')
      return null
    }
  }, [])

  const unflag = useCallback(async (caseId: string, reason: string): Promise<boolean> => {
    setError(null)
    try {
      const res = await fetch(`/api/anticheat/cases/${caseId}/unflag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) {
        setError(res.status === 409 ? 'Case is not currently flagged.' : 'Failed to remove flag.')
        return false
      }
      return true
    } catch {
      setError('Network error.')
      return false
    }
  }, [])

  return { loading, error, listCases, getCase, unflag }
}
