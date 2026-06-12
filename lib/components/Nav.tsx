import Link from 'next/link'
import { ThemeSelector } from './ThemeSelector'
import { PawnIcon } from './icons/PawnIcon'
import { ROUTES } from '@/lib/constants/routes'
import { getServerUser } from '@/lib/utils/serverUser'

export async function Nav() {
  const user = await getServerUser()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-secondary/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href={ROUTES.dashboard}
          className="flex items-center gap-2 font-semibold text-text-primary tracking-tight hover:text-accent transition-colors"
        >
          <PawnIcon size={20} />
          <span>maichess</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href={ROUTES.play}
            className="rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            Play
          </Link>
          <Link
            href={ROUTES.watch}
            className="rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            Watch
          </Link>
          <Link
            href={ROUTES.tournaments}
            className="rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            Tournaments
          </Link>
          <Link
            href={ROUTES.analysis}
            className="rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            Analyse
          </Link>
          {user && (
            <Link
              href={ROUTES.tools}
              className="rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            >
              Tools
            </Link>
          )}
          {user?.dev_mode && (
            <Link
              href={ROUTES.dev}
              className="rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            >
              Dev
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <Link
              href={ROUTES.profile}
              aria-label="Your profile"
              className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-sm text-text-muted hover:bg-bg-elevated transition-colors"
            >
              <span className="size-6 flex items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-semibold">
                {user.username[0].toUpperCase()}
              </span>
              <span className="hidden sm:inline text-text-secondary hover:text-text-primary transition-colors">
                {user.username}
              </span>
              <span className="hidden sm:inline text-xs text-text-muted">·</span>
              <span className="hidden sm:inline text-xs text-text-muted">{user.elo}</span>
            </Link>
          )}
          <ThemeSelector />
        </div>
      </div>
    </header>
  )
}
