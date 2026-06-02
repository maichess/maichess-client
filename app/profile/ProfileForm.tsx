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
  const { user, updateUsername, setDevMode, loading, error, devModeError, success } = useProfile(initialUser)
  const { logout } = useAuth()
  const [newUsername, setNewUsername] = useState(user.username)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newUsername === user.username) return
    await updateUsername(newUsername)
  }

  return (
    <div className="flex flex-col gap-6">
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

    <div className="rounded-xl border border-border px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-secondary">Developer mode</p>
          <p className="text-[11px] text-text-muted mt-0.5">
            Bot arena &amp; dev tools
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={user.dev_mode}
          aria-label="Developer mode"
          onClick={() => setDevMode(!user.dev_mode)}
          className={[
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            user.dev_mode ? 'bg-accent border-accent' : 'bg-text-muted/30 border-text-muted/40',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block size-5 transform rounded-full bg-white shadow transition-transform',
              user.dev_mode ? 'translate-x-5' : 'translate-x-0.5',
            ].join(' ')}
          />
        </button>
      </div>
      {devModeError && (
        <p className="mt-2 text-xs text-danger">{devModeError}</p>
      )}
    </div>
    </div>
  )
}
