import type { AnalysisLine } from '@/lib/models/analysis'
import type { BoardArrow } from '@/lib/components/ChessBoard'

const BEST_LINE_GREEN = [
  'rgba(34, 197, 94, 0.95)',
  'rgba(34, 197, 94, 0.70)',
  'rgba(34, 197, 94, 0.50)',
  'rgba(34, 197, 94, 0.35)',
  'rgba(34, 197, 94, 0.25)',
]

const ACTUAL_MOVE_GREY = 'rgba(210, 213, 219, 0.65)'

// Distinct lime tone used when the actual played move coincides with one of
// the engine's best lines. Visually unique against the green ladder so the
// viewer can tell at a glance "this was both played and rated as a top line".
const OVERLAP_HIGHLIGHT = 'rgba(190, 242, 100, 0.95)'

function uciToArrowParts(uci: string): { from: string; to: string } | null {
  if (uci.length < 4) return null
  return { from: uci.slice(0, 2), to: uci.slice(2, 4) }
}

function greenForRank(rank: number): string {
  const idx = Math.max(0, Math.min(BEST_LINE_GREEN.length - 1, rank - 1))
  return BEST_LINE_GREEN[idx]
}

/**
 * Builds the arrow overlay for the analysis board.
 * - One green arrow per analysed line, brightness fading with worse lines.
 * - One light-grey arrow for the move actually played from this position
 *   (when known and not in whatif mode).
 * - When the played move matches one of the best lines, the matching arrow
 *   is recoloured to a distinct overlap tone and no separate grey arrow is drawn.
 */
export function buildAnalysisArrows(
  lines: AnalysisLine[],
  actualMoveUci: string | null,
): BoardArrow[] {
  const arrows: BoardArrow[] = []
  let overlapHandled = false

  for (const line of lines) {
    const first = line.moves[0]
    if (!first) continue
    const parts = uciToArrowParts(first)
    if (!parts) continue
    const isOverlap = actualMoveUci != null && first.slice(0, 4) === actualMoveUci.slice(0, 4)
    if (isOverlap) overlapHandled = true
    arrows.push({
      startSquare: parts.from,
      endSquare: parts.to,
      color: isOverlap ? OVERLAP_HIGHLIGHT : greenForRank(line.rank),
    })
  }

  if (actualMoveUci && !overlapHandled) {
    const parts = uciToArrowParts(actualMoveUci)
    if (parts) {
      arrows.push({
        startSquare: parts.from,
        endSquare: parts.to,
        color: ACTUAL_MOVE_GREY,
      })
    }
  }

  return arrows
}
