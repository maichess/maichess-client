'use client'

import { useEffect, useState } from 'react'
import { useAnticheat } from '@/lib/hooks/useAnticheat'
import type { CaseDetail, CaseStatus, CaseSummary } from '@/lib/models/anticheat'

const FILTERS: { value: CaseStatus | 'all'; label: string }[] = [
  { value: 'flagged', label: 'Flagged' },
  { value: 'open', label: 'Open' },
  { value: 'cleared', label: 'Cleared' },
  { value: 'all', label: 'All' },
]

const STATUS_STYLE: Record<CaseStatus, string> = {
  flagged: 'bg-danger/15 text-danger',
  open: 'bg-warning/15 text-warning',
  cleared: 'bg-bg-elevated text-text-muted',
}

export function AnticheatPanel() {
  const { loading, error, listCases, getCase, unflag } = useAnticheat()
  const [filter, setFilter] = useState<CaseStatus | 'all'>('flagged')
  const [cases, setCases] = useState<CaseSummary[]>([])
  const [selected, setSelected] = useState<CaseDetail | null>(null)
  // Bumped to force a reload after an unflag without re-listing inline.
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    listCases(filter).then((c) => {
      if (active) setCases(c)
    })
    return () => {
      active = false
    }
  }, [listCases, filter, reloadKey])

  async function openCase(caseId: string) {
    setSelected(await getCase(caseId))
  }

  async function handleUnflag(caseId: string) {
    const reason = window.prompt('Reason for clearing this flag (recorded in the audit trail):')
    if (!reason) return
    if (await unflag(caseId, reason)) {
      setSelected(null)
      setReloadKey((k) => k + 1)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-bg-secondary p-6">
        <div className="mb-4 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                filter === f.value
                  ? 'bg-accent text-white'
                  : 'bg-bg-elevated text-text-muted hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}
        {loading ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : cases.length === 0 ? (
          <p className="text-sm text-text-muted">No cases.</p>
        ) : (
          <ul className="space-y-2">
            {cases.map((c) => (
              <li key={c.case_id}>
                <button
                  type="button"
                  onClick={() => openCase(c.case_id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                    selected?.case_id === c.case_id
                      ? 'border-accent bg-accent/5'
                      : 'border-border bg-bg-elevated hover:border-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-text-secondary">{c.user_id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-text-muted">
                    score {c.score.toFixed(2)} · {c.games_analyzed} games · {c.live_signals} live
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-bg-secondary p-6">
        {selected ? (
          <CaseDetailView detail={selected} onUnflag={handleUnflag} />
        ) : (
          <p className="text-sm text-text-muted">Select a case to view its evidence.</p>
        )}
      </div>
    </div>
  )
}

function CaseDetailView({
  detail,
  onUnflag,
}: {
  detail: CaseDetail
  onUnflag: (caseId: string) => void
}) {
  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-mono text-sm text-text-primary">{detail.user_id}</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            {detail.status} · score {detail.score.toFixed(2)}
          </p>
        </div>
        {detail.status === 'flagged' && (
          <button
            type="button"
            onClick={() => onUnflag(detail.case_id)}
            className="rounded-lg bg-danger/15 px-3 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-danger/25"
          >
            Remove flag
          </button>
        )}
      </div>

      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Analysed games
      </h3>
      {detail.games.length === 0 ? (
        <p className="text-sm text-text-muted">None.</p>
      ) : (
        <ul className="mb-5 space-y-2">
          {detail.games.map((g) => (
            <li key={g.match_id} className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-xs">
              <div className="flex justify-between">
                <span className="font-mono text-text-secondary">{g.match_id}</span>
                <span className="text-text-primary">score {g.score.toFixed(2)}</span>
              </div>
              <div className="mt-1 text-text-muted">
                correlation {g.correlation.toFixed(2)} · timing {g.statistical.toFixed(2)}
                {g.suspicious_plies.length > 0 && ` · suspicious plies ${g.suspicious_plies.join(', ')}`}
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Audit</h3>
      {detail.audit.length === 0 ? (
        <p className="text-sm text-text-muted">None.</p>
      ) : (
        <ul className="space-y-1.5">
          {detail.audit.map((a, i) => (
            <li key={i} className="text-xs text-text-muted">
              <span className="font-medium text-text-secondary">{a.action}</span> · {a.actor} ·{' '}
              {new Date(a.at_ms).toLocaleString()} — {a.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
