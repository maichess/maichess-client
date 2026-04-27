'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { QueueRequest } from '@/lib/models/queue'
import { ROUTES } from '@/lib/constants/routes'
import { getSocket } from './useSocket'

type MatchmakingState = 'idle' | 'waiting' | 'matched' | 'error'

export function useMatchmaking() {
  const router = useRouter()
  const [state, setState] = useState<MatchmakingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const queueTokenRef = useRef<string | null>(null)

  const stopListening = useCallback(() => {
    const socket = getSocket()
    socket.off('matched')
  }, [])

  const startListening = useCallback(() => {
    const socket = getSocket()
    socket.once('matched', (data: { match_id: string }) => {
      setState('matched')
      router.push(ROUTES.match(data.match_id))
    })
  }, [router])

  async function joinQueue(request: QueueRequest) {
    setState('waiting')
    setError(null)

    // Ensure the socket is fully connected (and registered in userSockets on
    // the server) before sending the request. For bot matches the 'matched'
    // event is emitted immediately, so the user must already be reachable.
    const socket = getSocket()
    if (!socket.connected) {
      await new Promise<void>((resolve) => socket.once('connect', resolve))
    }

    startListening()
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      if (res.status === 409) {
        stopListening()
        setState('error')
        setError('Already in queue. Please cancel first.')
        return
      }
      if (!res.ok) {
        stopListening()
        setState('error')
        setError('Failed to join queue.')
        return
      }
      const { queue_token, match_id } = await res.json()
      queueTokenRef.current = queue_token
      if (match_id) {
        stopListening()
        router.push(ROUTES.match(match_id))
        return
      }
    } catch {
      stopListening()
      setState('error')
      setError('Network error. Please try again.')
    }
  }

  async function cancelQueue() {
    stopListening()
    const token = queueTokenRef.current
    if (token) {
      await fetch(`/api/queue/${token}`, { method: 'DELETE' }).catch(() => {})
      queueTokenRef.current = null
    }
    setState('idle')
    setError(null)
  }

  return { state, error, joinQueue, cancelQueue }
}
