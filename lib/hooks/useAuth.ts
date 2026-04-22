'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ROUTES } from '@/lib/constants/routes'

interface AuthError {
  message: string
  field?: 'username' | 'password'
}

export function useAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)

  async function login(username: string, password: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.status === 401) {
        setError({ message: 'Incorrect username or password.' })
        return
      }
      if (!res.ok) {
        setError({ message: 'Something went wrong. Please try again.' })
        return
      }
      router.push(ROUTES.dashboard)
    } finally {
      setLoading(false)
    }
  }

  async function register(username: string, password: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.status === 409) {
        setError({ message: 'Username already taken.', field: 'username' })
        return
      }
      if (res.status === 422) {
        setError({ message: 'Invalid username or password format.' })
        return
      }
      if (!res.ok) {
        setError({ message: 'Something went wrong. Please try again.' })
        return
      }
      router.push(ROUTES.dashboard)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(ROUTES.login)
    router.refresh()
  }

  return { login, register, logout, loading, error }
}
