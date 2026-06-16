'use client'

import { useState } from 'react'
import { useCorpusResource } from '@/lib/hooks/useCorpusResource'
import { Spinner } from '@/lib/components/ui/Spinner'
import { WinDrawLossBar } from '@/lib/components/insights/WinDrawLossBar'
import { Pagination } from '@/lib/components/insights/Pagination'
import type { EndgamesResponse } from '@/lib/models/insights'
import { formatCount, pct } from '@/lib/utils/insightsFormat'

const PAGE_SIZE = 50

// Endgame material signatures by frequency with their conversion tendency — how often the
// stronger side wins vs draws vs loses (insights_endgames).
export function EndgamesView({ corpusId }: { corpusId: string }) {
  const [offset, setOffset] = useState(0)
  const { data, loading, missing, error } = useCorpusResource<EndgamesResponse>(corpusId, 'endgames', {
    limit: String(PAGE_SIZE),
    offset: String(offset),
  })

  const endgames = data?.endgames ?? []

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        A position is an endgame at ≤ 7 pieces. The signature is the canonical multiset of non-king
        pieces per side, stronger side first (e.g. <span className="font-mono">KRPvKR</span>).
        Conversion is from the stronger side&apos;s perspective.
      </p>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="md" /></div>
      ) : missing ? (
        <Empty>No endgames materialized yet — run the endgames analysis for this corpus.</Empty>
      ) : endgames.length === 0 ? (
        <Empty>No endgame signatures recorded.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-elevated text-left text-xs uppercase tracking-wide text-text-muted">
                <Th>Signature</Th>
                <Th>Frequency</Th>
                <Th className="w-56">Stronger side: win / draw / loss</Th>
              </tr>
            </thead>
            <tbody>
              {endgames.map((e, i) => (
                <tr key={`${e.material_signature}-${i}`} className="border-t border-border">
                  <Td className="font-mono text-text-primary">{e.material_signature}</Td>
                  <Td className="text-text-secondary">{formatCount(e.frequency)}</Td>
                  <Td>
                    <WinDrawLossBar
                      white={e.stronger_side_win_rate}
                      draw={e.draw_rate}
                      black={e.stronger_side_loss_rate}
                    />
                    <div className="mt-1 flex justify-between text-[11px] text-text-muted">
                      <span>win {pct(e.stronger_side_win_rate)}</span>
                      <span>draw {pct(e.draw_rate)}</span>
                      <span>loss {pct(e.stronger_side_loss_rate)}</span>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination offset={offset} pageSize={PAGE_SIZE} atEnd={endgames.length < PAGE_SIZE} onChange={setOffset} />
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-secondary p-12 text-center text-sm text-text-muted">
      {children}
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2.5 font-medium ${className}`}>{children}</th>
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>
}
