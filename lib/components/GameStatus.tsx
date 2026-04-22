'use client'

import type { MatchStatus, EndReason } from '@/lib/models/match'

interface GameStatusProps {
  status: MatchStatus
  reason?: EndReason
  myColor: 'white' | 'black' | null
}

const reasonLabels: Record<EndReason, string> = {
  checkmate: 'by checkmate',
  resignation: 'by resignation',
  stalemate: 'by stalemate',
  timeout: 'on time',
  draw_agreement: 'by agreement',
}

export function GameStatus({ status, reason, myColor }: GameStatusProps) {
  if (status === 'ongoing') return null

  const isDraw = status === 'draw'
  const iWon =
    (status === 'white_won' && myColor === 'white') ||
    (status === 'black_won' && myColor === 'black')
  const iLost =
    (status === 'white_won' && myColor === 'black') ||
    (status === 'black_won' && myColor === 'white')

  let headline: string
  let colorClass: string

  if (isDraw) {
    headline = 'Draw'
    colorClass = 'text-text-secondary'
  } else if (myColor === null) {
    headline = status === 'white_won' ? 'White wins' : 'Black wins'
    colorClass = 'text-text-primary'
  } else if (iWon) {
    headline = 'You win!'
    colorClass = 'text-accent'
  } else if (iLost) {
    headline = 'You lost'
    colorClass = 'text-danger'
  } else {
    headline = status === 'white_won' ? 'White wins' : 'Black wins'
    colorClass = 'text-text-primary'
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-bg-elevated px-6 py-4 text-center">
      <span className={`text-2xl font-bold ${colorClass}`}>{headline}</span>
      {reason && (
        <span className="text-sm text-text-muted">{reasonLabels[reason]}</span>
      )}
    </div>
  )
}
