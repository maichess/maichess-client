'use client'

import type { AnalysisLine } from '@/lib/models/analysis'
import { formatEval } from '@/lib/utils/fen'
import { Spinner } from '@/lib/components/ui/Spinner'

interface AnalysisPanelProps {
  lines: AnalysisLine[]
  depth: number
  running: boolean
  complete: boolean
  error: string | null
  currentFen: string
}

export function AnalysisPanel({ lines, depth, running, complete, error, currentFen }: AnalysisPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Analysis
          {depth > 0 && <span className="ml-1 text-text-secondary">depth {depth}</span>}
        </span>
        {running && !complete && <Spinner size="sm" />}
        {complete && (
          <span className="text-xs text-text-muted">Complete</span>
        )}
      </div>

      <div className="px-3 py-2 min-h-[80px]">
        {error && (
          <p className="text-xs text-danger py-2">{error}</p>
        )}

        {!error && lines.length === 0 && (
          <p className="text-xs text-text-muted py-2 text-center">
            {running ? 'Analysing…' : 'No analysis'}
          </p>
        )}

        {lines.map((line) => (
          <div key={line.rank} className="flex items-baseline gap-2 py-1 text-xs">
            <span className="w-4 text-text-muted shrink-0">{line.rank}.</span>
            <span className="w-12 font-mono font-semibold shrink-0 text-text-primary">
              {formatEval(line.evaluation_cp, currentFen)}
            </span>
            <span className="font-mono text-text-secondary truncate">
              {line.moves.join(' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
