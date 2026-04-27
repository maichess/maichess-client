export type UserPlayer = { user_id: string; username: string }
export type BotPlayer = { bot_id: string; name: string }
export type Player = UserPlayer | BotPlayer

export type MatchStatus = 'ongoing' | 'white_won' | 'black_won' | 'draw'
export type TimeControl = 'bullet' | 'blitz' | 'rapid' | 'classical'
export type EndReason = 'checkmate' | 'resignation' | 'stalemate' | 'timeout' | 'draw_agreement'

export interface Match {
  id: string
  white: Player
  black: Player
  current_fen: string
  status: MatchStatus
  moves: string[]
  time_control: TimeControl
  white_time_ms: number
  black_time_ms: number
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
