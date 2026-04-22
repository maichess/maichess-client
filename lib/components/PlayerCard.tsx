'use client'

import { useEffect, useRef, useState } from 'react'
import type { Player } from '@/lib/models/match'
import { playerDisplayName, isUserPlayer } from '@/lib/models/match'
import { msToClockString, isCriticalTime } from '@/lib/utils/time'

interface PlayerCardProps {
  player: Player
  timeMs: number
  isActive: boolean
  side: 'white' | 'black'
  elo?: number
}

export function PlayerCard({ player, timeMs, isActive, side, elo }: PlayerCardProps) {
  const [displayTime, setDisplayTime] = useState(timeMs)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastTickRef = useRef<number>(Date.now())

  // Run a client-side countdown when it's this player's turn
  useEffect(() => {
    setDisplayTime(timeMs)
    lastTickRef.current = Date.now()

    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastTickRef.current
      lastTickRef.current = now
      setDisplayTime((prev) => Math.max(0, prev - elapsed))
    }, 100)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timeMs, isActive])

  const isBot = !isUserPlayer(player)
  const displayName = playerDisplayName(player)
  const critical = isCriticalTime(displayTime)

  return (
    <div
      className={[
        'flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300',
        isActive
          ? 'bg-bg-elevated border border-accent/40 shadow-lg shadow-accent/5'
          : 'bg-bg-secondary border border-border',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={[
            'size-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
            side === 'white'
              ? 'bg-white text-gray-900 border border-border'
              : 'bg-gray-900 text-white border border-gray-700',
          ].join(' ')}
        >
          {isBot ? '🤖' : displayName[0].toUpperCase()}
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-text-primary leading-none">
              {displayName}
            </span>
            {isBot && (
              <span className="text-[10px] px-1 py-0.5 rounded bg-accent/20 text-accent font-medium">
                BOT
              </span>
            )}
          </div>
          {elo !== undefined && (
            <span className="text-xs text-text-muted">{elo} ELO</span>
          )}
        </div>
      </div>

      {/* Clock */}
      <div
        className={[
          'font-mono text-xl font-semibold tabular-nums transition-colors duration-300',
          critical && isActive
            ? 'text-danger animate-pulse'
            : isActive
            ? 'text-text-primary'
            : 'text-text-muted',
        ].join(' ')}
      >
        {msToClockString(displayTime)}
      </div>
    </div>
  )
}
