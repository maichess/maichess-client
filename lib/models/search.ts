// Mirrors maichess-api-contracts/rest/search.md. Results carry ids + summary fields only;
// detail is hydrated from the owning service (analysis-service / match-manager).

export interface GameSearchResult {
  game_id: string
  white: string
  black: string
  result: string
  opening: string
  eco: string
  source: string
  created_at_ms: number
}

export interface MatchSearchResult {
  match_id: string
  white: string
  black: string
  status: string
  source: string
  external_provider: string
  move_count: number
  finished_at_ms: number
}

export interface PositionSearchResult {
  kind: string
  id: string
  ply: number
  fen: string
  white: string
  black: string
}

export interface SearchPage<T> {
  results: T[]
  total: number
  page: number
  page_size: number
}

export type SearchScope = 'games' | 'matches' | 'positions'
