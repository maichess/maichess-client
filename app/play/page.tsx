'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import { Button } from '@/lib/components/ui/Button'
import { MatchmakingModal } from '@/lib/components/MatchmakingModal'
import { useMatchmaking } from '@/lib/hooks/useMatchmaking'
import { useBots } from '@/lib/hooks/useBots'
import type { QueueRequest, TimeControl } from '@/lib/models/queue'

const TIME_CONTROLS: { value: TimeControl; label: string; description: string }[] = [
  { value: 'bullet', label: 'Bullet', description: '≤ 3 min' },
  { value: 'blitz', label: 'Blitz', description: '3–10 min' },
  { value: 'rapid', label: 'Rapid', description: '10–60 min' },
  { value: 'classical', label: 'Classical', description: '> 60 min' },
]

function PlayForm() {
  const searchParams = useSearchParams()
  const isBot = searchParams.get('opponent') === 'bot'

  const [timeControl, setTimeControl] = useState<TimeControl>('blitz')
  const [opponentType, setOpponentType] = useState<'human' | 'bot'>(
    isBot ? 'bot' : 'human'
  )
  const [selectedBot, setSelectedBot] = useState('')
  const { bots, loading: botsLoading } = useBots()

  useEffect(() => {
    if (bots.length > 0 && selectedBot === '') {
      setSelectedBot(bots[0].id)
    }
  }, [bots, selectedBot])

  const { state, error, joinQueue, cancelQueue } = useMatchmaking()

  async function handlePlay() {
    const request: QueueRequest =
      opponentType === 'bot'
        ? { time_control: timeControl, opponent: { type: 'bot', bot_id: selectedBot } }
        : { time_control: timeControl, opponent: { type: 'human' } }
    await joinQueue(request)
  }

  return (
    <>
      <div className="flex items-center justify-center flex-1 px-4 py-10">
        <div className="w-full max-w-lg">
          <h1 className="mb-6 text-2xl font-bold text-text-primary">New game</h1>

          {/* Opponent type */}
          <fieldset className="mb-6">
            <legend className="mb-2 text-sm font-medium text-text-secondary">
              Opponent
            </legend>
            <div className="flex gap-2">
              {(['human', 'bot'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOpponentType(type)}
                  className={[
                    'flex-1 rounded-xl border py-3 text-sm font-medium capitalize transition-all cursor-pointer',
                    opponentType === type
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-bg-secondary text-text-secondary hover:border-accent/40',
                  ].join(' ')}
                >
                  {type === 'human' ? '⚔ Human' : '🤖 Bot'}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Bot selector */}
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
                        'rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer',
                        selectedBot === bot.id
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-bg-secondary hover:border-accent/40',
                      ].join(' ')}
                    >
                      <div className={`text-sm font-medium ${selectedBot === bot.id ? 'text-accent' : 'text-text-primary'}`}>
                        {bot.name}
                      </div>
                      <div className="text-xs text-text-muted">{bot.elo} ELO</div>
                    </button>
                  ))}
                </div>
              )}
            </fieldset>
          )}

          {/* Time control */}
          <fieldset className="mb-8">
            <legend className="mb-2 text-sm font-medium text-text-secondary">
              Time control
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TIME_CONTROLS.map((tc) => (
                <button
                  key={tc.value}
                  type="button"
                  onClick={() => setTimeControl(tc.value)}
                  className={[
                    'rounded-xl border px-3 py-3 text-center transition-all cursor-pointer',
                    timeControl === tc.value
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-bg-secondary hover:border-accent/40',
                  ].join(' ')}
                >
                  <div className={`text-sm font-semibold ${timeControl === tc.value ? 'text-accent' : 'text-text-primary'}`}>
                    {tc.label}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">{tc.description}</div>
                </button>
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="mb-4 rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button
            size="lg"
            onClick={handlePlay}
            loading={state === 'waiting'}
            className="w-full"
          >
            {opponentType === 'bot' ? 'Play vs bot' : 'Find opponent'}
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

export default function PlayPage() {
  return (
    <Suspense>
      <PlayForm />
    </Suspense>
  )
}
