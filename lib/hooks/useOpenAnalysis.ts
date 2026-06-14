'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

// Opens the analysis view for a row in a result list. Two entry points:
//   - openGame:  the id is already an analysis game id → navigate straight there.
//   - openMatch: the id is a match id → import it via POST /api/games/from-match/:id
//     (the same flow Past Matches uses), then navigate to the resulting game.
// Pass `readonly` to deep-link with `?analysis=off` so the viewer opens engine-off.
// `pending` holds the id currently being opened so a row can show a spinner.
export function useOpenAnalysis() {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)

  const target = (gameId: string, readonly: boolean) =>
    ROUTES.analysisGame(gameId) + (readonly ? '?analysis=off' : '')

  const openGame = useCallback(
    (gameId: string, opts?: { readonly?: boolean }) => {
      router.push(target(gameId, opts?.readonly ?? false))
    },
    [router],
  )

  const openMatch = useCallback(
    async (matchId: string, opts?: { readonly?: boolean }) => {
      setPending(matchId)
      try {
        const res = await fetch(`/api/games/from-match/${matchId}`, { method: 'POST' })
        if (!res.ok) return
        const game: { id: string } = await res.json()
        router.push(target(game.id, opts?.readonly ?? false))
      } finally {
        setPending(null)
      }
    },
    [router],
  )

  return { openGame, openMatch, pending }
}
