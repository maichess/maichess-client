'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense, useEffect, useMemo } from 'react'
import { Button } from '@/lib/components/ui/Button'
import { MatchmakingModal } from '@/lib/components/MatchmakingModal'
import { useMatchmaking } from '@/lib/hooks/useMatchmaking'
import { useBots } from '@/lib/hooks/useBots'
import { useTimeFormats } from '@/lib/hooks/useTimeFormats'
import { formatTimeFormatDuration, formatTimeFormatLabel } from '@/lib/utils/time'
import { ROUTES } from '@/lib/constants/routes'
import { Swords, Bot, Users } from 'lucide-react'
import type { OpponentType, QueueRequest } from '@/lib/models/queue'
import type { TimeFormat, TimeFormatCategory } from '@/lib/models/match'

const CATEGORY_LABELS: Record<TimeFormatCategory, string> = {
  bullet: 'Bullet',
  blitz: 'Blitz',
  rapid: 'Rapid',
  classical: 'Classical',
}

const CATEGORY_ORDER: TimeFormatCategory[] = ['bullet', 'blitz', 'rapid', 'classical']

function PlayForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialOpponent = searchParams.get('opponent') === 'bot' ? 'bot' : 'human'

  const [timeFormatId, setTimeFormatId] = useState<string>('5+0')
  const [opponentType, setOpponentType] = useState<OpponentType>(initialOpponent)
  const [selectedBot, setSelectedBot] = useState('')
  const [whiteBot, setWhiteBot] = useState('')
  const [blackBot, setBlackBot] = useState('')
  const [allowFlagged, setAllowFlagged] = useState(false)
  const [botVsBotError, setBotVsBotError] = useState<string | null>(null)
  const [botVsBotSubmitting, setBotVsBotSubmitting] = useState(false)

  const { bots, loading: botsLoading } = useBots()
  const { formats, loading: formatsLoading } = useTimeFormats()

  const selectedFormat: TimeFormat | undefined = useMemo(
    () => formats.find((f) => f.id === timeFormatId),
    [formats, timeFormatId],
  )

  useEffect(() => {
    if (bots.length > 0 && selectedBot === '') {
      setSelectedBot(bots[0].id)
    }
    if (bots.length > 0 && whiteBot === '') setWhiteBot(bots[0].id)
    if (bots.length > 0 && blackBot === '') setBlackBot(bots[0].id)
  }, [bots, selectedBot, whiteBot, blackBot])

  const { state, error, joinQueue, cancelQueue } = useMatchmaking()

  async function handlePlay() {
    if (opponentType === 'bot-vs-bot') {
      setBotVsBotError(null)
      setBotVsBotSubmitting(true)
      try {
        const res = await fetch('/api/matches/bot-vs-bot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            white_bot_id: whiteBot,
            black_bot_id: blackBot,
            time_format_id: timeFormatId,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Failed to start bot match.' }))
          setBotVsBotError(data.error ?? 'Failed to start bot match.')
          return
        }
        const data: { match_id: string } = await res.json()
        router.push(ROUTES.watchMatch(data.match_id))
      } finally {
        setBotVsBotSubmitting(false)
      }
      return
    }

    const request: QueueRequest =
      opponentType === 'bot'
        ? { time_format_id: timeFormatId, opponent: { type: 'bot', bot_id: selectedBot } }
        : { time_format_id: timeFormatId, opponent: { type: 'human' }, allow_flagged: allowFlagged }
    await joinQueue(request)
  }

  return (
    <>
      <div className="flex items-center justify-center flex-1 px-4 py-10">
        <div className="w-full max-w-2xl">
          <h1 className="mb-6 text-2xl font-bold text-text-primary">New game</h1>

          {/* Opponent type */}
          <fieldset className="mb-6">
            <legend className="mb-2 text-sm font-medium text-text-secondary">
              Opponent
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {(['human', 'bot', 'bot-vs-bot'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOpponentType(type)}
                  className={[
                    'rounded-xl border py-3 text-sm font-medium transition-all cursor-pointer',
                    opponentType === type
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-bg-secondary text-text-secondary hover:border-accent/40',
                  ].join(' ')}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {type === 'human' ? <Swords size={15} /> : type === 'bot' ? <Bot size={15} /> : <Users size={15} />}
                    {type === 'human' ? 'Human' : type === 'bot' ? 'Bot' : 'Bot vs Bot'}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Bot picker — single bot */}
          {opponentType === 'bot' && (
            <fieldset className="mb-6">
              <legend className="mb-2 text-sm font-medium text-text-secondary">
                Select bot
              </legend>
              {botsLoading ? (
                <p className="text-sm text-text-muted">Loading bots…</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {bots.map((bot) => (
                    <button
                      key={bot.id}
                      type="button"
                      onClick={() => setSelectedBot(bot.id)}
                      className={[
                        'group relative rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer',
                        selectedBot === bot.id
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-bg-secondary hover:border-accent/40',
                      ].join(' ')}
                    >
                      <div className={`text-sm font-medium ${selectedBot === bot.id ? 'text-accent' : 'text-text-primary'}`}>
                        {bot.name}
                      </div>
                      <div className="text-xs text-text-muted">{bot.elo} ELO</div>
                      {selectedFormat && (
                        <div className="text-xs text-text-muted">{formatTimeFormatDuration(selectedFormat)}</div>
                      )}
                      <div className="mt-1 text-xs text-text-muted line-clamp-3">{bot.description}</div>
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-lg border border-border bg-bg-primary p-3 text-xs text-text-secondary shadow-xl opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                        {bot.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </fieldset>
          )}

          {/* Bot pickers — bot-vs-bot */}
          {opponentType === 'bot-vs-bot' && (
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <BotPicker label="White" bots={bots} loading={botsLoading} value={whiteBot} onChange={setWhiteBot} />
              <BotPicker label="Black" bots={bots} loading={botsLoading} value={blackBot} onChange={setBlackBot} />
            </div>
          )}

          {/* Time format */}
          <fieldset className="mb-8">
            <legend className="mb-2 text-sm font-medium text-text-secondary">
              Time format
            </legend>
            {formatsLoading ? (
              <p className="text-sm text-text-muted">Loading formats…</p>
            ) : (
              <div className="space-y-3">
                {CATEGORY_ORDER.map((category) => {
                  const inCategory = formats.filter((f) => f.category === category)
                  if (inCategory.length === 0) return null
                  return (
                    <div key={category}>
                      <div className="mb-1 text-xs uppercase tracking-wide text-text-muted">
                        {CATEGORY_LABELS[category]}
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {inCategory.map((tf) => (
                          <button
                            key={tf.id}
                            type="button"
                            onClick={() => setTimeFormatId(tf.id)}
                            className={[
                              'rounded-xl border px-3 py-3 text-center transition-all cursor-pointer',
                              timeFormatId === tf.id
                                ? 'border-accent bg-accent/10'
                                : 'border-border bg-bg-secondary hover:border-accent/40',
                            ].join(' ')}
                          >
                            <div className={`text-sm font-semibold ${timeFormatId === tf.id ? 'text-accent' : 'text-text-primary'}`}>
                              {formatTimeFormatLabel(tf)}
                            </div>
                            <div className="text-xs text-text-muted mt-0.5">
                              {formatTimeFormatDuration(tf)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </fieldset>

          {/* Anti-cheat matchmaking filter — human opponents only */}
          {opponentType === 'human' && (
            <label className="mb-8 flex items-start gap-3 rounded-xl border border-border bg-bg-secondary px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowFlagged}
                onChange={(e) => setAllowFlagged(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-accent cursor-pointer"
              />
              <span>
                <span className="block text-sm font-medium text-text-primary">
                  Allow flagged players
                </span>
                <span className="block text-xs text-text-muted">
                  Off by default — you won&apos;t be matched with players flagged by anti-cheat.
                </span>
              </span>
            </label>
          )}

          {(error || botVsBotError) && (
            <p className="mb-4 rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
              {botVsBotError ?? error}
            </p>
          )}

          <Button
            size="lg"
            onClick={handlePlay}
            loading={state === 'waiting' || botVsBotSubmitting}
            className="w-full"
          >
            {opponentType === 'bot'
              ? 'Play vs bot'
              : opponentType === 'bot-vs-bot'
                ? 'Start bot vs bot'
                : 'Find opponent'}
          </Button>
        </div>
      </div>

      <MatchmakingModal
        isOpen={state === 'waiting' && opponentType === 'human'}
        onCancel={cancelQueue}
      />
    </>
  )
}

function BotPicker({
  label,
  bots,
  loading,
  value,
  onChange,
}: {
  label: string
  bots: { id: string; name: string; elo: number }[]
  loading: boolean
  value: string
  onChange: (id: string) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-text-secondary">{label} bot</legend>
      {loading ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary"
        >
          {bots.map((bot) => (
            <option key={bot.id} value={bot.id}>
              {bot.name} ({bot.elo})
            </option>
          ))}
        </select>
      )}
    </fieldset>
  )
}

export default function PlayPage() {
  return (
    <Suspense>
      <PlayForm />
    </Suspense>
  )
}
