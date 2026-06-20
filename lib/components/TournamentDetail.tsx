'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { useTournament } from '@/lib/hooks/useTournament'
import { useTournamentBots } from '@/lib/hooks/useTournamentBots'
import { useRegisteredBots } from '@/lib/hooks/useRegisteredBots'
import { useTournamentStream } from '@/lib/hooks/useTournamentStream'
import { TournamentStandings } from './TournamentStandings'
import { TournamentRounds } from './TournamentRounds'
import { TournamentAnalytics } from './TournamentAnalytics'
import { Spinner } from '@/lib/components/ui/Spinner'
import { Button } from '@/lib/components/ui/Button'
import type { BotRegistration } from '@/lib/models/tournament'

interface Props {
  id: string
}

type Tab = 'standings' | 'rounds' | 'analytics'

function formatClock(clock: { limit: number; increment: number }): string {
  const mins = Math.floor(clock.limit / 60)
  return clock.increment > 0 ? `${mins}+${clock.increment}` : `${mins} min`
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    created: 'bg-bg-elevated text-text-muted',
    started: 'bg-accent/10 text-accent',
    finished: 'bg-bg-elevated text-text-muted',
  }
  return (
    <span className={[
      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
      colors[status] ?? colors.created,
    ].join(' ')}>
      {status === 'started' ? 'live' : status}
    </span>
  )
}

export function TournamentDetail({ id }: Props) {
  const router = useRouter()
  const { data, loading, error, refresh, startTournament, registerBot, addParticipant, withdrawBot, deleteTournament } = useTournament(id)
  const { bots } = useTournamentBots()
  const { bots: registeredBots } = useRegisteredBots()
  const [tab, setTab] = useState<Tab>('standings')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectedBot, setSelectedBot] = useState('')
  const [selectedRegistryBot, setSelectedRegistryBot] = useState('')

  const onStreamEvent = useCallback(() => {
    refresh()
  }, [refresh])

  useTournamentStream(id, onStreamEvent, data?.tournament.status === 'started')

  async function handleAction(action: () => Promise<void>) {
    setActionLoading(true)
    setActionError(null)
    try {
      await action()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
        {error ?? 'Tournament not found'}
      </div>
    )
  }

  const { tournament, is_director, registrations } = data
  const standings = tournament.standing?.players ?? []
  const isCreated = tournament.status === 'created'
  const isStarted = tournament.status === 'started'
  const isFinished = tournament.status === 'finished'
  const tabs: Tab[] = isFinished ? ['standings', 'rounds', 'analytics'] : ['standings', 'rounds']
  const registeredBotIds = new Set(registrations.map((r: BotRegistration) => r.maichess_bot_id))
  const availableBots = bots.filter((b) => !registeredBotIds.has(b.id))
  // Registry bots that map to a maichess bot and aren't already in this tournament.
  const availableRegistryBots = registeredBots.filter(
    (b) => b.maichess_bot_id && !registeredBotIds.has(b.maichess_bot_id))

  const inputClass =
    'rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">{tournament.fullName}</h1>
            <StatusBadge status={tournament.status} />
          </div>
          <div className="mt-1 text-sm text-text-muted">
            {formatClock(tournament.clock)} · {tournament.format} · {tournament.nbRounds} rounds · {tournament.nbPlayers} player{tournament.nbPlayers === 1 ? '' : 's'}
            {isStarted && tournament.round != null && ` · Round ${tournament.round}`}
          </div>
        </div>

        {!isCreated && (
          <a
            href={`/api/tournaments/${id}/export`}
            className="shrink-0 rounded-lg border border-border bg-bg-secondary px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:border-accent/50 hover:text-accent"
          >
            Download PGN
          </a>
        )}
      </div>

      {actionError && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          {actionError}
        </div>
      )}

      {isCreated && (
        <div className="rounded-xl border border-border bg-bg-secondary p-4 space-y-3">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Register Bots</h3>

          {registrations.length > 0 && (
            <div className="space-y-1">
              {registrations.map((reg: BotRegistration) => (
                <div key={reg.registration_id} className="flex items-center justify-between rounded-lg bg-bg-elevated px-3 py-2">
                  <span className="text-sm text-text-primary font-medium">{reg.maichess_bot_id}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAction(() => withdrawBot(reg.maichess_bot_id))}
                    loading={actionLoading}
                  >
                    Withdraw
                  </Button>
                </div>
              ))}
            </div>
          )}

          {availableBots.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                className={inputClass}
                value={selectedBot}
                onChange={(e) => setSelectedBot(e.target.value)}
              >
                <option value="">Select bot...</option>
                {availableBots.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.elo})</option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={() => handleAction(async () => {
                  await registerBot(selectedBot)
                  setSelectedBot('')
                })}
                disabled={!selectedBot}
                loading={actionLoading}
              >
                Register
              </Button>
            </div>
          )}

          {is_director && availableRegistryBots.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                className={inputClass}
                value={selectedRegistryBot}
                onChange={(e) => setSelectedRegistryBot(e.target.value)}
              >
                <option value="">Add from registry…</option>
                {availableRegistryBots.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <Button
                size="sm"
                variant="ghost"
                disabled={!selectedRegistryBot}
                loading={actionLoading}
                onClick={() => {
                  const registry = availableRegistryBots.find((b) => b.id === selectedRegistryBot)
                  if (!registry?.maichess_bot_id) return
                  return handleAction(async () => {
                    await addParticipant(registry.maichess_bot_id!, registry.id)
                    setSelectedRegistryBot('')
                  })
                }}
              >
                Add
              </Button>
            </div>
          )}

          {is_director && (
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <Button
                size="sm"
                onClick={() => handleAction(startTournament)}
                disabled={tournament.nbPlayers < 2}
                loading={actionLoading}
              >
                Start Tournament
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleAction(async () => {
                  await deleteTournament()
                  router.push(ROUTES.tournaments)
                })}
                loading={actionLoading}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      )}

      {registrations.length > 0 && isStarted && (
        <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 text-sm text-accent">
          Playing as {registrations.map((r: BotRegistration) => r.maichess_bot_id).join(', ')}
        </div>
      )}

      <div className="flex items-center gap-0.5 rounded-full border border-border bg-bg-secondary p-0.5 w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'rounded-full px-4 py-1.5 text-xs font-medium transition-all capitalize',
              tab === t ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-bg-secondary overflow-hidden">
        {tab === 'standings' && <TournamentStandings standings={standings} />}
        {tab === 'rounds' && <TournamentRounds tournamentId={id} nbRounds={tournament.nbRounds} currentRound={tournament.round} />}
        {tab === 'analytics' && <TournamentAnalytics id={id} enabled={isFinished} />}
      </div>
    </div>
  )
}
