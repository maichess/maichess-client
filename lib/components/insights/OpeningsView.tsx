'use client'

import { useState } from 'react'
import { useCorpusResource } from '@/lib/hooks/useCorpusResource'
import { Spinner } from '@/lib/components/ui/Spinner'
import { WinDrawLossBar } from '@/lib/components/insights/WinDrawLossBar'
import { MiniTrend } from '@/lib/components/insights/MiniTrend'
import { Pagination } from '@/lib/components/insights/Pagination'
import type { OpeningsResponse } from '@/lib/models/insights'
import { formatCount, pct } from '@/lib/utils/insightsFormat'

const PAGE_SIZE = 50

// Opening success by ECO/name with win/draw/loss bars and a month-over-month trend,
// optionally split by color / rating band / time control (insights_openings).
export function OpeningsView({ corpusId }: { corpusId: string }) {
  const [color, setColor] = useState('')
  const [ratingBand, setRatingBand] = useState('')
  const [timeControl, setTimeControl] = useState('')
  const [offset, setOffset] = useState(0)

  const params = {
    limit: String(PAGE_SIZE),
    offset: String(offset),
    ...(color ? { color } : {}),
    ...(ratingBand ? { rating_band: ratingBand } : {}),
    ...(timeControl ? { time_control: timeControl } : {}),
  }
  const { data, loading, missing, error } = useCorpusResource<OpeningsResponse>(
    corpusId,
    'openings',
    params,
  )

  const openings = data?.openings ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Select label="Color" value={color} onChange={(v) => { setColor(v); setOffset(0) }} options={[
          { value: '', label: 'both' },
          { value: 'white', label: 'white' },
          { value: 'black', label: 'black' },
        ]} />
        <Select label="Rating band" value={ratingBand} onChange={(v) => { setRatingBand(v); setOffset(0) }} options={[
          { value: '', label: 'any' },
          { value: '<1200', label: '<1200' },
          { value: '1200-1599', label: '1200-1599' },
          { value: '1600-1999', label: '1600-1999' },
          { value: '2000-2399', label: '2000-2399' },
          { value: '2400+', label: '2400+' },
        ]} />
        <Select label="Time control" value={timeControl} onChange={(v) => { setTimeControl(v); setOffset(0) }} options={[
          { value: '', label: 'any' },
          { value: 'bullet', label: 'bullet' },
          { value: 'blitz', label: 'blitz' },
          { value: 'rapid', label: 'rapid' },
          { value: 'classical', label: 'classical' },
        ]} />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="md" /></div>
      ) : missing ? (
        <Empty>No openings materialized yet — run the openings analysis for this corpus.</Empty>
      ) : openings.length === 0 ? (
        <Empty>No openings match this split.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-elevated text-left text-xs uppercase tracking-wide text-text-muted">
                <Th>ECO</Th>
                <Th>Opening</Th>
                <Th>Games</Th>
                <Th className="w-48">W / D / L</Th>
                <Th>Trend</Th>
              </tr>
            </thead>
            <tbody>
              {openings.map((o, i) => (
                <tr key={`${o.eco}-${o.opening_name}-${i}`} className="border-t border-border">
                  <Td className="font-mono text-text-secondary">{o.eco || '—'}</Td>
                  <Td className="font-medium text-text-primary">{o.opening_name || '—'}</Td>
                  <Td className="text-text-secondary">{formatCount(o.game_count)}</Td>
                  <Td>
                    <WinDrawLossBar white={o.white_win_rate} draw={o.draw_rate} black={o.black_win_rate} />
                    <div className="mt-1 flex justify-between text-[11px] text-text-muted">
                      <span>{pct(o.white_win_rate)}</span>
                      <span>{pct(o.draw_rate)}</span>
                      <span>{pct(o.black_win_rate)}</span>
                    </div>
                  </Td>
                  <Td><MiniTrend trend={o.trend} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination offset={offset} pageSize={PAGE_SIZE} atEnd={openings.length < PAGE_SIZE} onChange={setOffset} />
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-secondary p-12 text-center text-sm text-text-muted">
      {children}
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2.5 font-medium ${className}`}>{children}</th>
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>
}
