'use client'

import { useEffect, useRef, useState } from 'react'
import type { Player } from '@/lib/models/match'
import { playerDisplayName, isUserPlayer } from '@/lib/models/match'
import { msToClockString, isCriticalTime } from '@/lib/utils/time'
import { pieceGlyph } from '@/lib/utils/captured'

interface PlayerCardProps {
  player: Player
  timeMs: number
  lastMoveAtMs: number
  isActive: boolean
  side: 'white' | 'black'
  elo?: number
  /** Pieces this player has captured from the opponent. */
  captured?: string[]
  /** Material advantage; positive means this player is ahead. Hidden when not positive. */
  materialAdvantage?: number
}

export function PlayerCard({
  player,
  timeMs,
  lastMoveAtMs,
  isActive,
  side,
  elo,
  captured,
  materialAdvantage,
}: PlayerCardProps) {
  const [displayTime, setDisplayTime] = useState(timeMs)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastTickRef = useRef<number>(0)
  const isActiveRef = useRef(isActive)
  isActiveRef.current = isActive

  useEffect(() => {
    const alreadyElapsed = isActiveRef.current ? Math.max(0, Date.now() - lastMoveAtMs) : 0
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayTime(Math.max(0, timeMs - alreadyElapsed))
    lastTickRef.current = Date.now()
  }, [timeMs, lastMoveAtMs])

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    lastTickRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastTickRef.current
      lastTickRef.current = now
      setDisplayTime((prev) => Math.max(0, prev - elapsed))
    }, 100)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive])

  const isBot = !isUserPlayer(player)
  const displayName = playerDisplayName(player)
  const critical = isCriticalTime(displayTime)
  const hasCaptured = captured && captured.length > 0
  const advantage = materialAdvantage ?? 0

  return (
    <div
      className={[
        'flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300',
        isActive
          ? 'bg-bg-elevated border border-accent/40 shadow-lg shadow-accent/5'
          : 'bg-bg-secondary border border-border',
      ].join(' ')}
    >
      <div className="flex min-w-0 items-center gap-3">
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

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-text-primary leading-none truncate">
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
          {hasCaptured && (
            <div className="mt-1 flex items-center gap-1 text-base leading-none text-text-muted">
              <span aria-label="captured pieces" className="tracking-tight">
                {captured!.map((p) => pieceGlyph(p)).join('')}
              </span>
              {advantage > 0 && (
                <span className="text-[10px] font-semibold text-accent">+{advantage}</span>
              )}
            </div>
          )}
        </div>
      </div>

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
