'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CreateCollectionRequest, Collection } from '@/lib/models/arena'
import { ROUTES } from '@/lib/constants/routes'

export function useCreateArenaSetup() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function create(body: CreateCollectionRequest) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/dev/arena/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to create setup.' }))
        setError(data.error ?? `Error ${res.status}`)
        return
      }
      const collection = (await res.json()) as Collection
      router.push(ROUTES.arenaCollection(collection.id))
    } catch {
      setError('Network error.')
    } finally {
      setSubmitting(false)
    }
  }

  return { create, submitting, error }
}
