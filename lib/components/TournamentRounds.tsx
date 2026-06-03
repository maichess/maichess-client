'use client'

import { useState, useCallback } from 'react'
import { TournamentGameCard } from './TournamentGameCard'
import { Spinner } from '@/lib/components/ui/Spinner'
import type { RoundPairingsResponse } from '@/lib/models/tournament'

interface Props {
  tournamentId: string
  nbRounds: number
  currentRound?: number
}

export function TournamentRounds({ tournamentId, nbRounds, currentRound }: Props) {
  const [selectedRound, setSelectedRound] = useState(currentRound ?? 1)
  const [pairings, setPairings] = useState<RoundPairingsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchedKey, setFetchedKey] = useState('')

  const key = `${tournamentId}:${selectedRound}`

  const fetchRound = useCallback(async (tid: string, round: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tournaments/${tid}/rounds/${round}`)
      if (!res.ok) {
        setPairings(null)
        return
      }
      const data = await res.json() as RoundPairingsResponse
      setPairings(data)
    } finally {
      setLoading(false)
    }
  }, [])

  if (fetchedKey !== key) {
    setFetchedKey(key)
    fetchRound(tournamentId, selectedRound)
  }

  const rounds = Array.from({ length: nbRounds }, (_, i) => i + 1)

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-1 overflow-x-auto">
        {rounds.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRound(r)}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition-all shrink-0',
              selectedRound === r
                ? 'bg-accent text-white'
                : r === currentRound
                  ? 'border border-accent/40 text-accent hover:bg-accent/10'
                  : 'border border-border text-text-muted hover:border-accent/40',
            ].join(' ')}
          >
            Round {r}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      )}

      {!loading && pairings && pairings.pairings.length > 0 && (
        <ul className="space-y-2">
          {pairings.pairings.map((p, i) => (
            <li key={p.gameId ?? i}>
              <TournamentGameCard pairing={p} />
            </li>
          ))}
        </ul>
      )}

      {!loading && pairings && pairings.pairings.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4">
          No pairings for this round yet.
        </p>
      )}

      {!loading && !pairings && (
        <p className="text-sm text-text-muted text-center py-4">
          Round data not available.
        </p>
      )}
    </div>
  )
}
