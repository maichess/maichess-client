'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/lib/components/ui/Button'
import { Input } from '@/lib/components/ui/Input'
import { ROUTES } from '@/lib/constants/routes'

export default function RegisterPage() {
  const { register, loading, error } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await register(username, password)
  }

  const usernameError = error?.field === 'username' ? error.message : undefined

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-5xl">♟</span>
          <h1 className="mt-3 text-2xl font-bold text-text-primary">maichess</h1>
          <p className="mt-1 text-sm text-text-muted">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="username"
            label="Username"
            type="text"
            placeholder="alice"
            autoComplete="username"
            minLength={3}
            maxLength={32}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={usernameError}
            required
          />
          <div className="flex flex-col gap-1.5">
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-text-muted">Minimum 8 characters</p>
          </div>

          {error && !error.field && (
            <p className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
              {error.message}
            </p>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link href={ROUTES.login} className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
