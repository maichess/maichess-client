import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/lib/models/user'
import { ROUTES } from '@/lib/constants/routes'
import { ProfileForm } from './ProfileForm'

async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const res = await fetch(`${process.env.USER_SERVICE_URL}/users/me`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

export default async function ProfilePage() {
  const user = await getUser()
  if (!user) redirect(ROUTES.login)

  const total = user.wins + user.losses + user.draws

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <h1 className="mb-8 text-2xl font-bold text-text-primary">Profile</h1>

        {/* Stats */}
        <div className="mb-8 rounded-2xl border border-border bg-bg-secondary p-6">
          <h2 className="mb-4 text-sm font-semibold text-text-muted uppercase tracking-wider">
            Statistics
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="text-3xl font-bold text-accent tabular-nums">{user.elo}</div>
              <div className="text-xs text-text-muted mt-0.5">ELO</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-text-primary tabular-nums">{user.wins}</div>
              <div className="text-xs text-text-muted mt-0.5">Wins</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-text-primary tabular-nums">{user.losses}</div>
              <div className="text-xs text-text-muted mt-0.5">Losses</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-text-primary tabular-nums">{user.draws}</div>
              <div className="text-xs text-text-muted mt-0.5">Draws</div>
            </div>
          </div>

          {total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>{Math.round((user.wins / total) * 100)}% win rate</span>
                <span>{total} games</span>
              </div>
              <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${(user.wins / total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Edit form */}
        <ProfileForm initialUser={user} />
    </div>
  )
}
