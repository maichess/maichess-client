'use client'

import { useEffect, useMemo, useRef } from 'react'
import { uciListToSan } from '@/lib/utils/san'
import { deriveMoveClocks } from '@/lib/utils/moveClocks'
import type { ClockSnapshot } from '@/lib/models/match'

interface AnalysisMoveListProps {
  moves: string[]
  startingFen?: string
  currentIndex: number
  onNavigate: (index: number) => void
  clockHistory?: ClockSnapshot[]
}

export function AnalysisMoveList({ moves, startingFen, currentIndex, onNavigate, clockHistory }: AnalysisMoveListProps) {
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentIndex])

  const sanMoves = useMemo(() => uciListToSan(moves, startingFen), [moves, startingFen])
  const clocks = useMemo(() => deriveMoveClocks(clockHistory), [clockHistory])

  if (sanMoves.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border">
          Moves
        </div>
        <p className="text-xs text-text-muted text-center py-6">Starting position</p>
      </div>
    )
  }

  const pairs: Array<[number, string, string | null]> = []
  for (let i = 0; i < sanMoves.length; i += 2) {
    pairs.push([i, sanMoves[i], sanMoves[i + 1] ?? null])
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border">
        Moves
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin">
        <table className="w-full text-sm">
          <tbody>
            {pairs.map(([whiteIdx, white, black]) => {
              const blackIdx = whiteIdx + 1
              const moveNum = whiteIdx / 2 + 1
              return (
                <tr key={whiteIdx} className={Math.floor(whiteIdx / 2) % 2 === 0 ? '' : 'bg-bg-elevated/40'}>
                  <td className="w-7 py-0.5 pl-2 text-text-muted text-xs tabular-nums">
                    {moveNum}.
                  </td>
                  <td className="py-0.5 px-1 w-1/2">
                    <button
                      ref={currentIndex === whiteIdx + 1 ? activeRef : undefined}
                      onClick={() => onNavigate(whiteIdx + 1)}
                      className={[
                        'w-full font-mono px-1 rounded transition-colors flex items-baseline justify-between gap-1',
                        currentIndex === whiteIdx + 1
                          ? 'bg-accent text-accent-text'
                          : 'text-text-primary hover:bg-bg-elevated',
                      ].join(' ')}
                    >
                      <span>{white}</span>
                      <MoveClock clock={clocks[whiteIdx]} />
                    </button>
                  </td>
                  <td className="py-0.5 px-1 w-1/2">
                    {black != null && (
                      <button
                        ref={currentIndex === blackIdx + 1 ? activeRef : undefined}
                        onClick={() => onNavigate(blackIdx + 1)}
                        className={[
                          'w-full font-mono px-1 rounded transition-colors flex items-baseline justify-between gap-1',
                          currentIndex === blackIdx + 1
                            ? 'bg-accent text-accent-text'
                            : 'text-text-secondary hover:bg-bg-elevated',
                        ].join(' ')}
                      >
                        <span>{black}</span>
                        <MoveClock clock={clocks[blackIdx]} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MoveClock({ clock }: { clock?: { remaining: string; spent: string | null } }) {
  if (!clock) return null
  return (
    <span
      className="text-[10px] font-normal text-text-muted tabular-nums shrink-0"
      title={clock.spent ? `${clock.spent} spent` : undefined}
    >
      {clock.remaining}
    </span>
  )
}
