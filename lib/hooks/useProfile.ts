'use client'

import { useState } from 'react'
import type { User } from '@/lib/models/user'

export function useProfile(initialUser: User) {
  const [user, setUser] = useState<User>(initialUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function updateUsername(username: string) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      if (res.status === 409) {
        setError('Username already taken.')
        return
      }
      if (res.status === 422) {
        setError('Invalid username format.')
        return
      }
      if (!res.ok) {
        setError('Something went wrong. Please try again.')
        return
      }
      const updated: User = await res.json()
      setUser(updated)
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  return { user, updateUsername, loading, error, success }
}
