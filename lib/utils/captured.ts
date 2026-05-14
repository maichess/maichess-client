import { Chess } from 'chess.js'

export interface CapturedPieces {
  // Pieces captured *by* white (i.e. black pieces removed from the board)
  byWhite: string[]
  // Pieces captured *by* black (i.e. white pieces removed)
  byBlack: string[]
  // Material differential from white's perspective (positive = white ahead),
  // computed from the pieces currently on the board so promotions are reflected.
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
      return { byWhite, byBlack, diff: materialFromBoard(game.fen()) }
    }
  }

  return { byWhite, byBlack, diff: materialFromBoard(game.fen()) }
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

// Sums material from the pieces currently on the board (kings excluded) so
// promotions are reflected — e.g. a queen earned via promotion adds to the
// advantage, not the pawn that no longer exists.
function materialFromBoard(fen: string): number {
  const placement = fen.split(' ')[0]
  let white = 0
  let black = 0
  for (const ch of placement) {
    const lower = ch.toLowerCase()
    const value = PIECE_VALUE[lower]
    if (value === undefined) continue
    if (ch === lower) black += value
    else white += value
  }
  return white - black
}
