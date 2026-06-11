import Link from 'next/link'
import { requireDevUser } from '@/lib/utils/serverUser'
import { ROUTES } from '@/lib/constants/routes'
import { ConcurrencyControl } from '@/lib/components/dev/ConcurrencyControl'

export default async function DevPage() {
  await requireDevUser()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">Dev tools</h1>
      <p className="text-sm text-text-muted mb-8">
        Bot arena, game tools, and diagnostics.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={ROUTES.arenaNew}
          className="rounded-2xl border border-border bg-bg-secondary p-6 hover:border-accent/50 hover:bg-bg-elevated transition-all group"
        >
          <h2 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
            Spawn setup
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Create a tournament, matrix, or single bot match-up.
          </p>
        </Link>

        <Link
          href={ROUTES.arenaList}
          className="rounded-2xl border border-border bg-bg-secondary p-6 hover:border-accent/50 hover:bg-bg-elevated transition-all group"
        >
          <h2 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
            Results
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Browse finished and running arena collections.
          </p>
        </Link>

        <Link
          href={ROUTES.gamesDev}
          className="rounded-2xl border border-border bg-bg-secondary p-6 hover:border-accent/50 hover:bg-bg-elevated transition-all group"
        >
          <h2 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
            All games
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Global chronological feed of every game, filterable by player and initiator.
          </p>
        </Link>

        <Link
          href={ROUTES.searchDev}
          className="rounded-2xl border border-border bg-bg-secondary p-6 hover:border-accent/50 hover:bg-bg-elevated transition-all group"
        >
          <h2 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
            Search
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Faceted game / match search and FEN position lookup.
          </p>
        </Link>

        <Link
          href={ROUTES.anticheatDev}
          className="rounded-2xl border border-border bg-bg-secondary p-6 hover:border-accent/50 hover:bg-bg-elevated transition-all group"
        >
          <h2 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
            Anti-cheat
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Review flagged players and their evidence; clear false positives.
          </p>
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-bg-secondary p-6">
        <h2 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wider">
          Arena concurrency
        </h2>
        <ConcurrencyControl />
      </div>
    </div>
  )
}
