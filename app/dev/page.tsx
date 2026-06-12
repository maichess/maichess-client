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
        Anti-cheat review and arena concurrency. (Bot arena, all games, and search now live under{' '}
        <Link href={ROUTES.tools} className="text-accent hover:underline">
          Tools
        </Link>
        .)
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
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
