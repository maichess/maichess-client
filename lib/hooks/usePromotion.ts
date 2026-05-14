'use client'

import { useCallback, useState } from 'react'

export interface PendingPromotion {
  from: string
  to: string
  color: 'w' | 'b'
}

export function usePromotion() {
  const [pending, setPending] = useState<PendingPromotion | null>(null)

  const requestPromotion = useCallback((from: string, to: string, color: 'w' | 'b') => {
    setPending({ from, to, color })
  }, [])

  const clearPromotion = useCallback(() => {
    setPending(null)
  }, [])

  return { pendingPromotion: pending, requestPromotion, clearPromotion }
}
