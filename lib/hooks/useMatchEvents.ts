'use client'

import { useEffect } from 'react'
import type {
  MoveEvent,
  MatchEndedEvent,
  DrawOfferedEvent,
  DrawDeclinedEvent,
} from '@/lib/models/match'
import { getSocket } from './useSocket'

interface MatchEventHandlers {
  onMove: (event: MoveEvent) => void
  onEnd: (event: MatchEndedEvent) => void
  onDrawOffered?: (event: DrawOfferedEvent) => void
  onDrawDeclined?: (event: DrawDeclinedEvent) => void
}

export function useMatchEvents(matchId: string, handlers: MatchEventHandlers) {
  const { onMove, onEnd, onDrawOffered, onDrawDeclined } = handlers

  useEffect(() => {
    const socket = getSocket()

    const subscribe = () => socket.emit('subscribe_match', { match_id: matchId })

    if (socket.connected) {
      subscribe()
    } else {
      socket.once('connect', subscribe)
    }

    socket.on('move_made', onMove)
    socket.on('match_ended', onEnd)
    if (onDrawOffered) socket.on('draw_offered', onDrawOffered)
    if (onDrawDeclined) socket.on('draw_declined', onDrawDeclined)

    return () => {
      socket.off('move_made', onMove)
      socket.off('match_ended', onEnd)
      if (onDrawOffered) socket.off('draw_offered', onDrawOffered)
      if (onDrawDeclined) socket.off('draw_declined', onDrawDeclined)
      socket.off('connect', subscribe)
      socket.emit('unsubscribe_match', { match_id: matchId })
    }
  }, [matchId, onMove, onEnd, onDrawOffered, onDrawDeclined])
}
