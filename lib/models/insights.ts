// Mirrors maichess-api-contracts/rest/insights.md (which mirrors
// protos/insights-service/v1/insights.proto). Every metric is per corpus.

export type JobType = 'ingestion' | 'analysis'
export type JobStatus = 'pending' | 'running' | 'succeeded' | 'failed'
export type AnalysisKind = 'openings' | 'endgames' | 'positions' | 'tricky' | 'summary'

export const ANALYSIS_KINDS: AnalysisKind[] = [
  'openings',
  'endgames',
  'positions',
  'tricky',
  'summary',
]

export interface LichessMonthSource {
  year_month: string
}

export interface UploadSource {
  object_key: string
  label?: string
}

export interface JobSource {
  lichess_month?: LichessMonthSource
  upload?: UploadSource
}

export interface CorpusFilter {
  rating_band?: string
  time_control?: string
  date_from_ms?: number
  date_to_ms?: number
  sample_rate?: number
}

export interface InsightsJob {
  id: string
  type: JobType
  corpus_id: string
  source: JobSource
  filter: CorpusFilter
  status: JobStatus
  analysis_kinds: AnalysisKind[]
  created_at_ms: number
  started_at_ms: number
  finished_at_ms: number
  spark_application: string
  error: string
}

export interface JobsResponse {
  jobs: InsightsJob[]
}

export interface Corpus {
  id: string
  source: JobSource
  filter: CorpusFilter
  game_count: number
  created_at_ms: number
}

export interface CorporaResponse {
  corpora: Corpus[]
}

export interface RatingBandCount {
  rating_band: string
  game_count: number
}

export interface TerminationCount {
  termination: string
  game_count: number
}

export interface FirstMoveCount {
  san: string
  game_count: number
}

export interface CorpusSummary {
  corpus_id: string
  total_games: number
  date_from: string
  date_to: string
  draw_rate: number
  avg_ply_count: number
  rating_distribution: RatingBandCount[]
  termination_mix: TerminationCount[]
  first_moves: FirstMoveCount[]
}

export interface SummaryResponse {
  summary: CorpusSummary
}

export interface OpeningTrendPoint {
  year_month: string
  game_count: number
  white_win_rate: number
  black_win_rate: number
  draw_rate: number
}

export interface OpeningRow {
  eco: string
  opening_name: string
  game_count: number
  white_win_rate: number
  black_win_rate: number
  draw_rate: number
  color: string
  rating_band: string
  time_control: string
  trend: OpeningTrendPoint[]
}

export interface OpeningsResponse {
  openings: OpeningRow[]
}

export interface EndgameRow {
  material_signature: string
  frequency: number
  stronger_side_win_rate: number
  draw_rate: number
  stronger_side_loss_rate: number
}

export interface EndgamesResponse {
  endgames: EndgameRow[]
}

export interface PositionRow {
  normalized_fen: string
  reach_count: number
  white_win_rate: number
  black_win_rate: number
  draw_rate: number
}

export interface PositionsResponse {
  positions: PositionRow[]
}

export interface TrickyRow {
  normalized_fen: string
  support: number
  avg_centipawn_loss: number
  blunder_probability: number
  avg_think_time_ms: number
}

export interface TrickyResponse {
  positions: TrickyRow[]
}

export interface UploadResponse {
  object_key: string
  label: string
}

// A human label for a corpus' source ("Lichess 2024-12", "Upload: club games").
export function sourceLabel(source: JobSource): string {
  if (source.lichess_month) return `Lichess ${source.lichess_month.year_month}`
  if (source.upload) return `Upload${source.upload.label ? `: ${source.upload.label}` : ''}`
  return 'unknown source'
}

// A compact, human filter description ("blitz · 1600-1999 · 15% sample"), or '' when unfiltered.
export function filterLabel(filter: CorpusFilter | undefined): string {
  if (!filter) return ''
  const parts: string[] = []
  if (filter.time_control) parts.push(filter.time_control)
  if (filter.rating_band) parts.push(filter.rating_band)
  if (filter.sample_rate && filter.sample_rate > 0 && filter.sample_rate < 1) {
    parts.push(`${Math.round(filter.sample_rate * 100)}% sample`)
  }
  return parts.join(' · ')
}
