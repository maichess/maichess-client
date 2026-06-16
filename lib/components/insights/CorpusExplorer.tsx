'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { CorpusSummaryHeader } from '@/lib/components/insights/CorpusSummaryHeader'
import { OpeningsView } from '@/lib/components/insights/OpeningsView'
import { EndgamesView } from '@/lib/components/insights/EndgamesView'
import { PositionsView } from '@/lib/components/insights/PositionsView'
import { TrickyView } from '@/lib/components/insights/TrickyView'

type Tab = 'openings' | 'endgames' | 'positions' | 'tricky'

const TABS: { value: Tab; label: string }[] = [
  { value: 'openings', label: 'Openings' },
  { value: 'endgames', label: 'Endgames' },
  { value: 'positions', label: 'Common positions' },
  { value: 'tricky', label: 'Tricky positions' },
]

// Explore one analyzed corpus: a summary header plus tabs for openings, endgames, common
// positions, and tricky positions. Each tab owns its own paging/filters and lazy-loads.
export function CorpusExplorer({ corpusId }: { corpusId: string }) {
  const [tab, setTab] = useState<Tab>('openings')

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={ROUTES.insights}
          className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent"
        >
          <ArrowLeft size={14} />
          All corpora
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Insights</h1>
        <p className="font-mono text-xs text-text-muted">{corpusId}</p>
      </div>

      <CorpusSummaryHeader corpusId={corpusId} />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              tab === t.value
                ? 'bg-accent text-accent-text'
                : 'bg-bg-elevated text-text-muted hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'openings' && <OpeningsView corpusId={corpusId} />}
      {tab === 'endgames' && <EndgamesView corpusId={corpusId} />}
      {tab === 'positions' && <PositionsView corpusId={corpusId} />}
      {tab === 'tricky' && <TrickyView corpusId={corpusId} />}
    </div>
  )
}
