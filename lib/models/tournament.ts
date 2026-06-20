export interface TournamentClock {
  limit: number
  increment: number
}

export interface TournamentInfo {
  id: string
  fullName: string
  clock: TournamentClock
  nbPlayers: number
  nbRounds: number
  format: string
  matchesPerPairing: number
  startPosition: string
  createdBy: string
}

export interface TournamentListResponse {
  created: TournamentInfo[]
  started: TournamentInfo[]
  finished: TournamentInfo[]
}

export interface TournamentStanding {
  rank: number
  points: number
  tieBreak: number
  bot: { id: string; name: string }
  nbGames: number
  wins: number
  draws: number
  losses: number
}

export interface TournamentDetail {
  tournament: {
    id: string
    fullName: string
    status: 'created' | 'started' | 'finished'
    round?: number
    nbPlayers: number
    nbRounds: number
    format: string
    clock: TournamentClock
    standing?: {
      page: number
      players: TournamentStanding[]
    }
  }
  is_director: boolean
  registrations: BotRegistration[]
  game_mappings: GameMapping[]
}

export interface BotRegistration {
  registration_id: string
  maichess_bot_id: string
  status: string
}

export interface GameMapping {
  tournament_game_id: string
  match_db_id: string
}

export interface TournamentPairing {
  white: { id: string; name: string }
  black: { id: string; name: string }
  gameId: string | null
  match_db_id?: string
  winner: string | null
}

export interface RoundPairingsResponse {
  round: number
  pairings: TournamentPairing[]
}

export interface TournamentResult {
  rank: number
  points: number
  tieBreak: number
  bot: { id: string; name: string }
  nbGames: number
  wins: number
  draws: number
  losses: number
}

export interface CreateTournamentForm {
  name: string
  nbRounds: number
  clockLimit: number
  clockIncrement: number
  format: string
  matchesPerPairing: number
  bot_id: string
}

export interface TournamentConfig {
  default_server_url: string
}

export interface Opening {
  key: string
  name: string
  fen: string
}

export interface RegisteredBot {
  id: string
  name: string
  maichess_bot_id: string | null
}

// ── Analytics export (tournament server `AnalyticsExport`, schemaVersion "1.0") ──
// Raw, versioned tournament data the client analyses itself (see analytics view).

export interface AnalyticsStanding {
  botId: string
  botName: string
  botFamily?: string | null
  strategyType?: string | null
  engineType?: string | null
  modelVersion?: string | null
  rank: number
  points: number
  wins: number
  draws: number
  losses: number
  nbGames: number
  tieBreak: number
}

export interface AnalyticsGame {
  gameId: string
  round: number
  whiteBotId: string
  whiteBotName: string
  blackBotId: string
  blackBotName: string
  winner?: 'white' | 'black' | 'draw' | null
  winnerBotId?: string | null
  terminationReason: string
  totalPly: number
  moves: string
  startedAt?: string | null
  endedAt?: string | null
  durationMillis?: number | null
}

export interface TournamentAnalyticsExport {
  schemaVersion: string
  tournamentId: string
  format: string
  clock: TournamentClock
  rated: boolean
  nbRounds: number
  startedAt?: string | null
  finishedAt?: string | null
  exportedAt: string
  standings: AnalyticsStanding[]
  games: AnalyticsGame[]
}
