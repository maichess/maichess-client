'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useOngoingMatches } from '@/lib/hooks/useOngoingMatches'
import { GlobeSkeleton } from './GlobeSkeleton'
import { MatchInfoCard } from './MatchInfoCard'
import type { MatchSummary } from '@/lib/models/match'

const GlobeInner = dynamic(
  () => import('./GlobeInner').then((m) => ({ default: m.GlobeInner })),
  { ssr: false, loading: () => <GlobeSkeleton /> },
)

interface Props {
  initialMatches: MatchSummary[]
}

export function GlobeView({ initialMatches }: Props) {
  const { matches } = useOngoingMatches(initialMatches)
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  const selectedMatch = selectedMatchId ? matches.find((m) => m.id === selectedMatchId) ?? null : null

  return (
    <div className="relative flex-1 flex flex-col w-full" style={{ background: '#0a0a16' }}>
      <GlobeInner
        matches={matches}
        onMatchSelect={setSelectedMatchId}
        selectedMatchId={selectedMatchId}
      />

      <div
        className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
        style={{ background: 'rgba(10,10,22,0.7)', color: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(91,141,217,0.25)' }}
      >
        <span className="inline-block size-1.5 rounded-full animate-pulse" style={{ background: '#5b8dd9' }} />
        {matches.length} live game{matches.length === 1 ? '' : 's'}
      </div>

      {selectedMatch && (
        <MatchInfoCard match={selectedMatch} onClose={() => setSelectedMatchId(null)} />
      )}
    </div>
  )
}
