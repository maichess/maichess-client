'use client'

import { useState } from 'react'
import { useBots } from '@/lib/hooks/useBots'
import { useTimeFormats } from '@/lib/hooks/useTimeFormats'
import { useCreateArenaSetup } from '@/lib/hooks/useCreateArenaSetup'
import type { SetupType, ColorMode, MatrixColorMode } from '@/lib/models/arena'
import { Button } from '@/lib/components/ui/Button'
import { Input } from '@/lib/components/ui/Input'
import { Spinner } from '@/lib/components/ui/Spinner'

type Tab = SetupType

export function SpawnSetupForm() {
  const { bots, loading: botsLoading } = useBots()
  const { formats, loading: formatsLoading } = useTimeFormats()
  const { create, submitting, error } = useCreateArenaSetup()
  const [tab, setTab] = useState<Tab>('tournament')

  const [name, setName] = useState('')
  const [selectedBotIds, setSelectedBotIds] = useState<string[]>([])
  const [whiteBotId, setWhiteBotId] = useState('')
  const [blackBotId, setBlackBotId] = useState('')
  const [fenText, setFenText] = useState('')
  const [timeFormatId, setTimeFormatId] = useState('')
  const [fensPerStage, setFensPerStage] = useState(1)
  const [colorMode, setColorMode] = useState<ColorMode>('both_colors')
  const [matrixColorMode, setMatrixColorMode] = useState<MatrixColorMode>('alternating')
  const [gamesPerFen, setGamesPerFen] = useState(1)
  const [keepSwitchingColors, setKeepSwitchingColors] = useState(false)

  if (botsLoading || formatsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  function parseFenList(): string[] {
    const lines = fenText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    return lines.length > 0 ? lines : ['standard']
  }

  function toggleBot(id: string) {
    setSelectedBotIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    )
  }

  // The white/black selects display the first/second bot by default, but their
  // state stays empty until the user actively changes them. Resolve the same
  // fallbacks used on submit so gating matches what the user sees selected.
  const effectiveWhiteBotId = whiteBotId || bots[0]?.id || ''
  const effectiveBlackBotId = blackBotId || bots[1]?.id || bots[0]?.id || ''

  async function handleSubmit() {
    const fenList = parseFenList()
    const tfId = timeFormatId || formats[0]?.id || ''

    if (tab === 'tournament') {
      await create({
        name: name || 'Tournament',
        tournament: {
          bot_ids: selectedBotIds,
          fen_list: fenList,
          fens_per_stage: fensPerStage,
          color_mode: colorMode,
          time_format_id: tfId,
        },
      })
    } else if (tab === 'matrix') {
      await create({
        name: name || 'Matrix',
        matrix: {
          bot_ids: selectedBotIds,
          fen_list: fenList,
          games_per_fen: gamesPerFen,
          color_mode: matrixColorMode,
          time_format_id: tfId,
        },
      })
    } else {
      await create({
        name: name || 'Single',
        single: {
          white_bot_id: effectiveWhiteBotId,
          black_bot_id: effectiveBlackBotId,
          fen_list: fenList,
          games_per_fen: gamesPerFen,
          keep_switching_colors: keepSwitchingColors,
          time_format_id: tfId,
        },
      })
    }
  }

  const needsMultiBot = tab === 'tournament' || tab === 'matrix'
  const canSubmit =
    name.trim() !== '' &&
    (needsMultiBot
      ? selectedBotIds.length >= 2
      : effectiveWhiteBotId !== '' && effectiveBlackBotId !== '')

  return (
    <div className="flex flex-col gap-6">
      {/* Type tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['tournament', 'matrix', 'single'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-all cursor-pointer capitalize',
              tab === t
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-primary',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Name */}
      <Input
        id="name"
        label="Collection name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`My ${tab}`}
        required
      />

      {/* Bot selection */}
      {needsMultiBot ? (
        <div>
          <label className="text-sm font-medium text-text-secondary mb-2 block">
            Select bots (min 2)
          </label>
          <div className="flex flex-wrap gap-2">
            {bots.map((bot) => {
              const selected = selectedBotIds.includes(bot.id)
              return (
                <button
                  key={bot.id}
                  type="button"
                  onClick={() => toggleBot(bot.id)}
                  className={[
                    'rounded-full border px-3 py-1.5 text-sm font-medium transition-all cursor-pointer',
                    selected
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-bg-secondary text-text-muted hover:border-accent/40',
                  ].join(' ')}
                >
                  {bot.name}
                </button>
              )
            })}
          </div>
          {selectedBotIds.length > 0 && (
            <p className="mt-1 text-xs text-text-muted">{selectedBotIds.length} selected</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="white-bot" className="text-sm font-medium text-text-secondary mb-1 block">
              White bot
            </label>
            <select
              id="white-bot"
              value={whiteBotId || bots[0]?.id || ''}
              onChange={(e) => setWhiteBotId(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {bots.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="black-bot" className="text-sm font-medium text-text-secondary mb-1 block">
              Black bot
            </label>
            <select
              id="black-bot"
              value={blackBotId || (bots[1]?.id ?? bots[0]?.id ?? '')}
              onChange={(e) => setBlackBotId(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {bots.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* FEN list */}
      <div>
        <label htmlFor="fen-list" className="text-sm font-medium text-text-secondary mb-1 block">
          FEN list
        </label>
        <textarea
          id="fen-list"
          value={fenText}
          onChange={(e) => setFenText(e.target.value)}
          rows={3}
          placeholder="One FEN per line. Leave empty for standard start position."
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted resize-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="mt-1 text-[11px] text-text-muted">
          Leave empty or enter &quot;standard&quot; for the standard starting position.
        </p>
      </div>

      {/* Type-specific options */}
      {tab === 'tournament' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fens-per-stage" className="text-sm font-medium text-text-secondary mb-1 block">
              FENs per stage
            </label>
            <input
              id="fens-per-stage"
              type="number"
              min={1}
              value={fensPerStage}
              onChange={(e) => setFensPerStage(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="h-10 w-full rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label htmlFor="color-mode" className="text-sm font-medium text-text-secondary mb-1 block">
              Color mode
            </label>
            <select
              id="color-mode"
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value as ColorMode)}
              className="h-10 w-full rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="both_colors">Both colors (each FEN played twice)</option>
              <option value="random">Random (each FEN played once)</option>
            </select>
          </div>
          <p className="sm:col-span-2 text-[11px] text-text-muted">
            Single-elimination bracket. Each stage plays the selected number of positions.
            In &quot;both colors&quot; mode each position is played twice (colors swapped).
            Ties are broken by more wins, then fewer rounds to win, then clock advantage.
          </p>
        </div>
      )}

      {(tab === 'matrix' || tab === 'single') && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="games-per-fen" className="text-sm font-medium text-text-secondary mb-1 block">
              Games per FEN
            </label>
            <input
              id="games-per-fen"
              type="number"
              min={1}
              value={gamesPerFen}
              onChange={(e) => setGamesPerFen(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="h-10 w-full rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          {tab === 'single' && (
            <div className="flex items-center gap-3 self-end pb-1">
              <button
                type="button"
                role="switch"
                aria-checked={keepSwitchingColors}
                onClick={() => setKeepSwitchingColors(!keepSwitchingColors)}
                className={[
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  keepSwitchingColors ? 'bg-accent border-accent' : 'bg-text-muted/30 border-text-muted/40',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block size-5 transform rounded-full bg-white shadow transition-transform',
                    keepSwitchingColors ? 'translate-x-5' : 'translate-x-0.5',
                  ].join(' ')}
                />
              </button>
              <label className="text-sm text-text-secondary">Keep switching colors</label>
            </div>
          )}
          {tab === 'matrix' && (
            <div>
              <label htmlFor="matrix-color-mode" className="text-sm font-medium text-text-secondary mb-1 block">
                Color assignment
              </label>
              <select
                id="matrix-color-mode"
                value={matrixColorMode}
                onChange={(e) => setMatrixColorMode(e.target.value as MatrixColorMode)}
                className="h-10 w-full rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="alternating">Alternate colors per game</option>
                <option value="random">Random colors per game</option>
              </select>
            </div>
          )}
          {tab === 'matrix' && (
            <p className="sm:col-span-2 text-[11px] text-text-muted">
              Round-robin: every bot pair plays each FEN the specified number of times.
              In &quot;alternate&quot; mode colors swap deterministically per game; in
              &quot;random&quot; mode each game&apos;s colors are assigned at random.
            </p>
          )}
        </div>
      )}

      {/* Time format */}
      <div>
        <label htmlFor="time-format" className="text-sm font-medium text-text-secondary mb-1 block">
          Time format
        </label>
        <select
          id="time-format"
          value={timeFormatId || formats[0]?.id || ''}
          onChange={(e) => setTimeFormatId(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {formats.map((f) => (
            <option key={f.id} value={f.id}>
              {f.id} ({f.category})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <Button onClick={handleSubmit} loading={submitting} disabled={!canSubmit}>
        Create {tab}
      </Button>
    </div>
  )
}
