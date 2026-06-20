import type {
  AnalyticsGame,
  TournamentAnalyticsExport,
} from '@/lib/models/tournament'

// Pure derivations over a tournament analytics export. The tournament server ships
// only raw game + standing data; every view below is computed client-side so the
// analytics UI never depends on server-side aggregation.

export interface AnalyticsSummary {
  totalGames: number
  decisiveGames: number
  draws: number
  drawRate: number
  avgPly: number
  whiteWins: number
  blackWins: number
  whiteWinRate: number
  blackWinRate: number
}

export interface TerminationCount {
  reason: string
  count: number
}

export function summarize(games: AnalyticsGame[]): AnalyticsSummary {
  const total = games.length
  const whiteWins = games.filter((g) => g.winner === 'white').length
  const blackWins = games.filter((g) => g.winner === 'black').length
  const draws = games.filter((g) => g.winner === 'draw').length
  const decisive = whiteWins + blackWins
  const plySum = games.reduce((sum, g) => sum + g.totalPly, 0)

  return {
    totalGames: total,
    decisiveGames: decisive,
    draws,
    drawRate: total > 0 ? draws / total : 0,
    avgPly: total > 0 ? plySum / total : 0,
    whiteWins,
    blackWins,
    whiteWinRate: total > 0 ? whiteWins / total : 0,
    blackWinRate: total > 0 ? blackWins / total : 0,
  }
}

// Count games by termination reason, most common first.
export function terminationBreakdown(games: AnalyticsGame[]): TerminationCount[] {
  const counts = new Map<string, number>()
  for (const g of games) {
    counts.set(g.terminationReason, (counts.get(g.terminationReason) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
}

// The shortest decisive game (fewest plies), or null if there were no decisive games.
export function fastestWin(games: AnalyticsGame[]): AnalyticsGame | null {
  const decisive = games.filter((g) => g.winner === 'white' || g.winner === 'black')
  if (decisive.length === 0) return null
  return decisive.reduce((best, g) => (g.totalPly < best.totalPly ? g : best))
}

export function isSupportedSchema(data: TournamentAnalyticsExport): boolean {
  return data.schemaVersion === '1.0'
}
