import type { TimeControl } from './match'

export type { TimeControl }

export type OpponentType = 'human' | 'bot'

export interface QueueRequest {
  time_control: TimeControl
  opponent: { type: 'human' } | { type: 'bot'; bot_id: string }
}

export interface QueueEntry {
  queue_token: string
}

export interface QueueStatus {
  status: 'waiting' | 'matched'
  match_id: string | null
}
