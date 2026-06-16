'use client'

import Link from 'next/link'
import { BarChart3 } from 'lucide-react'
import { Spinner } from '@/lib/components/ui/Spinner'
import { Button } from '@/lib/components/ui/Button'
import { ROUTES } from '@/lib/constants/routes'
import { filterLabel, sourceLabel, type Corpus } from '@/lib/models/insights'
import { formatCount, formatMonth } from '@/lib/utils/insightsFormat'

// Lists the analyzed corpora; each card links into the explorer and offers a "Run analysis"
// action that (re)materializes all metric kinds for that corpus.
export function CorporaList({
  corpora,
  loading,
  error,
  onAnalyze,
  analyzing,
}: {
  corpora: Corpus[]
  loading: boolean
  error: string | null
  onAnalyze: (corpusId: string) => void
  analyzing: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-bg-secondary p-5">
      <h2 className="mb-3 text-lg font-semibold text-text-primary">Corpora</h2>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="md" />
        </div>
      ) : corpora.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">
          No analyzed corpora yet. Ingest a source, then run analysis on it.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {corpora.map((corpus) => (
            <li
              key={corpus.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-bg-elevated p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-text-primary">{sourceLabel(corpus.source)}</p>
                  <p className="font-mono text-[11px] text-text-muted">{corpus.id}</p>
                </div>
                <span className="shrink-0 text-xs text-text-muted">
                  {formatCount(corpus.game_count)} games
                </span>
              </div>

              {filterLabel(corpus.filter) && (
                <p className="text-xs text-text-secondary">{filterLabel(corpus.filter)}</p>
              )}

              <p className="text-[11px] text-text-muted">{formatMonth(corpus.created_at_ms)}</p>

              <div className="mt-1 flex items-center gap-2">
                <Link
                  href={ROUTES.insightsCorpus(corpus.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-text hover:bg-accent-hover"
                >
                  <BarChart3 size={14} />
                  Explore
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAnalyze(corpus.id)}
                  disabled={analyzing}
                >
                  Run analysis
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
