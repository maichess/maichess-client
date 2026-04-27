'use client'

import { useEffect } from 'react'
import type { MoveEvent, MatchEndedEvent } from '@/lib/models/match'
import { getSocket } from './useSocket'

export function useMatchEvents(
  matchId: string,
  onMove: (event: MoveEvent) => void,
  onEnd: (event: MatchEndedEvent) => void
) {
  useEffect(() => {
    const socket = getSocket()

    function handleMove(event: MoveEvent) {
      onMove(event)
    }

    function handleEnd(event: MatchEndedEvent) {
      onEnd(event)
    }

    socket.on('move_made', handleMove)
    socket.on('match_ended', handleEnd)

    return () => {
      socket.off('move_made', handleMove)
      socket.off('match_ended', handleEnd)
    }
  }, [matchId, onMove, onEnd])
}
