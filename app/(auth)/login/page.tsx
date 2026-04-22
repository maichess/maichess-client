'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/lib/components/ui/Button'
import { Input } from '@/lib/components/ui/Input'
import { ROUTES } from '@/lib/constants/routes'

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await login(username, password)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-5xl">♟</span>
          <h1 className="mt-3 text-2xl font-bold text-text-primary">maichess</h1>
          <p className="mt-1 text-sm text-text-muted">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="username"
            label="Username"
            type="text"
            placeholder="alice"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
              {error.message}
            </p>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Don&apos;t have an account?{' '}
          <Link href={ROUTES.register} className="text-accent hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
