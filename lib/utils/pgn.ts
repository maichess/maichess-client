import { Chess } from 'chess.js'
import type { Match, MatchStatus } from '@/lib/models/match'
import { playerDisplayName } from '@/lib/models/match'
import { formatTimeFormatLabel, msToPgnClockString } from '@/lib/utils/time'

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

function pgnResult(status: MatchStatus): string {
  switch (status) {
    case 'white_won':
      return '1-0'
    case 'black_won':
      return '0-1'
    case 'draw':
      return '1/2-1/2'
    default:
      return '*'
  }
}

function todayUtcDate(): string {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

/**
 * Builds a PGN from a finished match. Replays UCI moves through chess.js so the
 * generated movetext is SAN. Stops appending at the first illegal move (defensive
 * — the API is authoritative — but we'd rather export a partial PGN than throw).
 *
 * When the match carries `clock_history`, each move is annotated with a standard
 * `{[%clk H:MM:SS]}` comment for the side that just moved; without it the movetext is
 * exactly as before.
 */
export function matchToPgn(match: Match): string {
  const chess = new Chess(INITIAL_FEN)
  for (let i = 0; i < match.moves.length; i++) {
    const uci = match.moves[i]
    try {
      const ok = chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.length > 4 ? uci[4] : undefined,
      })
      if (!ok) break
    } catch {
      break
    }

    const snapshot = match.clock_history?.[i]
    if (snapshot) {
      const remaining = i % 2 === 0 ? snapshot.white_time_ms : snapshot.black_time_ms
      chess.setComment(`[%clk ${msToPgnClockString(remaining)}]`)
    }
  }

  chess.setHeader('Event', `maichess ${formatTimeFormatLabel(match.time_format)}`)
  chess.setHeader('Site', 'maichess')
  chess.setHeader('Date', todayUtcDate())
  chess.setHeader('Round', '-')
  chess.setHeader('White', playerDisplayName(match.white))
  chess.setHeader('Black', playerDisplayName(match.black))
  chess.setHeader('Result', pgnResult(match.status))
  chess.setHeader('TimeControl', `${Math.floor(match.time_format.base_ms / 1000)}+${Math.floor(match.time_format.increment_ms / 1000)}`)

  return chess.pgn()
}
