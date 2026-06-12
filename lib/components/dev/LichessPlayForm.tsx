'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTournamentBots } from '@/lib/hooks/useTournamentBots'
import { useLichessPlay, type LichessMode } from '@/lib/hooks/useLichessPlay'
import { ROUTES } from '@/lib/constants/routes'
import { Button } from '@/lib/components/ui/Button'

const inputClass =
  'w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none'

const OPPONENT_AI = 'ai'

export function LichessPlayForm() {
  const { bots, loading: botsLoading } = useTournamentBots()
  const { submit, submitting, error, matchId } = useLichessPlay()

  const [mode, setMode] = useState<LichessMode>('challenge')
  const [botId, setBotId] = useState('')
  const [token, setToken] = useState('')

  // challenge mode
  const [opponentKind, setOpponentKind] = useState<'ai' | 'user'>('ai')
  const [username, setUsername] = useState('')
  const [level, setLevel] = useState(3)
  const [clockLimit, setClockLimit] = useState(300)
  const [clockIncrement, setClockIncrement] = useState(2)

  // existing-game mode
  const [gameId, setGameId] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'challenge') {
      await submit('challenge', {
        bot_id: botId,
        lichess_token: token,
        opponent: opponentKind === 'ai' ? OPPONENT_AI : username,
        level,
        clock_limit: clockLimit,
        clock_increment: clockIncrement,
      })
    } else {
      await submit('existing', { bot_id: botId, lichess_token: token, game_id: gameId })
    }
  }

  const canSubmit =
    botId !== '' &&
    token !== '' &&
    (mode === 'existing'
      ? gameId !== ''
      : opponentKind === 'ai' || username !== '')

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-bg-secondary p-4 space-y-4">
      <div className="flex gap-2">
        <ModeTab active={mode === 'challenge'} onClick={() => setMode('challenge')}>
          Challenge opponent
        </ModeTab>
        <ModeTab active={mode === 'existing'} onClick={() => setMode('existing')}>
          Existing game id
        </ModeTab>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </div>
      )}

      {matchId && (
        <div className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-text-primary">
          Game started.{' '}
          <Link href={ROUTES.watchMatch(matchId)} className="font-semibold text-accent underline">
            Watch it →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-text-muted">Maichess bot</label>
          <select
            className={inputClass}
            value={botId}
            onChange={(e) => setBotId(e.target.value)}
            disabled={botsLoading}
            required
          >
            <option value="">Select a bot…</option>
            {bots.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.elo})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-text-muted">Lichess bot token</label>
          <input
            type="password"
            className={inputClass}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="lip_…"
            required
          />
        </div>

        {mode === 'challenge' ? (
          <>
            <div>
              <label className="mb-1 block text-xs text-text-muted">Opponent</label>
              <select
                className={inputClass}
                value={opponentKind}
                onChange={(e) => setOpponentKind(e.target.value as 'ai' | 'user')}
              >
                <option value="ai">Lichess AI (Stockfish)</option>
                <option value="user">Lichess user / bot</option>
              </select>
            </div>

            {opponentKind === 'ai' ? (
              <div>
                <label className="mb-1 block text-xs text-text-muted">Stockfish level (1–8)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  min={1}
                  max={8}
                  required
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs text-text-muted">Lichess username</label>
                <input
                  className={inputClass}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="maia1"
                  required
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-text-muted">Clock (base seconds + increment)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className={inputClass}
                  value={clockLimit}
                  onChange={(e) => setClockLimit(Number(e.target.value))}
                  min={0}
                  placeholder="300"
                  required
                />
                <input
                  type="number"
                  className={inputClass}
                  value={clockIncrement}
                  onChange={(e) => setClockIncrement(Number(e.target.value))}
                  min={0}
                  placeholder="2"
                  required
                />
              </div>
            </div>
          </>
        ) : (
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-text-muted">Lichess game id</label>
            <input
              className={inputClass}
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="j0nPtcjl"
              required
            />
          </div>
        )}
      </div>

      <p className="text-xs text-text-muted">
        The maichess engine plays our moves on Lichess; the game is mirrored here as a read-only,
        unrated external match. A user challenge only starts once the opponent accepts.
      </p>

      <div className="flex justify-end">
        <Button type="submit" loading={submitting} disabled={!canSubmit}>
          {mode === 'challenge' ? 'Challenge & play' : 'Attach & play'}
        </Button>
      </div>
    </form>
  )
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-accent/15 text-accent'
          : 'text-text-muted hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  )
}
