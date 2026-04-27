'use client'

import { useState, useEffect } from 'react'
import type { Bot } from '@/lib/models/bot'

export function useBots() {
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bots')
      .then((res) => res.json())
      .then((data: { bots: Bot[] }) => setBots(data.bots))
      .finally(() => setLoading(false))
  }, [])

  return { bots, loading }
}
