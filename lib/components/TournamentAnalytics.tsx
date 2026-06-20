'use client'

import { useMemo } from 'react'
import { useTournamentAnalytics } from '@/lib/hooks/useTournamentAnalytics'
import {
  summarize,
  terminationBreakdown,
  fastestWin,
  isSupportedSchema,
} from '@/lib/utils/tournamentAnalytics'
import { Spinner } from '@/lib/components/ui/Spinner'

interface Props {
  id: string
  enabled: boolean
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-elevated px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className="text-lg font-semibold text-text-primary tabular-nums">{value}</div>
      {sub && <div className="text-[10px] text-text-muted">{sub}</div>}
    </div>
  )
}

export function TournamentAnalytics({ id, enabled }: Props) {
  const { data, loading, error } = useTournamentAnalytics(id, enabled)

  const derived = useMemo(() => {
    if (!data) return null
    return {
      summary: summarize(data.games),
      terminations: terminationBreakdown(data.games),
      fastest: fastestWin(data.games),
    }
  }, [data])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-text-muted text-center py-6">{error}</p>
  }

  if (!data || !derived) {
    return <p className="text-sm text-text-muted text-center py-6">No analytics available.</p>
  }

  if (!isSupportedSchema(data)) {
    return (
      <p className="text-sm text-text-muted text-center py-6">
        Unsupported analytics schema ({data.schemaVersion}).
      </p>
    )
  }

  const { summary, terminations, fastest } = derived
  const champion = data.standings.find((s) => s.rank === 1)

  return (
    <div className="space-y-6 p-4">
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Summary</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatCard label="Games" value={String(summary.totalGames)} sub={`${summary.decisiveGames} decisive`} />
          <StatCard label="Draw rate" value={pct(summary.drawRate)} sub={`${summary.draws} draws`} />
          <StatCard label="Avg length" value={`${summary.avgPly.toFixed(1)} ply`} />
          {champion && <StatCard label="Champion" value={champion.botName} sub={`${champion.points} pts`} />}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Color performance</h3>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="White wins" value={pct(summary.whiteWinRate)} sub={`${summary.whiteWins}`} />
          <StatCard label="Black wins" value={pct(summary.blackWinRate)} sub={`${summary.blackWins}`} />
          <StatCard label="Draws" value={pct(summary.drawRate)} sub={`${summary.draws}`} />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Termination reasons</h3>
        {terminations.length === 0 ? (
          <p className="text-sm text-text-muted">No games recorded.</p>
        ) : (
          <div className="space-y-1">
            {terminations.map((t) => (
              <div key={t.reason} className="flex items-center justify-between rounded-lg bg-bg-elevated px-3 py-1.5">
                <span className="text-sm capitalize text-text-primary">{t.reason}</span>
                <span className="text-sm tabular-nums text-text-secondary">
                  {t.count} ({pct(summary.totalGames > 0 ? t.count / summary.totalGames : 0)})
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted uppercase tracking-wider">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Bot</th>
                <th className="px-3 py-2">Family</th>
                <th className="px-3 py-2 text-right">Pts</th>
                <th className="px-3 py-2 text-right">W</th>
                <th className="px-3 py-2 text-right">D</th>
                <th className="px-3 py-2 text-right">L</th>
                <th className="px-3 py-2 text-right">TB</th>
              </tr>
            </thead>
            <tbody>
              {data.standings.map((s) => (
                <tr key={s.botId} className="border-b border-border/50 hover:bg-bg-elevated/50 transition-colors">
                  <td className="px-3 py-2 tabular-nums text-text-muted">{s.rank}</td>
                  <td className="px-3 py-2 font-medium text-text-primary">{s.botName}</td>
                  <td className="px-3 py-2 text-text-muted">{s.strategyType ?? s.botFamily ?? '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-accent">{s.points}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-text-secondary">{s.wins}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-text-secondary">{s.draws}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-text-secondary">{s.losses}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-text-muted">{s.tieBreak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {fastest && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Fastest win</h3>
          <div className="rounded-lg bg-bg-elevated px-3 py-2 text-sm text-text-secondary">
            <span className="font-medium text-text-primary">
              {fastest.winner === 'white' ? fastest.whiteBotName : fastest.blackBotName}
            </span>{' '}
            beat{' '}
            <span className="font-medium text-text-primary">
              {fastest.winner === 'white' ? fastest.blackBotName : fastest.whiteBotName}
            </span>{' '}
            in {fastest.totalPly} ply ({fastest.terminationReason}, round {fastest.round}).
          </div>
        </section>
      )}
    </div>
  )
}
