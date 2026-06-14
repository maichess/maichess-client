'use client'

import { useState } from 'react'
import { useSearch } from '@/lib/hooks/useSearch'
import { useOpenAnalysis } from '@/lib/hooks/useOpenAnalysis'
import type {
  GameSearchResult,
  MatchSearchResult,
  PositionSearchResult,
  SearchScope,
} from '@/lib/models/search'

const TABS: { scope: SearchScope; label: string; help: string }[] = [
  {
    scope: 'games',
    label: 'Games',
    help: 'Your analysis games library — games you imported or saved for analysis (imported PGNs, FEN imports, and matches you imported). Searchable by username, bot name, opening, or tag (partial matches work).',
  },
  {
    scope: 'matches',
    label: 'Matches',
    help: 'Your Past Matches — games you actually played on maichess (as white, black, or the creator of a bot-vs-bot game). Free text matches player/bot ids; display names are resolved separately.',
  },
  {
    scope: 'positions',
    label: 'Positions',
    help: 'Find your games and matches that reached a given board position. Paste a FEN; only the piece placement and side-to-move are matched.',
  },
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
          ? { q, opponent, result }
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

      <p className="mb-4 text-xs text-text-muted">{TABS.find((t) => t.scope === scope)?.help}</p>

      <form onSubmit={run} className="flex flex-wrap items-end gap-3">
        {scope === 'games' && (
          <>
            <Field label="Free text" value={q} onChange={setQ} placeholder="opening, player, event…" />
            <Field label="Opponent" value={opponent} onChange={setOpponent} placeholder="name" />
          </>
        )}
        {scope === 'matches' && (
          <>
            <Field label="Free text" value={q} onChange={setQ} placeholder="player or bot id…" />
            <Field label="Opponent" value={opponent} onChange={setOpponent} placeholder="id" />
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
          <li key={i} className="text-sm text-text-primary">
            <ResultRow scope={scope} result={r} />
          </li>
        ))}
      </ul>
    </div>
  )
}

// A result row opens the read-only (engine-off) analysis viewer. Game results carry an
// analysis game id directly; match results are imported via the from-match flow first.
function ResultRow({ scope, result }: { scope: SearchScope; result: AnyResult }) {
  const { openGame, openMatch, pending } = useOpenAnalysis()

  let id: string
  let isMatch: boolean
  let content: React.ReactNode

  if (scope === 'games') {
    const g = result as GameSearchResult
    id = g.game_id
    isMatch = false
    content = (
      <>
        <span className="text-text-muted">{g.eco || '—'}</span> {g.white} vs {g.black}{' '}
        <span className="text-text-muted">{g.result}</span>
        {g.opening ? <span className="text-text-muted"> · {g.opening}</span> : null}
      </>
    )
  } else if (scope === 'matches') {
    const m = result as MatchSearchResult
    id = m.match_id
    isMatch = true
    content = (
      <>
        {m.white} vs {m.black} <span className="text-text-muted">{m.status}</span>
        {m.source === 'external' ? <span className="text-accent"> · {m.external_provider}</span> : null}
      </>
    )
  } else {
    const p = result as PositionSearchResult
    id = p.id
    isMatch = p.kind === 'match'
    content = (
      <>
        <span className="text-text-muted">{p.kind}</span> {p.white} vs {p.black}{' '}
        <span className="text-text-muted">ply {p.ply}</span>
      </>
    )
  }

  const open = () => (isMatch ? openMatch(id, { readonly: true }) : openGame(id, { readonly: true }))

  return (
    <button
      type="button"
      onClick={open}
      disabled={pending === id}
      className="flex w-full items-center justify-between gap-3 py-2 text-left transition-colors hover:text-accent disabled:opacity-60"
    >
      <span>{content}</span>
      <span className="shrink-0 text-xs text-text-muted">
        {pending === id ? 'Opening…' : 'Analyse →'}
      </span>
    </button>
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
