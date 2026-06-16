'use client'

import { useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import { getActiveColor } from '@/lib/utils/fen'

// Normalized FENs from the insights jobs strip the halfmove-clock and fullmove-number
// fields; react-chessboard only needs piece placement but we pad to a full 6-field FEN so
// nothing downstream chokes on the short form.
function completeFen(fen: string): string {
  const parts = fen.trim().split(/\s+/)
  while (parts.length < 4) parts.push('-')
  if (parts.length < 5) parts.push('0')
  if (parts.length < 6) parts.push('1')
  return parts.join(' ')
}

// A small, non-interactive board for FEN previews in the positions / tricky / endgame
// lists. Orientation follows the side to move so the "tricky" decision is shown from the
// perspective of the player on the clock.
export function BoardPreview({ fen, size = 220 }: { fen: string; size?: number }) {
  const full = useMemo(() => completeFen(fen), [fen])
  const orientation = getActiveColor(full) === 'b' ? 'black' : 'white'

  return (
    <div style={{ width: size }} className="mx-auto">
      <Chessboard
        options={{
          position: full,
          boardOrientation: orientation,
          allowDragging: false,
          showNotation: false,
          boardStyle: { borderRadius: '6px' },
        }}
      />
    </div>
  )
}
