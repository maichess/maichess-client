import type { ClockSnapshot } from '@/lib/models/match'
import { msToClockString } from '@/lib/utils/time'

export interface MoveClockDisplay {
  // Remaining clock for the side that made this move, e.g. "4:59".
  remaining: string
  // Time spent on this move (M:SS), derived from the same side's previous snapshot;
  // null for each side's first move (no prior snapshot to subtract from) or when the
  // clocks don't yield a non-negative delta. Increment is not known here, so a game
  // with increment slightly under-reports — surfaced as a hover hint only.
  spent: string | null
}

/**
 * Derives per-ply clock display values from a game's clock_history. Returns an empty
 * array when there is no clock data, so callers degrade to a clock-less move list.
 * clockHistory[i] holds the clocks after ply i; the mover alternates white (even
 * plies) / black (odd plies).
 */
export function deriveMoveClocks(clockHistory?: ClockSnapshot[]): MoveClockDisplay[] {
  if (!clockHistory || clockHistory.length === 0) return []

  return clockHistory.map((snap, i) => {
    const isWhite = i % 2 === 0
    const remainingMs = isWhite ? snap.white_time_ms : snap.black_time_ms

    let spent: string | null = null
    const prev = clockHistory[i - 2]
    if (prev) {
      const prevMs = isWhite ? prev.white_time_ms : prev.black_time_ms
      const diff = prevMs - remainingMs
      if (diff >= 0) spent = msToClockString(diff)
    }

    return { remaining: msToClockString(remainingMs), spent }
  })
}
