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
