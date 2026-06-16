'use client'

import { useState } from 'react'
import { Button } from '@/lib/components/ui/Button'
import type { CorpusFilter } from '@/lib/models/insights'

const inputClass =
  'rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none'

type Mode = 'lichess' | 'upload'

// Builds the optional corpus filter shared by both sources from the form fields.
function buildFilter(ratingBand: string, timeControl: string, sample: string): CorpusFilter {
  const filter: CorpusFilter = {}
  if (ratingBand) filter.rating_band = ratingBand
  if (timeControl) filter.time_control = timeControl
  const rate = Number(sample)
  if (sample && rate > 0 && rate < 1) filter.sample_rate = rate
  return filter
}

// Launch a corpus: analyze a Lichess monthly dump (with an optional rating/time/sample
// filter) or upload a PGN that is staged and ingested. Both call task-05 endpoints via the
// parent's job hook; status then shows up in the Jobs table below.
export function IngestionForm({
  onSubmitMonth,
  onUpload,
  submitting,
  error,
}: {
  onSubmitMonth: (yearMonth: string, filter: CorpusFilter) => Promise<unknown>
  onUpload: (file: File, label: string, filter: CorpusFilter) => Promise<unknown>
  submitting: boolean
  error: string | null
}) {
  const [mode, setMode] = useState<Mode>('lichess')
  const [yearMonth, setYearMonth] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [label, setLabel] = useState('')
  const [ratingBand, setRatingBand] = useState('')
  const [timeControl, setTimeControl] = useState('')
  const [sample, setSample] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const filter = buildFilter(ratingBand, timeControl, sample)
    if (mode === 'lichess') {
      await onSubmitMonth(yearMonth, filter)
    } else if (file) {
      await onUpload(file, label, filter)
    }
  }

  const canSubmit = mode === 'lichess' ? /^\d{4}-\d{2}$/.test(yearMonth) : file !== null

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-bg-secondary p-5 space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Analyze a corpus</h2>

      <div className="flex gap-2">
        <ModeTab active={mode === 'lichess'} onClick={() => setMode('lichess')}>
          Lichess month
        </ModeTab>
        <ModeTab active={mode === 'upload'} onClick={() => setMode('upload')}>
          Upload PGN
        </ModeTab>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </div>
      )}

      {mode === 'lichess' ? (
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Month (YYYY-MM)
          <input
            type="month"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
            className={`${inputClass} w-48`}
          />
        </label>
      ) : (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            PGN file (.pgn / .pgn.zst)
            <input
              type="file"
              accept=".pgn,.zst"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-bg-elevated file:px-3 file:py-2 file:text-sm file:text-text-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            Label
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="club games"
              className={`${inputClass} w-48`}
            />
          </label>
        </div>
      )}

      <fieldset className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
        <legend className="text-xs uppercase tracking-wide text-text-muted">
          Filter (optional)
        </legend>
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Rating band
          <select
            value={ratingBand}
            onChange={(e) => setRatingBand(e.target.value)}
            className={`${inputClass} w-40`}
          >
            <option value="">any</option>
            <option value="&lt;1200">&lt;1200</option>
            <option value="1200-1599">1200-1599</option>
            <option value="1600-1999">1600-1999</option>
            <option value="2000-2399">2000-2399</option>
            <option value="2400+">2400+</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Time control
          <select
            value={timeControl}
            onChange={(e) => setTimeControl(e.target.value)}
            className={`${inputClass} w-40`}
          >
            <option value="">any</option>
            <option value="bullet">bullet</option>
            <option value="blitz">blitz</option>
            <option value="rapid">rapid</option>
            <option value="classical">classical</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Sample rate (0–1)
          <input
            type="number"
            min={0}
            max={1}
            step="0.05"
            value={sample}
            onChange={(e) => setSample(e.target.value)}
            placeholder="1 = full"
            className={`${inputClass} w-40`}
          />
        </label>
      </fieldset>

      <p className="text-xs text-text-muted">
        Ingestion downloads/parses the source into a corpus, then you run analysis on it from the
        corpus list below. Full-month runs are large — narrow with a rating band, time control, or
        sample rate first.
      </p>

      <div className="flex justify-end">
        <Button type="submit" loading={submitting} disabled={!canSubmit}>
          {mode === 'lichess' ? 'Ingest month' : 'Upload & ingest'}
        </Button>
      </div>
    </form>
  )
}

function ModeTab({
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
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  )
}
