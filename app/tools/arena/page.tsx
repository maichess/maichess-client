import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireUser } from '@/lib/utils/serverUser'
import { ROUTES } from '@/lib/constants/routes'
import { ArenaCollectionList } from '@/lib/components/dev/ArenaCollectionList'

export default async function ArenaListPage() {
  await requireUser()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-text-primary">Bot Arena</h1>
          <p className="max-w-2xl text-sm text-text-muted">
            See how the bots actually compare. The arena plays bots against each other so you
            can measure their relative strength instead of guessing from their ratings. Spawn a{' '}
            <span className="text-text-secondary">tournament</span> (round-robin between several
            bots), a <span className="text-text-secondary">matrix</span> (every bot against every
            other across a list of starting positions), or a single{' '}
            <span className="text-text-secondary">head-to-head</span> match-up. Every pairing is
            played best-of-3 with alternating colours to keep it fair, runs on the platform&apos;s
            shared concurrency budget, and reports per-bot scores and win/draw/loss records when
            it finishes.
          </p>
        </div>
        <Link
          href={ROUTES.arenaNew}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          <Plus size={16} />
          Spawn setup
        </Link>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
        Results
      </h2>
      <ArenaCollectionList />
    </div>
  )
}
