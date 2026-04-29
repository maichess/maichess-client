'use client'

import { useEffect, useRef } from 'react'

interface AnalysisMoveListProps {
  moves: string[]
  currentIndex: number
  onNavigate: (index: number) => void
}

export function AnalysisMoveList({ moves, currentIndex, onNavigate }: AnalysisMoveListProps) {
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentIndex])

  if (moves.length === 0) {
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
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([i, moves[i], moves[i + 1] ?? null])
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
                        'w-full text-left font-mono px-1 rounded transition-colors',
                        currentIndex === whiteIdx + 1
                          ? 'bg-accent text-accent-text'
                          : 'text-text-primary hover:bg-bg-elevated',
                      ].join(' ')}
                    >
                      {white}
                    </button>
                  </td>
                  <td className="py-0.5 px-1 w-1/2">
                    {black != null && (
                      <button
                        ref={currentIndex === blackIdx + 1 ? activeRef : undefined}
                        onClick={() => onNavigate(blackIdx + 1)}
                        className={[
                          'w-full text-left font-mono px-1 rounded transition-colors',
                          currentIndex === blackIdx + 1
                            ? 'bg-accent text-accent-text'
                            : 'text-text-secondary hover:bg-bg-elevated',
                        ].join(' ')}
                      >
                        {black}
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
