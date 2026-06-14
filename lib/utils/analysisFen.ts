import type { AnalysisGameDetail } from '@/lib/models/analysis'

// Resolve the board FEN at a navigation index purely from the precomputed game data,
// so read-only (no-engine) mode can navigate without a server session.
//
// Index semantics match AnalysisMoveList: index 0 = starting position, index k = the
// position after k moves. `fens` may or may not include the starting position, so both
// layouts are handled:
//   - fens.length === moves.length + 1 → fens[0] is the start, fens[k] is after k moves
//   - fens.length === moves.length     → fens[k-1] is after k moves (no start entry)
export function fenAtIndex(game: AnalysisGameDetail, index: number): string {
  const { fens, moves, starting_fen } = game
  const clamped = Math.max(0, Math.min(index, moves.length))

  if (fens.length === moves.length + 1) {
    return fens[clamped] ?? starting_fen
  }

  if (clamped === 0) return starting_fen
  return fens[clamped - 1] ?? starting_fen
}
