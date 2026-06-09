'use client'

import { useState } from 'react'
import { useSearch } from '@/lib/hooks/useSearch'
import type {
  GameSearchResult,
  MatchSearchResult,
  PositionSearchResult,
  SearchScope,
} from '@/lib/models/search'

const TABS: { scope: SearchScope; label: string }[] = [
  { scope: 'games', label: 'Games' },
  { scope: 'matches', label: 'Matches' },
  { scope: 'positions', label: 'Positions' },
]

type AnyResult = GameSearchResult | MatchSearchResult | PositionSearchResult

export function SearchPanel() {
  const { search, loading, error } = useSearch()
  const [scope, setScope] = useState<SearchScope>('games')
  const [q, setQ] = useState('')
  const [opponent, setOpponent] = useState('')
  const [result, setResult] = useState('')
  const [fen, setFen] = useState('')
  const [results, setResults] = useState<AnyResult[]>([])
  const [total, setTotal] = useState<number | null>(null)

  async function run(e: React.FormEvent) {
    e.preventDefault()
    const params: Record<string, string> =
      scope === 'games'
        ? { q, opponent }
        : scope === 'matches'
          ? { opponent, result }
          : { fen }

    const page = await search<AnyResult>(scope, params)
    if (page) {
      setResults(page.results)
      setTotal(page.total)
    }
  }

  function switchScope(next: SearchScope) {
    setScope(next)
    setResults([])
    setTotal(null)
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-secondary p-6">
      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.scope}
            type="button"
            onClick={() => switchScope(t.scope)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              scope === t.scope
                ? 'bg-accent text-white'
                : 'bg-bg-elevated text-text-muted hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={run} className="flex flex-wrap items-end gap-3">
        {scope === 'games' && (
          <>
            <Field label="Free text" value={q} onChange={setQ} placeholder="opening, player, event…" />
            <Field label="Opponent" value={opponent} onChange={setOpponent} placeholder="name" />
          </>
        )}
        {scope === 'matches' && (
          <>
            <Field label="Opponent" value={opponent} onChange={setOpponent} placeholder="name" />
            <label className="flex flex-col gap-1 text-xs text-text-muted">
              Result
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
              >
                <option value="">any</option>
                <option value="white_won">white won</option>
                <option value="black_won">black won</option>
                <option value="draw">draw</option>
              </select>
            </label>
          </>
        )}
        {scope === 'positions' && (
          <Field
            label="FEN"
            value={fen}
            onChange={setFen}
            placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
            wide
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {total !== null && (
        <p className="mt-4 text-xs text-text-muted">{total} result{total === 1 ? '' : 's'}</p>
      )}

      <ul className="mt-3 divide-y divide-border">
        {results.map((r, i) => (
          <li key={i} className="py-2 text-sm text-text-primary">
            <ResultRow scope={scope} result={r} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function ResultRow({ scope, result }: { scope: SearchScope; result: AnyResult }) {
  if (scope === 'games') {
    const g = result as GameSearchResult
    return (
      <span>
        <span className="text-text-muted">{g.eco || '—'}</span> {g.white} vs {g.black}{' '}
        <span className="text-text-muted">{g.result}</span>
        {g.opening ? <span className="text-text-muted"> · {g.opening}</span> : null}
      </span>
    )
  }
  if (scope === 'matches') {
    const m = result as MatchSearchResult
    return (
      <span>
        {m.white} vs {m.black} <span className="text-text-muted">{m.status}</span>
        {m.source === 'external' ? <span className="text-accent"> · {m.external_provider}</span> : null}
      </span>
    )
  }
  const p = result as PositionSearchResult
  return (
    <span>
      <span className="text-text-muted">{p.kind}</span> {p.white} vs {p.black}{' '}
      <span className="text-text-muted">ply {p.ply}</span>
    </span>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  wide,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  wide?: boolean
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-muted">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary ${
          wide ? 'w-[28rem] max-w-full' : 'w-56'
        }`}
      />
    </label>
  )
}
