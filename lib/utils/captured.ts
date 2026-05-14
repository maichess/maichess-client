import { Chess } from 'chess.js'

export interface CapturedPieces {
  // Pieces captured *by* white (i.e. black pieces removed from the board)
  byWhite: string[]
  // Pieces captured *by* black (i.e. white pieces removed)
  byBlack: string[]
  // Material differential from white's perspective (positive = white ahead)
  diff: number
}

const PIECE_VALUE: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9,
}

const PIECE_GLYPH: Record<string, string> = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛',
  P: '♟', N: '♞', B: '♝', R: '♜', Q: '♛',
}

export function computeCaptured(startingFen: string, uciMoves: readonly string[]): CapturedPieces {
  const game = new Chess(startingFen)
  const byWhite: string[] = []
  const byBlack: string[] = []

  for (const uci of uciMoves) {
    const move = parseUci(uci)
    if (!move) continue
    try {
      const result = game.move(move)
      if (result?.captured) {
        // The captured piece belongs to the side that just moved's opponent.
        // result.color is the side that moved.
        if (result.color === 'w') byWhite.push(result.captured)
        else byBlack.push(result.captured)
      }
    } catch {
      // Skip malformed move histories rather than crashing the UI.
      return { byWhite, byBlack, diff: materialDiff(byWhite, byBlack) }
    }
  }

  return { byWhite, byBlack, diff: materialDiff(byWhite, byBlack) }
}

export function pieceGlyph(piece: string): string {
  return PIECE_GLYPH[piece] ?? piece
}

function parseUci(uci: string): { from: string; to: string; promotion?: string } | null {
  if (uci.length < 4) return null
  const from = uci.slice(0, 2)
  const to = uci.slice(2, 4)
  const promotion = uci.length > 4 ? uci[4] : undefined
  return { from, to, promotion }
}

function materialDiff(byWhite: string[], byBlack: string[]): number {
  const sum = (xs: string[]) => xs.reduce((acc, p) => acc + (PIECE_VALUE[p.toLowerCase()] ?? 0), 0)
  return sum(byWhite) - sum(byBlack)
}
