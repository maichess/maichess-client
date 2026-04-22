'use client'

import { useState } from 'react'
import type { User } from '@/lib/models/user'
import { useProfile } from '@/lib/hooks/useProfile'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/lib/components/ui/Button'
import { Input } from '@/lib/components/ui/Input'

interface ProfileFormProps {
  initialUser: User
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const { user, updateUsername, loading, error, success } = useProfile(initialUser)
  const { logout } = useAuth()
  const [newUsername, setNewUsername] = useState(user.username)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newUsername === user.username) return
    await updateUsername(newUsername)
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-secondary p-6">
      <h2 className="mb-4 text-sm font-semibold text-text-muted uppercase tracking-wider">
        Account
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="username"
          label="Username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          minLength={3}
          maxLength={32}
          error={error ?? undefined}
          required
        />

        {success && (
          <p className="rounded-lg bg-accent/10 border border-accent/20 px-3 py-2 text-sm text-accent">
            Username updated successfully.
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button
            type="submit"
            loading={loading}
            disabled={newUsername === user.username}
          >
            Save changes
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </form>
    </div>
  )
}
