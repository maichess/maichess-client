'use client'

import { useCorpusResource } from '@/lib/hooks/useCorpusResource'
import { Spinner } from '@/lib/components/ui/Spinner'
import type { SummaryResponse } from '@/lib/models/insights'
import { formatCount, pct1 } from '@/lib/utils/insightsFormat'

// Headline aggregates for the corpus: totals, rating distribution, draw rate, average
// length, termination mix, and first-move popularity (insights_summary).
export function CorpusSummaryHeader({ corpusId }: { corpusId: string }) {
  const { data, loading, missing, error } = useCorpusResource<SummaryResponse>(corpusId, 'summary')

  if (loading) {
    return (
      <div className="flex justify-center rounded-2xl border border-border bg-bg-secondary py-10">
        <Spinner size="md" />
      </div>
    )
  }

  if (missing || !data?.summary) {
    return (
      <div className="rounded-2xl border border-border bg-bg-secondary p-6 text-sm text-text-muted">
        {error ?? 'No summary materialized yet — run the summary analysis for this corpus.'}
      </div>
    )
  }

  const s = data.summary

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-bg-secondary p-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Games" value={formatCount(s.total_games)} />
        <Stat
          label="Date range"
          value={s.date_from === s.date_to ? s.date_from : `${s.date_from} – ${s.date_to}`}
        />
        <Stat label="Draw rate" value={pct1(s.draw_rate)} />
        <Stat label="Avg length" value={`${s.avg_ply_count.toFixed(1)} ply`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Distribution
          title="Rating distribution"
          rows={s.rating_distribution.map((r) => ({ label: r.rating_band, count: r.game_count }))}
        />
        <Distribution
          title="Termination"
          rows={s.termination_mix.map((t) => ({ label: t.termination, count: t.game_count }))}
        />
        <Distribution
          title="First move"
          rows={s.first_moves.map((m) => ({ label: m.san, count: m.game_count }))}
        />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="text-xl font-semibold text-text-primary">{value}</p>
    </div>
  )
}

function Distribution({
  title,
  rows,
}: {
  title: string
  rows: { label: string; count: number }[]
}) {
  const total = rows.reduce((sum, r) => sum + r.count, 0) || 1
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">{title}</p>
      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li key={r.label} className="text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>{r.label}</span>
              <span className="text-text-muted">{formatCount(r.count)}</span>
            </div>
            <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
              <span
                style={{ width: `${(r.count / total) * 100}%` }}
                className="block h-full bg-accent/70"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
