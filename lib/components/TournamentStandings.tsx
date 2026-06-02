'use client'

import type { TournamentStanding } from '@/lib/models/tournament'

interface Props {
  standings: TournamentStanding[]
}

export function TournamentStandings({ standings }: Props) {
  if (standings.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-4">
        No standings yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-text-muted uppercase tracking-wider">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Player</th>
            <th className="px-3 py-2 text-right">Pts</th>
            <th className="px-3 py-2 text-right">W</th>
            <th className="px-3 py-2 text-right">D</th>
            <th className="px-3 py-2 text-right">L</th>
            <th className="px-3 py-2 text-right">TB</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr key={s.bot.id} className="border-b border-border/50 hover:bg-bg-elevated/50 transition-colors">
              <td className="px-3 py-2 tabular-nums text-text-muted">{s.rank}</td>
              <td className="px-3 py-2 font-medium text-text-primary">{s.bot.name}</td>
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
  )
}
