'use client'

import { useCallback, useState } from 'react'
import type { AnalysisGame } from '@/lib/models/analysis'

interface GameLibraryPage {
  games: AnalysisGame[]
  total: number
  page: number
  page_size: number
}

export function useGameLibrary(initialPage: GameLibraryPage) {
  const [data, setData] = useState<GameLibraryPage>(initialPage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPage = useCallback(async (page: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/games?page=${page}&page_size=${initialPage.page_size}`)
      if (!res.ok) {
        setError('Failed to load games.')
        return
      }
      const json: GameLibraryPage = await res.json()
      setData(json)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [initialPage.page_size])

  const totalPages = Math.max(1, Math.ceil(data.total / data.page_size))

  function nextPage() {
    if (data.page < totalPages) fetchPage(data.page + 1)
  }

  function prevPage() {
    if (data.page > 1) fetchPage(data.page - 1)
  }

  const refresh = useCallback(() => fetchPage(data.page), [data.page, fetchPage])

  return { data, loading, error, nextPage, prevPage, totalPages, refresh }
}
