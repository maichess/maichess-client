export type UserPlayer = { user_id: string; username: string }
export type BotPlayer = { bot_id: string; name: string }
export type Player = UserPlayer | BotPlayer

export type MatchStatus = 'ongoing' | 'white_won' | 'black_won' | 'draw'
export type TimeFormatCategory = 'bullet' | 'blitz' | 'rapid' | 'classical'
export type EndReason = 'checkmate' | 'resignation' | 'stalemate' | 'timeout' | 'draw_agreement'

export interface TimeFormat {
  id: string
  base_ms: number
  increment_ms: number
  category: TimeFormatCategory
}

export interface Match {
  id: string
  white: Player
  black: Player
  current_fen: string
  status: MatchStatus
  moves: string[]
  time_format: TimeFormat
  white_time_ms: number
  black_time_ms: number
  last_move_at_ms: number
  analyzable?: boolean
}

export interface MatchSummary {
  id: string
  white: Player
  black: Player
  status: MatchStatus
  time_format: TimeFormat
  white_time_ms: number
  black_time_ms: number
  last_move_at_ms: number
  move_count: number
}

export interface MatchListResponse {
  matches: MatchSummary[]
  total: number
  page: number
  page_size: number
}

export interface MoveEvent {
  index: number
  move: string
  resulting_fen: string
  player: { user_id: string } | { bot_id: string }
  white_time_ms: number
  black_time_ms: number
}

export interface MatchEndedEvent {
  status: MatchStatus
  reason: EndReason
}

export function isUserPlayer(p: Player): p is UserPlayer {
  return 'user_id' in p
}

export function playerDisplayName(p: Player): string {
  return isUserPlayer(p) ? p.username : p.name
}
