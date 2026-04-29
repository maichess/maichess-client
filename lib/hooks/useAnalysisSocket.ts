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
