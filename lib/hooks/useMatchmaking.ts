'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { QueueRequest } from '@/lib/models/queue'
import { ROUTES } from '@/lib/constants/routes'

type MatchmakingState = 'idle' | 'waiting' | 'matched' | 'error'

const POLL_INTERVAL_MS = 1500

export function useMatchmaking() {
  const router = useRouter()
  const [state, setState] = useState<MatchmakingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const queueTokenRef = useRef<string | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  const pollStatus = useCallback(
    async (token: string) => {
      try {
        const res = await fetch(`/api/queue/${token}/status`)
        if (!res.ok) {
          stopPolling()
          setState('error')
          setError('Lost connection to queue.')
          return
        }
        const data = await res.json()
        if (data.status === 'matched' && data.match_id) {
          setState('matched')
          stopPolling()
          router.push(ROUTES.match(data.match_id))
        } else {
          pollTimerRef.current = setTimeout(() => pollStatus(token), POLL_INTERVAL_MS)
        }
      } catch {
        stopPolling()
        setState('error')
        setError('Network error. Please try again.')
      }
    },
    [router, stopPolling]
  )

  async function joinQueue(request: QueueRequest) {
    setState('waiting')
    setError(null)
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      if (res.status === 409) {
        setState('error')
        setError('Already in queue. Please cancel first.')
        return
      }
      if (!res.ok) {
        setState('error')
        setError('Failed to join queue.')
        return
      }
      const { queue_token } = await res.json()
      queueTokenRef.current = queue_token
      pollStatus(queue_token)
    } catch {
      setState('error')
      setError('Network error. Please try again.')
    }
  }

  async function cancelQueue() {
    stopPolling()
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
