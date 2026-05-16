'use client'

import { useEffect, useMemo, useRef } from 'react'
import { uciListToSan } from '@/lib/utils/san'

interface MoveListProps {
  moves: string[]
}

function groupMoves(moves: string[]): Array<[string, string | null]> {
  const pairs: Array<[string, string | null]> = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1] ?? null])
  }
  return pairs
}

export function MoveList({ moves }: MoveListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [moves.length])

  const sanMoves = useMemo(() => uciListToSan(moves), [moves])
  const pairs = groupMoves(sanMoves)

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border">
        Moves
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin">
        {pairs.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-6">Game start</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {pairs.map(([white, black], i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? '' : 'bg-bg-elevated/40'}
                >
                  <td className="w-7 py-0.5 pl-2 text-text-muted text-xs tabular-nums">
                    {i + 1}.
                  </td>
                  <td className="py-0.5 px-2 font-mono text-text-primary w-1/2">
                    {white}
                  </td>
                  <td className="py-0.5 px-2 font-mono text-text-secondary w-1/2">
                    {black ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
