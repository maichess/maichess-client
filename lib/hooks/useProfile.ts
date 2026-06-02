'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/lib/models/user'

export function useProfile(initialUser: User) {
  const router = useRouter()
  const [user, setUser] = useState<User>(initialUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devModeError, setDevModeError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function patchProfile(body: Record<string, unknown>): Promise<{ user: User | null; status: number }> {
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return { user: null, status: res.status }
    return { user: (await res.json()) as User, status: res.status }
  }

  async function updateUsername(username: string) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const { user: updated, status } = await patchProfile({ username })
      if (updated) {
        setUser(updated)
        setSuccess(true)
      } else if (status === 409) {
        setError('Username already taken.')
      } else if (status === 422) {
        setError('Invalid username format.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function setDevMode(devMode: boolean) {
    setDevModeError(null)
    const previous = user
    setUser({ ...user, dev_mode: devMode })
    const { user: updated } = await patchProfile({ dev_mode: devMode })
    if (updated) {
      setUser(updated)
      router.refresh()
    } else {
      setUser(previous)
      setDevModeError('Failed to update developer mode.')
    }
  }

  return { user, updateUsername, setDevMode, loading, error, devModeError, success }
}
