'use client'

import { useCallback, useState } from 'react'

export interface Premove {
  from: string
  to: string
  promotion?: string
}

export function usePremove() {
  const [premove, setPremove] = useState<Premove | null>(null)
  const [premoveSource, setPremoveSource] = useState<string | null>(null)

  const queuePremove = useCallback((from: string, to: string, promotion?: string) => {
    setPremove({ from, to, promotion })
    setPremoveSource(null)
  }, [])

  const selectPremoveSource = useCallback((square: string | null) => {
    setPremoveSource(square)
    setPremove(null)
  }, [])

  const clearPremove = useCallback(() => {
    setPremove(null)
    setPremoveSource(null)
  }, [])

  return { premove, premoveSource, queuePremove, selectPremoveSource, clearPremove }
}
