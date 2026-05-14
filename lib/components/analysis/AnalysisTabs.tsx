'use client'

import { useState } from 'react'
import { Button } from '@/lib/components/ui/Button'
import { GameLibrary } from './GameLibrary'
import { UserMatchList } from './UserMatchList'
import type { AnalysisGame } from '@/lib/models/analysis'

type Tab = 'library' | 'past'

interface AnalysisTabsProps {
  initialGames: AnalysisGame[]
  initialTotal: number
  pageSize: number
}

export function AnalysisTabs({ initialGames, initialTotal, pageSize }: AnalysisTabsProps) {
  const [tab, setTab] = useState<Tab>('library')
  const [showImport, setShowImport] = useState(false)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analysis</h1>
          <p className="mt-0.5 text-sm text-text-muted">Review your games with engine assistance</p>
        </div>
        {tab === 'library' && (
          <Button onClick={() => setShowImport(true)}>Import game</Button>
        )}
      </div>

      <div className="mb-4 flex gap-2 border-b border-border">
        <TabButton active={tab === 'library'} onClick={() => setTab('library')}>
          Saved games
        </TabButton>
        <TabButton active={tab === 'past'} onClick={() => setTab('past')}>
          Past matches
        </TabButton>
      </div>

      {tab === 'library' ? (
        <GameLibrary
          initialGames={initialGames}
          initialTotal={initialTotal}
          pageSize={pageSize}
          showImport={showImport}
          onImportClose={() => setShowImport(false)}
          embedded
        />
      ) : (
        <UserMatchList />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-all cursor-pointer',
        active
          ? 'border-accent text-accent'
          : 'border-transparent text-text-muted hover:text-text-primary',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
