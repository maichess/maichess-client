'use client'

import { useState } from 'react'
import { useCorpusResource } from '@/lib/hooks/useCorpusResource'
import { Spinner } from '@/lib/components/ui/Spinner'
import { BoardPreview } from '@/lib/components/insights/BoardPreview'
import { Pagination } from '@/lib/components/insights/Pagination'
import type { TrickyResponse } from '@/lib/models/insights'
import { formatCount, formatSeconds, pct } from '@/lib/utils/insightsFormat'

const PAGE_SIZE = 24

// "Trickiest" positions — the intersection of high average centipawn loss and high think
// time, i.e. where players most often blunder under pressure (insights_tricky).
export function TrickyView({ corpusId }: { corpusId: string }) {
  const [offset, setOffset] = useState(0)
  const { data, loading, missing, error } = useCorpusResource<TrickyResponse>(corpusId, 'tricky', {
    limit: String(PAGE_SIZE),
    offset: String(offset),
  })

  const positions = data?.positions ?? []

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        Ranked by both high average centipawn loss <em>and</em> high think time. Support is the number
        of moves observed from the position.
      </p>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="md" /></div>
      ) : missing ? (
        <Empty>No tricky positions materialized yet — run the tricky analysis for this corpus.</Empty>
      ) : positions.length === 0 ? (
        <Empty>No tricky positions recorded.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {positions.map((p, i) => (
            <div key={`${p.normalized_fen}-${i}`} className="rounded-2xl border border-border bg-bg-secondary p-4">
              <BoardPreview fen={p.normalized_fen} size={200} />
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Metric label="Avg cp loss" value={p.avg_centipawn_loss.toFixed(0)} highlight />
                <Metric label="Blunder rate" value={pct(p.blunder_probability)} />
                <Metric label="Think time" value={formatSeconds(p.avg_think_time_ms)} />
                <Metric label="Support" value={formatCount(p.support)} />
              </dl>
              <p className="mt-2 break-all font-mono text-[10px] text-text-muted">{p.normalized_fen}</p>
            </div>
          ))}
        </div>
      )}

      <Pagination offset={offset} pageSize={PAGE_SIZE} atEnd={positions.length < PAGE_SIZE} onChange={setOffset} />
    </div>
  )
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className={`font-semibold ${highlight ? 'text-danger' : 'text-text-primary'}`}>{value}</dd>
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
