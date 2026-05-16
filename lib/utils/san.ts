import { Chess } from 'chess.js'

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

/**
 * Converts a list of UCI moves into SAN strings (e.g. "Qxd8", "exd5", "O-O").
 * Stops at the first illegal move and returns whatever was converted so the
 * caller still gets a partial render rather than nothing.
 */
export function uciListToSan(moves: readonly string[], startingFen: string = INITIAL_FEN): string[] {
  const chess = new Chess(startingFen)
  const out: string[] = []
  for (const uci of moves) {
    try {
      const result = chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.length > 4 ? uci[4] : undefined,
      })
      if (!result) break
      out.push(result.san)
    } catch {
      break
    }
  }
  return out
}

/**
 * Converts a single UCI move to SAN given the position FEN it is played from.
 * Returns null when the move is illegal in that position.
 */
export function uciToSan(uci: string, fromFen: string): string | null {
  try {
    const chess = new Chess(fromFen)
    const result = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.length > 4 ? uci[4] : undefined,
    })
    return result?.san ?? null
  } catch {
    return null
  }
}
