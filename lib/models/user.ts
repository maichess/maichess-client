export interface User {
  id: string
  username: string
  elo: number
  wins: number
  losses: number
  draws: number
  dev_mode: boolean
  // Glicko-2 rating fields. `elo` is `rating` rounded; `rating_deviation` is high
  // for new/provisional accounts and shrinks as games accumulate.
  rating: number
  rating_deviation: number
  volatility: number
}

// A rating is considered provisional while its deviation is still high (a new or
// inactive account). 110 mirrors the common Glicko provisional cutoff.
export const PROVISIONAL_RD_THRESHOLD = 110

export function isProvisionalRating(user: Pick<User, 'rating_deviation'>): boolean {
  return user.rating_deviation > PROVISIONAL_RD_THRESHOLD
}
