import type { TimeFormat, TimeFormatCategory } from './match'

export type { TimeFormat, TimeFormatCategory }

export type OpponentType = 'human' | 'bot' | 'bot-vs-bot'

export interface QueueRequest {
  time_format_id: string
  opponent: { type: 'human' } | { type: 'bot'; bot_id: string }
  // Allow being matched with players previously flagged by anti-cheat. Default
  // false (disallow). Only meaningful for human opponents.
  allow_flagged?: boolean
}

export interface QueueEntry {
  queue_token: string
  match_id?: string
}

export interface QueueStatus {
  status: 'waiting' | 'matched'
  match_id: string | null
}

export interface TimeFormatsResponse {
  formats: TimeFormat[]
}

export interface BotMatchRequest {
  white_bot_id: string
  black_bot_id: string
  time_format_id: string
}

export interface BotMatchResponse {
  match_id: string
}
