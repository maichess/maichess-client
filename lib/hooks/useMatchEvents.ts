'use client'

import { useEffect } from 'react'
import type { MoveEvent, MatchEndedEvent } from '@/lib/models/match'

export function useMatchEvents(
  matchId: string,
  onMove: (event: MoveEvent) => void,
  onEnd: (event: MatchEndedEvent) => void
) {
  useEffect(() => {
    const es = new EventSource(`/api/matches/${matchId}/events`)

    es.addEventListener('move_made', (e) => {
      try {
        onMove(JSON.parse(e.data) as MoveEvent)
      } catch {
        // ignore malformed event
      }
    })

    es.addEventListener('match_ended', (e) => {
      try {
        onEnd(JSON.parse(e.data) as MatchEndedEvent)
      } catch {
        // ignore malformed event
      }
      es.close()
    })

    es.onerror = () => {
      es.close()
    }

    return () => es.close()
  }, [matchId, onMove, onEnd])
}
