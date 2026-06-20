'use client'

import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import type { Match } from '@/lib/models/match'
import { usePendingMatch } from '@/lib/hooks/usePendingMatch'
import { ROUTES } from '@/lib/constants/routes'
import { WatchClient } from './WatchClient'

interface WatchBootstrapProps {
  id: string
  initialMatch: Match | null
}

// Optimistic shell for the spectator screen. Match creation is asynchronous (e.g.
// a bot-vs-bot game emits MatchCreated to Kafka and the read model materialises a
// moment later), but the client navigates to /watch/{id} as soon as it has the id,
// so the SSR read can legitimately miss. Rather than rendering a 404, we show a
// "loading" state and poll until the freshly-created match exists, only falling
// back to not-found once the polling budget is exhausted.
export function WatchBootstrap({ id, initialMatch }: WatchBootstrapProps) {
  const state = usePendingMatch(id, initialMatch)

  if (state.status === 'ready') {
    return <WatchClient initialMatch={state.match} />
  }

  if (state.status === 'not-found') {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold text-text-primary">Match not found</h1>
          <p className="mt-1 text-sm text-text-muted">
            This game doesn&apos;t exist or is no longer available.
          </p>
          <div className="mt-4 flex justify-center gap-3 text-sm">
            <Link href={ROUTES.watch} className="text-accent hover:underline">
              Watch games
            </Link>
            <Link href={ROUTES.dashboard} className="text-accent hover:underline">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="flex flex-col items-center gap-3 text-text-muted">
        <Loader2 className="animate-spin" size={28} />
        <p className="text-sm">Loading game…</p>
      </div>
    </div>
  )
}
