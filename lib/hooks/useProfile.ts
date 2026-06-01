'use client'

import { useState } from 'react'
import type { User } from '@/lib/models/user'

export function useProfile(initialUser: User) {
  const [user, setUser] = useState<User>(initialUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function patchProfile(body: Record<string, unknown>): Promise<User | null> {
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 409) {
      setError('Username already taken.')
      return null
    }
    if (res.status === 422) {
      setError('Invalid username format.')
      return null
    }
    if (!res.ok) {
      setError('Something went wrong. Please try again.')
      return null
    }
    return res.json()
  }

  async function updateUsername(username: string) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await patchProfile({ username })
      if (updated) {
        setUser(updated)
        setSuccess(true)
      }
    } finally {
      setLoading(false)
    }
  }

  async function setDevMode(devMode: boolean) {
    setError(null)
    setSuccess(false)
    const previous = user
    setUser({ ...user, dev_mode: devMode })
    const updated = await patchProfile({ dev_mode: devMode })
    setUser(updated ?? previous)
  }

  return { user, updateUsername, setDevMode, loading, error, success }
}
