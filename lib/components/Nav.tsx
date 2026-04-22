import { cookies } from 'next/headers'
import Link from 'next/link'
import { ThemeSelector } from './ThemeSelector'
import { ROUTES } from '@/lib/constants/routes'
import type { User } from '@/lib/models/user'

async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  try {
    const res = await fetch(`${process.env.USER_SERVICE_URL}/users/me`, {
      headers: { Cookie: cookieStore.toString() },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function Nav() {
  const user = await getUser()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-secondary/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href={ROUTES.dashboard}
          className="flex items-center gap-2 font-semibold text-text-primary tracking-tight hover:text-accent transition-colors"
        >
          <span className="text-xl">♟</span>
          <span>maichess</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href={ROUTES.play}
            className="rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            Play
          </Link>
          {user && (
            <Link
              href={ROUTES.profile}
              className="rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            >
              Profile
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:flex items-center gap-1.5 text-sm text-text-muted">
              <span className="size-6 flex items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-semibold">
                {user.username[0].toUpperCase()}
              </span>
              <span className="text-text-secondary">{user.username}</span>
              <span className="text-xs text-text-muted">·</span>
              <span className="text-xs text-text-muted">{user.elo}</span>
            </span>
          )}
          <ThemeSelector />
        </div>
      </div>
    </header>
  )
}
