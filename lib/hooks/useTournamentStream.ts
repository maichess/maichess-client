'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface TournamentSSEEvent {
  type: string
  data: Record<string, unknown>
}

export function useTournamentStream(
  id: string,
  onEvent: (event: TournamentSSEEvent) => void,
  enabled = true,
) {
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  const connect = useCallback(() => {
    if (!enabled) return undefined

    const source = new EventSource(`/api/tournaments/${id}/stream`)

    const handler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as Record<string, unknown>
        onEventRef.current({ type: e.type, data })
      } catch {
        // ignore malformed events
      }
    }

    source.addEventListener('tournamentStarted', handler)
    source.addEventListener('roundStarted', handler)
    source.addEventListener('gameStart', handler)
    source.addEventListener('roundFinished', handler)
    source.addEventListener('tournamentFinished', handler)

    return source
  }, [id, enabled])

  useEffect(() => {
    const source = connect()
    return () => source?.close()
  }, [connect])
}
