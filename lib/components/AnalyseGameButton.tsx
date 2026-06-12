'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { Button } from './ui/Button'

interface AnalyseGameButtonProps {
  matchId: string
  className?: string
}

/**
 * Opens the analysis view for a finished match. Reuses the same import-from-match
 * flow as the Past Matches list: POST /api/games/from-match/:id returns (or creates)
 * the analysis game, then we navigate to it. Shown under the game-result banner in
 * the Match and Watch views.
 */
export function AnalyseGameButton({ matchId, className }: AnalyseGameButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function openAnalysis() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/games/from-match/${matchId}`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Could not open analysis.' }))
        setError(body.error ?? 'Could not open analysis.')
        return
      }
      const game: { id: string } = await res.json()
      router.push(ROUTES.analysisGame(game.id))
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <Button variant="secondary" className="w-full" onClick={openAnalysis} loading={loading}>
        Show analysis
      </Button>
      {error && <p className="mt-1 text-xs text-danger text-center">{error}</p>}
    </div>
  )
}
