import type { ClockSnapshot } from '@/lib/models/match'

export type { ClockSnapshot }

export interface PlayerInfo {
  name?: string
  user_id?: string
  username?: string
  bot_id?: string
}

export interface AnalysisLine {
  rank: number
  evaluation_cp: number
  moves: string[]
}

export interface AnalysisGame {
  id: string
  source: 'pgn' | 'match' | 'fen'
  match_id?: string
  white: PlayerInfo
  black: PlayerInfo
  result: string
  move_count: number
  created_at: string
  tags: Record<string, string>
}

export interface AnalysisGameDetail {
  id: string
  source: 'pgn' | 'match' | 'fen'
  match_id?: string
  white: PlayerInfo
  black: PlayerInfo
  result: string
  starting_fen: string
  moves: string[]
  fens: string[]
  pgn: string
  created_at: string
  tags: Record<string, string>
  // Per-move remaining-clock snapshots parallel to `moves`; absent or empty when the
  // game carried no clock data (FEN import, clock-less PGN, or a pre-feature match).
  clock_history?: ClockSnapshot[]
}

export interface Bot {
  id: string
  name: string
  elo: number
}

export interface AnalysisConfig {
  default_bot_id: string
  default_line_count: number
  bots: Bot[]
}

export function playerInfoName(p: PlayerInfo): string {
  return p.username ?? p.name ?? p.bot_id ?? p.user_id ?? 'Unknown'
}
