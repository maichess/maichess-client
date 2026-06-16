'use client'

import { useState } from 'react'
import { useCorpusResource } from '@/lib/hooks/useCorpusResource'
import { Spinner } from '@/lib/components/ui/Spinner'
import { BoardPreview } from '@/lib/components/insights/BoardPreview'
import { WinDrawLossBar } from '@/lib/components/insights/WinDrawLossBar'
import { Pagination } from '@/lib/components/insights/Pagination'
import type { PositionsResponse } from '@/lib/models/insights'
import { formatCount, pct } from '@/lib/utils/insightsFormat'

const PAGE_SIZE = 24

// Most-reached normalized positions with a board preview per FEN, optionally excluding
// still-in-book early positions to surface middlegame convergence (insights_positions).
export function PositionsView({ corpusId }: { corpusId: string }) {
  const [excludeBook, setExcludeBook] = useState(false)
  const [offset, setOffset] = useState(0)

  const { data, loading, missing, error } = useCorpusResource<PositionsResponse>(corpusId, 'positions', {
    limit: String(PAGE_SIZE),
    offset: String(offset),
    ...(excludeBook ? { exclude_book: 'true' } : {}),
  })

  const positions = data?.positions ?? []

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={excludeBook}
          onChange={(e) => { setExcludeBook(e.target.checked); setOffset(0) }}
          className="accent-accent"
        />
        Exclude opening-book positions
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="md" /></div>
      ) : missing ? (
        <Empty>No positions materialized yet — run the positions analysis for this corpus.</Empty>
      ) : positions.length === 0 ? (
        <Empty>No positions match this filter.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {positions.map((p, i) => (
            <div key={`${p.normalized_fen}-${i}`} className="rounded-2xl border border-border bg-bg-secondary p-4">
              <BoardPreview fen={p.normalized_fen} size={200} />
              <p className="mt-3 text-sm text-text-secondary">
                Reached in <span className="font-semibold text-text-primary">{formatCount(p.reach_count)}</span> games
              </p>
              <div className="mt-2">
                <WinDrawLossBar white={p.white_win_rate} draw={p.draw_rate} black={p.black_win_rate} />
                <div className="mt-1 flex justify-between text-[11px] text-text-muted">
                  <span>W {pct(p.white_win_rate)}</span>
                  <span>D {pct(p.draw_rate)}</span>
                  <span>B {pct(p.black_win_rate)}</span>
                </div>
              </div>
              <p className="mt-2 break-all font-mono text-[10px] text-text-muted">{p.normalized_fen}</p>
            </div>
          ))}
        </div>
      )}

      <Pagination offset={offset} pageSize={PAGE_SIZE} atEnd={positions.length < PAGE_SIZE} onChange={setOffset} />
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
