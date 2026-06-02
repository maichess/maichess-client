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
  registration?: {
    registration_id: string
    maichess_bot_id: string
    status: string
  }
  game_mappings: GameMapping[]
}

export interface GameMapping {
  tournament_game_id: string
  match_db_id: string
}

export interface TournamentPairing {
  white: { id: string; name: string }
  black: { id: string; name: string }
  gameId: string
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
