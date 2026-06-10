// Anti-cheat Dev overview models — mirror maichess-api-contracts/rest/anticheat.md.

export type CaseStatus = 'open' | 'flagged' | 'cleared'

export interface CaseSummary {
  case_id: string
  user_id: string
  status: CaseStatus
  score: number
  games_analyzed: number
  live_signals: number
  created_at_ms: number
  updated_at_ms: number
  flagged_at_ms: number | null
}

export interface CaseListResponse {
  cases: CaseSummary[]
}

export interface CaseGame {
  match_id: string
  score: number
  correlation: number
  statistical: number
  suspicious_plies: number[]
  analyzed_at_ms: number
}

export interface AuditEntry {
  action: 'flagged' | 'unflagged' | 'live_suspicion'
  actor: string
  reason: string
  at_ms: number
}

export interface CaseDetail {
  case_id: string
  user_id: string
  status: CaseStatus
  score: number
  flagged_at_ms: number | null
  games: CaseGame[]
  audit: AuditEntry[]
}
