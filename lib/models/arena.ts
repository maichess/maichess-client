import type { TimeFormat } from './match'

export type SetupType = 'tournament' | 'matrix' | 'single'
export type CollectionStatus = 'pending' | 'running' | 'finished'
export type GameResult = 'ongoing' | 'white_won' | 'black_won' | 'draw'
// Arena scheduler state of a single game, distinct from its match result: a game
// can be queued behind the global concurrency cap (pending), in flight (running),
// or done (finished). `result` stays 'ongoing' for both pending and running.
export type ArenaGameStatus = 'pending' | 'running' | 'finished'
export type ColorMode = 'both_colors' | 'random'
export type MatrixColorMode = 'alternating' | 'random'

export interface CollectionProgress {
  total_games: number
  finished_games: number
  running_games: number
  pending_games: number
}

export interface ArenaGameResult {
  match_id: string
  fen: string
  fen_label: string
  white_bot_id: string
  black_bot_id: string
  result: GameResult
  order: number
  status: ArenaGameStatus
}

export interface TournamentConfig {
  bot_ids: string[]
  fen_list: string[]
  fens_per_stage: number
  color_mode: ColorMode
  time_format: TimeFormat
}

export interface MatrixConfig {
  bot_ids: string[]
  fen_list: string[]
  games_per_fen: number
  color_mode: MatrixColorMode
  time_format: TimeFormat
}

export interface SingleConfig {
  white_bot_id: string
  black_bot_id: string
  fen_list: string[]
  games_per_fen: number
  keep_switching_colors: boolean
  time_format: TimeFormat
}

export interface BracketPairing {
  bot_a_id: string
  bot_b_id: string
  bye: boolean
  winner_bot_id: string | null
  bot_a_score: number
  bot_b_score: number
  games: ArenaGameResult[]
}

export interface BracketRound {
  round_number: number
  pairings: BracketPairing[]
}

export interface BracketResult {
  rounds: BracketRound[]
  winner_bot_id: string | null
}

export interface MatrixCell {
  bot_a_id: string
  bot_b_id: string
  bot_a_score: number
  bot_b_score: number
}

export interface MatrixResult {
  bot_ids: string[]
  cells: MatrixCell[]
  games: ArenaGameResult[]
}

export interface SingleSeriesResult {
  bot_a_id: string
  bot_b_id: string
  bot_a_score: number
  bot_b_score: number
  games: ArenaGameResult[]
}

export interface CollectionSummary {
  id: string
  name: string
  type: SetupType
  created_by: string
  status: CollectionStatus
  created_at_ms: number
  finished_at_ms?: number
  progress: CollectionProgress
}

export interface Collection extends CollectionSummary {
  config: {
    tournament?: TournamentConfig
    matrix?: MatrixConfig
    single?: SingleConfig
  }
  result?: {
    bracket?: BracketResult
    matrix_table?: MatrixResult
    single_series?: SingleSeriesResult
  }
}

export interface CollectionListResponse {
  collections: CollectionSummary[]
}

export interface ConcurrencyLimit {
  limit: number
}

export interface CreateTournamentRequest {
  name: string
  tournament: {
    bot_ids: string[]
    fen_list: string[]
    fens_per_stage: number
    color_mode: ColorMode
    time_format_id: string
  }
}

export interface CreateMatrixRequest {
  name: string
  matrix: {
    bot_ids: string[]
    fen_list: string[]
    games_per_fen: number
    color_mode: MatrixColorMode
    time_format_id: string
  }
}

export interface CreateSingleRequest {
  name: string
  single: {
    white_bot_id: string
    black_bot_id: string
    fen_list: string[]
    games_per_fen: number
    keep_switching_colors: boolean
    time_format_id: string
  }
}

export type CreateCollectionRequest =
  | CreateTournamentRequest
  | CreateMatrixRequest
  | CreateSingleRequest
