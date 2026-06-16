'use client'

import { useState, useEffect } from 'react'
import type { Opening } from '@/lib/models/tournament'

export function useTournamentOpenings() {
  const [openings, setOpenings] = useState<Opening[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tournaments/openings')
      .then((res) => (res.ok ? res.json() : { openings: [] }))
      .then((data: { openings?: Opening[] }) => setOpenings(data.openings ?? []))
      .catch(() => setOpenings([]))
      .finally(() => setLoading(false))
  }, [])

  return { openings, loading }
}
