import { Chess } from 'chess.js'

/**
 * Returns the active color from a FEN string: 'w' or 'b'
 */
export function getActiveColor(fen: string): 'w' | 'b' {
  return fen.split(' ')[1] as 'w' | 'b'
}

/**
 * Returns the piece type and color at a given square, or null if empty.
 * e.g. { type: 'p', color: 'b' }
 */
export function getPieceAt(
  fen: string,
  square: string
): { type: string; color: 'w' | 'b' } | null {
  try {
    const chess = new Chess(fen)
    return chess.get(square as Parameters<typeof chess.get>[0]) ?? null
  } catch {
    return null
  }
}

/**
 * Returns true if the position has no legal moves (checkmate or stalemate).
 * Used only as a fallback UI hint — the API is authoritative.
 */
export function hasNoLegalMoves(fen: string): boolean {
  try {
    const chess = new Chess(fen)
    return chess.moves().length === 0
  } catch {
    return false
  }
}

/**
 * Applies a UCI move to a FEN string and returns the resulting FEN.
 * Returns null if the move is illegal or the FEN is invalid.
 * Used for optimistic UI updates — the server is authoritative.
 */
export function applyMove(fen: string, uci: string): string | null {
  try {
    const chess = new Chess(fen)
    const result = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci[4],
    })
    if (!result) return null
    return chess.fen()
  } catch {
    return null
  }
}
