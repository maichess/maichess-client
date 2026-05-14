'use client'

import { pieceGlyph } from '@/lib/utils/captured'

interface PromotionPickerProps {
  color: 'w' | 'b'
  // Where on the board (0–7 file index, 0–7 rank index from white's bottom)
  // and orientation determine vertical stacking direction.
  targetSquare: string
  orientation: 'white' | 'black'
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void
  onCancel: () => void
}

const PIECES: Array<'q' | 'r' | 'b' | 'n'> = ['q', 'r', 'b', 'n']

export function PromotionPicker({
  color,
  targetSquare,
  orientation,
  onSelect,
  onCancel,
}: PromotionPickerProps) {
  const file = targetSquare.charCodeAt(0) - 'a'.charCodeAt(0)
  const rank = parseInt(targetSquare[1], 10) - 1

  // Board is rendered with files 0..7 left-to-right when orientation=white,
  // reversed otherwise. Same for ranks bottom-to-top.
  const col = orientation === 'white' ? file : 7 - file
  const row = orientation === 'white' ? 7 - rank : rank

  const leftPercent = (col / 8) * 100
  // The picker grows *into* the board from the promotion square. For white the
  // promotion square is the top rank from white's view, so the column extends
  // downward. For black it's at the bottom of black's view, also downward.
  const topPercent = (row / 8) * 100

  return (
    <div
      className="absolute inset-0 z-20 bg-black/40"
      onClick={onCancel}
      onContextMenu={(e) => {
        e.preventDefault()
        onCancel()
      }}
    >
      <div
        className="absolute flex flex-col rounded-md bg-bg-elevated shadow-2xl ring-1 ring-border overflow-hidden"
        style={{
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          width: '12.5%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {PIECES.map((p) => {
          const glyphKey = color === 'w' ? p.toUpperCase() : p
          return (
            <button
              key={p}
              type="button"
              onClick={() => onSelect(p)}
              className="aspect-square w-full flex items-center justify-center text-3xl sm:text-4xl text-text-primary hover:bg-accent/20 transition-colors"
              aria-label={`Promote to ${pieceName(p)}`}
            >
              <span className={color === 'w' ? 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]' : 'text-black'}>
                {pieceGlyph(glyphKey)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function pieceName(p: 'q' | 'r' | 'b' | 'n'): string {
  switch (p) {
    case 'q': return 'queen'
    case 'r': return 'rook'
    case 'b': return 'bishop'
    case 'n': return 'knight'
  }
}
