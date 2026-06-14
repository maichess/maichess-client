'use client'

import { useEffect } from 'react'
import type { AnalysisLine } from '@/lib/models/analysis'
import { getSocket } from './useSocket'

interface AnalysisUpdateEvent {
  session_id: string
  depth: number
  lines: AnalysisLine[]
}

interface AnalysisCompleteEvent {
  session_id: string
  final_depth: number
}

interface AnalysisErrorEvent {
  session_id: string
  message: string
}

// A client-initiated cancel (navigation restarting the engine stream) surfaces as a
// gRPC "Cancelled" status. It is expected, not a failure, so it must never reach the UI.
function isCancellationMessage(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes('cancelled') ||
    m.includes('canceled') ||
    m.includes('operationcanceledexception')
  )
}

export function useAnalysisSocket(
  activeSessionId: string | null,
  onUpdate: (depth: number, lines: AnalysisLine[]) => void,
  onComplete: () => void,
  onError: (message: string) => void
) {
  useEffect(() => {
    const socket = getSocket()

    function handleUpdate(data: AnalysisUpdateEvent) {
      if (data.session_id !== activeSessionId) return
      onUpdate(data.depth, data.lines)
    }

    function handleComplete(data: AnalysisCompleteEvent) {
      if (data.session_id !== activeSessionId) return
      onComplete()
    }

    function handleError(data: AnalysisErrorEvent) {
      if (data.session_id !== activeSessionId) return
      if (isCancellationMessage(data.message)) return
      onError(data.message)
    }

    socket.on('analysis_update', handleUpdate)
    socket.on('analysis_complete', handleComplete)
    socket.on('analysis_error', handleError)

    return () => {
      socket.off('analysis_update', handleUpdate)
      socket.off('analysis_complete', handleComplete)
      socket.off('analysis_error', handleError)
    }
  }, [activeSessionId, onUpdate, onComplete, onError])
}
