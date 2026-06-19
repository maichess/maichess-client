export type UserPlayer = { user_id: string; username: string }
export type BotPlayer = { bot_id: string; name: string }
export type ExternalPlayer = { external_name: string }
export type Player = UserPlayer | BotPlayer | ExternalPlayer

export type MatchStatus = 'ongoing' | 'white_won' | 'black_won' | 'draw'
export type MatchSource = 'native' | 'external'
export type TimeFormatCategory = 'bullet' | 'blitz' | 'rapid' | 'classical'
export type EndReason = 'checkmate' | 'resignation' | 'stalemate' | 'timeout' | 'draw_agreement'

export interface TimeFormat {
  id: string
  base_ms: number
  increment_ms: number
  category: TimeFormatCategory
}

// Per-move remaining-clock snapshot, parallel to a game's move list:
// clock_history[i] holds the clocks after move i.
export interface ClockSnapshot {
  white_time_ms: number
  black_time_ms: number
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
  // Optional per-move clock snapshots; when present, matchToPgn emits {[%clk ...]}
  // annotations. Absent for live/legacy matches that carry only the current clocks.
  clock_history?: ClockSnapshot[]
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
  finished_at_ms?: number
  move_count: number
  created_by?: Player | null
  source?: MatchSource
  external_provider?: string
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

export interface DrawOfferedEvent {
  player: { user_id: string } | { bot_id: string }
}

export interface DrawDeclinedEvent {
  player: { user_id: string } | { bot_id: string }
}

export function isUserPlayer(p: Player): p is UserPlayer {
  return 'user_id' in p
}

export function isBotPlayer(p: Player): p is BotPlayer {
  return 'bot_id' in p
}

export function isExternalPlayer(p: Player): p is ExternalPlayer {
  return 'external_name' in p
}

export function playerDisplayName(p: Player): string {
  if (isUserPlayer(p)) return p.username
  if (isBotPlayer(p)) return p.name
  return p.external_name
}
