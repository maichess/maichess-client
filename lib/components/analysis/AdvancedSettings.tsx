'use client'

import { useState } from 'react'
import type { Bot } from '@/lib/models/analysis'

interface AdvancedSettingsProps {
  bots: Bot[]
  botId: string
  lineCount: number
  defaultBotId: string
  defaultLineCount: number
  onApply: (botId: string, lineCount: number) => void
}

export function AdvancedSettings({
  bots,
  botId,
  lineCount,
  defaultBotId,
  defaultLineCount,
  onApply,
}: AdvancedSettingsProps) {
  const [open, setOpen] = useState(false)
  const [localBotId, setLocalBotId] = useState(botId)
  const [localLineCount, setLocalLineCount] = useState(lineCount)

  function handleApply() {
    onApply(localBotId, localLineCount)
  }

  function handleReset() {
    setLocalBotId(defaultBotId)
    setLocalLineCount(defaultLineCount)
    onApply(defaultBotId, defaultLineCount)
  }

  // Mirrors Apply's disabled logic: nothing to reset when the applied settings are
  // already the defaults.
  const atDefaults = botId === defaultBotId && lineCount === defaultLineCount

  return (
    <div className="rounded-xl border border-border bg-bg-secondary overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors"
      >
        <span>Advanced settings</span>
        <span className="text-base leading-none">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">Engine</label>
            <select
              value={localBotId}
              onChange={(e) => setLocalBotId(e.target.value)}
              className="w-full rounded-md border border-border bg-bg-elevated px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {bots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name} (ELO {bot.elo})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1">Lines</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setLocalLineCount(n)}
                  className={[
                    'flex-1 rounded-md py-1 text-sm font-medium transition-colors',
                    localLineCount === n
                      ? 'bg-accent text-accent-text'
                      : 'bg-bg-elevated text-text-secondary hover:text-text-primary border border-border',
                  ].join(' ')}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleApply}
            disabled={localBotId === botId && localLineCount === lineCount}
            className="w-full rounded-md bg-accent text-accent-text py-1.5 text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Apply
          </button>

          <button
            onClick={handleReset}
            disabled={atDefaults}
            className="w-full rounded-md border border-border bg-bg-elevated text-text-secondary py-1.5 text-sm font-medium hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset to default
          </button>
        </div>
      )}
    </div>
  )
}
