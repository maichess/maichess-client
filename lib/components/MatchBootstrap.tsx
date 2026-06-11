'use client'

import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import type { Match } from '@/lib/models/match'
import { usePendingMatch } from '@/lib/hooks/usePendingMatch'
import { ROUTES } from '@/lib/constants/routes'
import { MatchClient } from './MatchClient'

interface MatchBootstrapProps {
  id: string
  initialMatch: Match | null
  viewerUserId: string | null
}

// Optimistic shell for the play screen: when the match document is already
// materialised (SSR fetch hit) it renders the live board immediately; otherwise
// it shows a "starting" state and polls until the freshly-created match exists,
// only falling back to a not-found state once the budget is exhausted.
export function MatchBootstrap({ id, initialMatch, viewerUserId }: MatchBootstrapProps) {
  const state = usePendingMatch(id, initialMatch)

  if (state.status === 'ready') {
    return <MatchClient initialMatch={state.match} viewerUserId={viewerUserId} />
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
            <Link href={ROUTES.dashboard} className="text-accent hover:underline">
              Back to dashboard
            </Link>
            <Link href={ROUTES.watch} className="text-accent hover:underline">
              Watch games
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
        <p className="text-sm">Setting up your game…</p>
      </div>
    </div>
  )
}
